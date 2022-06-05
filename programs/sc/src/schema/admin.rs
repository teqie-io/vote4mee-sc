use anchor_lang::prelude::*;

#[account]
pub struct Admin {
    pub mint: Pubkey,
    pub start_date: i64,
    pub end_date: i64,
}

impl Admin {
    pub const SIZE: usize = 8 + 32 + 8 + 8;
}