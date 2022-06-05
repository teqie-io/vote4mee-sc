use anchor_lang::prelude::*;
use anchor_spl::{associated_token, token};


use crate::schema::*;

#[derive(Accounts)]
pub struct CreateAdmin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Admin::SIZE,
    )]
    pub admin: Account<'info, Admin>,
    pub mint: Box<Account<'info, token::Mint>>,
    // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec(ctx: Context<CreateAdmin>, start_date: i64, end_date: i64) -> Result<()> {
    let admin = &mut ctx.accounts.admin;
    admin.start_date = start_date;
    admin.end_date = end_date;
    admin.mint = ctx.accounts.mint.key();
    Ok(())
}