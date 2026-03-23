#![no_std]

pub mod errors;
pub mod storage_types;

pub use crate::errors::InsightArenaError;
pub use crate::storage_types::{DataKey, InviteCode, Market, Prediction, Season, UserProfile};

use soroban_sdk::{contract, contractimpl};

#[contract]
pub struct InsightArenaContract;

#[contractimpl]
impl InsightArenaContract {
    // Contract modules (market, prediction, user, leaderboard, season, invite)
    // will be implemented here using the canonical DataKey enum.
}
