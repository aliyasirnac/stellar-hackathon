#![no_std]
#![allow(dead_code)]

mod contract;

#[cfg(test)]
mod test;

pub use crate::contract::RealFlowContract;
