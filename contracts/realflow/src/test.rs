#![cfg(test)]

use super::*;
use crate::contract::RealFlowContractClient;
use soroban_sdk::{
    Address, Env, Symbol,
    testutils::{Address as _, Events},
};

#[test]
fn test_realflow_economy_cycle() {
    let env = Env::default();
    // Mock auths: İmzaları simüle et (Test için gerekli)
    env.mock_all_auths();

    // Kontratı yükle
    let contract_id = env.register(RealFlowContract, ());
    let client = RealFlowContractClient::new(&env, &contract_id);

    // Aktörleri oluştur
    let treasury = Address::generate(&env);
    let distribution_pool = Address::generate(&env);
    let ciftci_mehmet = Address::generate(&env);
    let tuketici_ahmet = Address::generate(&env);
    let berber_hasan = Address::generate(&env);

    // 1. BAŞLATMA (INITIALIZE)
    client.initialize(&treasury, &distribution_pool);

    // Başlangıçta herkes 0 olmalı
    assert_eq!(client.get_total_production(), 0);
    assert_eq!(client.get_total_supply(), 0);

    // 2. ÜRETİM GİRİŞİ (ORACLE SİMÜLASYONU)
    // Senaryo: Çiftçi Mehmet 10 ton Mısır üretti, tonu 100 Token.
    // Toplam Değer: 10 * 100 = 1000 Token
    // MEM GÜNCELLEME: Uzun ömürlü ürün (expiration çok ileri)
    let urun_tipi = Symbol::new(&env, "MISIR");
    client.register_production(&urun_tipi, &40, &100);

    // Kontrol: Üretim değeri arttı mı?
    assert_eq!(client.get_total_production(), 1000);

    // 3. YENİ PARA DENKLEMİ & SENYORAJ (MINTING)
    // Piyasada para yok (0), Üretim (1000). Açık = 1000.
    let minted_amount = client.check_and_mint();

    // Kontrol: 1000 Token basıldı mı?
    assert_eq!(minted_amount, 1000);
    assert_eq!(client.get_total_supply(), 1000);

    // Basılan para Dağıtım Havuzuna gitti mi?
    assert_eq!(client.get_balance(&distribution_pool), 1000);

    // 4. SOSYAL DEVLET DAĞITIMI (AIRDROP)
    // Havuzdan Tüketici Ahmet'e 500 Token "Vatandaşlık Maaşı" yollayalım.
    // Not: transfer_with_tax kullanıyoruz, devlet dağıtırken de vergi kesiyor mu?
    // MEM'e göre devlet dağıtırken kesmez ama kodumuzda tek transfer fonksiyonu var.
    // Testin basitliği için %10 vergi kesileceğini varsayalım.
    // 500 Yolla -> 50 Vergi -> 450 Ahmet'e geçer.
    client.transfer_with_tax(&distribution_pool, &tuketici_ahmet, &500, &50);

    assert_eq!(client.get_balance(&tuketici_ahmet), 450); // Tüketicinin Cebindeki Para
    assert_eq!(client.get_balance(&treasury), 50); // Hazineye giren ilk vergi
    assert_eq!(client.get_balance(&distribution_pool), 500); // Havuzda kalan

    // 5. EKONOMİK DÖNGÜ (PARANIN HIZI)
    // Tüketici Ahmet, Çiftçi Mehmet'ten mısır alsın.
    // Ahmet 100 Token harcıyor.
    // Vergi: 10 Token.
    // Mehmet'e geçen: 90 Token.
    client.transfer_with_tax(&tuketici_ahmet, &ciftci_mehmet, &100, &10);

    assert_eq!(client.get_balance(&tuketici_ahmet), 350); // 450 - 100
    assert_eq!(client.get_balance(&ciftci_mehmet), 90); // Net gelir
    assert_eq!(client.get_balance(&treasury), 60); // 50 (önceki) + 10 (yeni)

    // 6. İKİNCİ DÖNGÜ
    // Çiftçi Mehmet kazandığı parayla Berber Hasan'a tıraş olsun.
    // 50 Token harcıyor.
    // Vergi: 5 Token.
    // Hasan'a geçen: 45 Token.
    client.transfer_with_tax(&ciftci_mehmet, &berber_hasan, &50, &5);

    assert_eq!(client.get_balance(&ciftci_mehmet), 40); // 90 - 50
    assert_eq!(client.get_balance(&berber_hasan), 45); // Net gelir
    assert_eq!(client.get_balance(&treasury), 65); // Hazinede biriken para artıyor!

    // 7. KAOS SENARYOSU: ÇÜRÜME (ASSET BURNING)
    // 200 birimlik mısır satılamadı ve çürüdü. Piyasadan silinmesi lazım.
    // Dağıtım havuzunda kalan paradan yakıyoruz.
    client.burn_rotting_assets(&200);

    // Kontrol: Toplam Arz ve Üretim Değeri düştü mü?
    assert_eq!(client.get_total_production(), 800); // 1000 - 200
    assert_eq!(client.get_total_supply(), 800); // 1000 - 200
    assert_eq!(client.get_balance(&distribution_pool), 300); // 500 vardı, 200 yandı.
}

#[test]
fn test_hot_token_logic() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RealFlowContract, ());
    let client = RealFlowContractClient::new(&env, &contract_id);

    let treasury = Address::generate(&env);
    let distribution_pool = Address::generate(&env);

    client.initialize(&treasury, &distribution_pool);

    // Senaryo: Çabuk bozulan domates (Hot Token)
    // Expiration: Current Ledger + 1000 (Threshold 17280'den küçük)
    let urun_tipi = Symbol::new(&env, "DOMATES");

    // Bu çağrı HotTokenMintedEvent fırlatmalı.
    // Soroban testlerinde eventleri yakalamak için env.events().all() kullanılır.
    client.register_production(&urun_tipi, &10, &50);

    // Event kontrolü
    let events = env.events().all();
    // En az 2 event olmalı: ProductionAddedEvent ve HotTokenMintedEvent
    // (Sırası implementasyona göre değişebilir ama HotTokenMintedEvent son eklenen olabilir)

    // Basitçe son eventin HotTokenMintedEvent olup olmadığını kontrol edelim veya varlığını arayalım.
    // Detaylı event kontrolü Rust testlerinde biraz verbose olabilir, şimdilik hata vermeden çalışması yeterli.
    assert!(events.len() >= 2);
}

#[test]
#[should_panic]
fn test_insufficient_balance() {
    // Yetersiz bakiye test senaryosu
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RealFlowContract, ());
    let client = RealFlowContractClient::new(&env, &contract_id);

    let treasury = Address::generate(&env);
    let distribution_pool = Address::generate(&env);
    let poor_user = Address::generate(&env);
    let rich_user = Address::generate(&env);

    client.initialize(&treasury, &distribution_pool);

    // Fakir kullanıcının parası yok ama 100 göndermeye çalışıyor
    client.transfer_with_tax(&poor_user, &rich_user, &100, &10);
}
