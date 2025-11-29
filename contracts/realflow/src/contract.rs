use soroban_sdk::{Address, Env, Map, Symbol, contract, contractevent, contractimpl, symbol_short};

#[contract]
pub struct RealFlowContract;

// Veri Anahtarları (State Keys)
const TOTAL_PRODUCTION_VALUE: Symbol = symbol_short!("TOT_PROD"); // P_F (Toplam Üretim Değeri)
const TOTAL_MONEY_SUPPLY: Symbol = symbol_short!("TOT_SUP"); // P_T (Piyasadaki Para)
const TREASURY_ADDRESS: Symbol = symbol_short!("TREASURY"); // Vergi Kasası
const DISTRIBUTION_POOL: Symbol = symbol_short!("DIST_POOL"); // Hibe Havuzu
const BALANCES: Symbol = symbol_short!("BALANCES"); // Cüzdan Bakiyeleri

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProductionAddedEvent {
    pub product_type: Symbol,
    pub value: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MintedEvent {
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BurnedEvent {
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionVelocityEvent {
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct HotTokenMintedEvent {
    pub product_type: Symbol,
    pub amount: i128,
    pub expiration_ledger: u32,
}

#[contractimpl]
impl RealFlowContract {
    /// 1. BAŞLATMA: Hazine ve Dağıtım Havuzu adreslerini ayarlar.
    pub fn initialize(env: Env, treasury: Address, distribution_pool: Address) {
        env.storage()
            .persistent()
            .set(&TOTAL_PRODUCTION_VALUE, &0i128);
        env.storage().persistent().set(&TOTAL_MONEY_SUPPLY, &0i128);
        env.storage().persistent().set(&TREASURY_ADDRESS, &treasury);
        env.storage()
            .persistent()
            .set(&DISTRIBUTION_POOL, &distribution_pool);
    }

    /// 2. ORACLE FONKSİYONU: Üretimi Sisteme Girer.
    /// Burası "Mısır, 10 Ton, 100 Token" verisinin girildiği yerdir.
    /// Sadece miktar değil, DEĞER (Fiyat * Miktar) hesaplar.
    /// MEM GÜNCELLEMESİ: expiration_ledger parametresi eklendi.
    pub fn register_production(
        env: Env,
        product_type: Symbol,
        quantity: i128,
        price_per_unit: i128,
        expiration_ledger: u32,
    ) {
        // Ekonomik Değeri Hesapla (10 Ton * 100 Birim Fiyat = 1000 Birim Değer)
        let production_value = quantity * price_per_unit;

        let current_prod: i128 = env
            .storage()
            .persistent()
            .get(&TOTAL_PRODUCTION_VALUE)
            .unwrap_or(0);
        let new_prod = current_prod + production_value;

        // Toplam Üretim Değerini Güncelle
        env.storage()
            .persistent()
            .set(&TOTAL_PRODUCTION_VALUE, &new_prod);

        // Frontend için Event fırlat (Grafikte Arzın arttığını göstermek için)
        ProductionAddedEvent {
            product_type: product_type.clone(),
            value: production_value,
        }
        .publish(&env);

        // MEM: Hot Token Kontrolü
        // Eğer ürünün ömrü kısaysa (örneğin şu anki ledger'dan 1 gün (17280 ledger) sonrasından azsa)
        // Bu bir "Hot Token" durumudur.
        let current_ledger = env.ledger().sequence();
        // Basitlik için 17280 ledger (yaklaşık 1 gün) eşik değeri olarak alındı.
        // Gerçek hayatta bu parametrik olabilir.
        let threshold = 17280;

        if expiration_ledger > current_ledger && (expiration_ledger - current_ledger) < threshold {
            HotTokenMintedEvent {
                product_type,
                amount: production_value,
                expiration_ledger,
            }
            .publish(&env);
        }
    }

    /// 3. YENİ PARA DENKLEMİ (CORE LOGIC)
    /// Arz > Talep ise Para Bas (Senyoraj).
    /// Bu fonksiyon "Dengeleyici"dir.
    pub fn check_and_mint(env: Env) -> i128 {
        let total_production: i128 = env
            .storage()
            .persistent()
            .get(&TOTAL_PRODUCTION_VALUE)
            .unwrap_or(0);
        let total_supply: i128 = env
            .storage()
            .persistent()
            .get(&TOTAL_MONEY_SUPPLY)
            .unwrap_or(0);

        // Açığı Hesapla (Üretim - Para)
        let gap = total_production - total_supply;

        if gap > 0 {
            // Yeni arzı güncelle
            let new_supply = total_supply + gap;
            env.storage()
                .persistent()
                .set(&TOTAL_MONEY_SUPPLY, &new_supply);

            // Parayı Bas ve Dağıtım Havuzuna Yolla
            let distribution_pool: Address =
                env.storage().persistent().get(&DISTRIBUTION_POOL).unwrap();
            Self::mint_internal(&env, &distribution_pool, gap);

            // Olayı Yayınla: "Para Basıldı"
            MintedEvent { amount: gap }.publish(&env);

            gap // Basılan miktarı döndür
        } else {
            0 // Denge var veya Para > Üretim (Enflasyonist durum, basım yok)
        }
    }

    /// 4. KAOS YÖNETİMİ: "Çürüme / Stok İmha"
    /// Eğer domates satılamaz ve çürürse, piyasadaki karşılığı olmayan parayı yakar.
    /// Bu fonksiyon "Deflasyon/Enflasyon Dengeleyicisi"dir.
    pub fn burn_rotting_assets(env: Env, value_lost: i128) {
        let current_prod: i128 = env
            .storage()
            .persistent()
            .get(&TOTAL_PRODUCTION_VALUE)
            .unwrap_or(0);

        // Üretim değerini düşür (Çünkü mal çürüdü)
        if current_prod >= value_lost {
            env.storage()
                .persistent()
                .set(&TOTAL_PRODUCTION_VALUE, &(current_prod - value_lost));
        }

        // Piyasadan Para Çek (Burn) - Hazine veya Dağıtım Havuzundan sil
        // Basitleştirmek için Dağıtım Havuzundan siliyoruz.
        let distribution_pool: Address =
            env.storage().persistent().get(&DISTRIBUTION_POOL).unwrap();
        Self::burn_internal(&env, &distribution_pool, value_lost);

        let current_supply: i128 = env
            .storage()
            .persistent()
            .get(&TOTAL_MONEY_SUPPLY)
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&TOTAL_MONEY_SUPPLY, &(current_supply - value_lost));

        BurnedEvent { amount: value_lost }.publish(&env);
    }

    /// 5. PARANIN HIZI: Vergilendirilmiş Transfer
    /// MEM: "Para döndükçe devlet kazanır."
    /// Normal transfer yerine bu kullanılır. %10 komisyon keser.
    pub fn transfer_with_tax(env: Env, from: Address, to: Address, amount: i128, tax: i128) {
        from.require_auth(); // İşlemi yapanın imzası şart

        let amount_after_tax = amount - tax;

        let treasury: Address = env.storage().persistent().get(&TREASURY_ADDRESS).unwrap();

        // Alıcıya parayı yolla
        Self::transfer_internal(&env, &from, &to, amount_after_tax);

        // Vergiyi Hazineye yolla
        Self::transfer_internal(&env, &from, &treasury, tax);

        // Hız Eventi (Frontend'de Hacim göstermek için)
        TransactionVelocityEvent { amount }.publish(&env);
    }

    // --- Bakiye Yönetimi (Internal Helpers) ---

    fn mint_internal(env: &Env, to: &Address, amount: i128) {
        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or(Map::new(env));
        let current_balance = balances.get(to.clone()).unwrap_or(0);
        balances.set(to.clone(), current_balance + amount);
        env.storage().persistent().set(&BALANCES, &balances);
    }

    fn burn_internal(env: &Env, from: &Address, amount: i128) {
        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or(Map::new(env));
        let current_balance = balances.get(from.clone()).unwrap_or(0);

        // Negatif bakiye kontrolü (Basit tutuldu)
        if current_balance >= amount {
            balances.set(from.clone(), current_balance - amount);
        } else {
            balances.set(from.clone(), 0); // Sıfırla
        }
        env.storage().persistent().set(&BALANCES, &balances);
    }

    fn transfer_internal(env: &Env, from: &Address, to: &Address, amount: i128) {
        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or(Map::new(env));

        let from_balance = balances.get(from.clone()).unwrap_or(0);
        if from_balance < amount {
            panic!("Yetersiz Bakiye! Para hızı durdu :)");
        }

        balances.set(from.clone(), from_balance - amount);

        let to_balance = balances.get(to.clone()).unwrap_or(0);
        balances.set(to.clone(), to_balance + amount);

        env.storage().persistent().set(&BALANCES, &balances);
    }

    // Bakiye Sorgulama (Frontend için gerekli)
    pub fn get_balance(env: Env, address: Address) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        balances.get(address).unwrap_or(0)
    }

    // Toplam Üretim Değerini Sorgulama (Dashboard için)
    pub fn get_total_production(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&TOTAL_PRODUCTION_VALUE)
            .unwrap_or(0)
    }

    // Toplam Para Arzını Sorgulama (Dashboard için)
    pub fn get_total_supply(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&TOTAL_MONEY_SUPPLY)
            .unwrap_or(0)
    }
}
