use anchor_lang::prelude::*;

declare_id!("2b8oryWfrTr8DvYSUWPGyXKoMdxD2m6SenbnpRNjmSgn");

pub mod schema;
pub use schema::*;

pub mod instructions;
pub use instructions::*;

pub mod error;
pub use error::*;

#[program]
pub mod sc {
  use super::*;

  pub fn initialize_candidate(
    ctx: Context<InitializeCandidate>,
  ) -> Result<()> {
    initialize_candidate::exec(ctx)
  }

  pub fn vote(ctx: Context<Vote>, amount: u64) -> Result<()> {
    vote::exec(ctx, amount)
  }

  pub fn close(ctx: Context<Close>) -> Result<()> {
    close::exec(ctx)
  }

  pub fn create_admin(ctx: Context<CreateAdmin>, start_date: i64, end_date: i64) -> Result<()> {
    create_admin::exec(ctx, start_date, end_date)
  }
}

#[derive(Accounts)]
pub struct Initialize {}