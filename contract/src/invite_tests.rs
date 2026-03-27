use soroban_sdk::testutils::{Address as _, Ledger as _};
use soroban_sdk::token::StellarAssetClient;
use soroban_sdk::{symbol_short, vec, Address, Env, String, Symbol, Vec};

use crate::market::CreateMarketParams;
use crate::storage_types::{DataKey, InviteCode};
use crate::{InsightArenaContract, InsightArenaContractClient, InsightArenaError};

fn register_token(env: &Env) -> Address {
    let token_admin = Address::generate(env);
    env.register_stellar_asset_contract_v2(token_admin)
        .address()
}

fn deploy(env: &Env) -> (InsightArenaContractClient<'_>, Address, Address, Address) {
    let id = env.register(InsightArenaContract, ());
    let client = InsightArenaContractClient::new(env, &id);
    let admin = Address::generate(env);
    let oracle = Address::generate(env);
    let xlm_token = register_token(env);
    env.mock_all_auths();
    client.initialize(&admin, &oracle, &200_u32, &xlm_token);
    (client, xlm_token, admin, oracle)
}

fn market_params(env: &Env, is_public: bool) -> CreateMarketParams {
    let now = env.ledger().timestamp();
    CreateMarketParams {
        title: String::from_str(env, "Invite Market"),
        description: String::from_str(env, "Invite flow test market"),
        category: Symbol::new(env, "Sports"),
        outcomes: vec![env, symbol_short!("yes"), symbol_short!("no")],
        end_time: now + 1_000,
        resolution_time: now + 2_000,
        creator_fee_bps: 100,
        min_stake: 10_000_000,
        max_stake: 100_000_000,
        is_public,
    }
}

fn fund(env: &Env, xlm_token: &Address, recipient: &Address, amount: i128) {
    StellarAssetClient::new(env, xlm_token).mint(recipient, &amount);
}

#[test]
fn test_generate_and_redeem_invite_code() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(1_000);

    let (client, _, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let invitee = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));

    let code = client.generate_invite_code(&creator, &private_market_id, &2, &600);
    let redeemed_market_id = client.redeem_invite_code(&invitee, &code);

    assert_eq!(redeemed_market_id, private_market_id);

    let stored_invite: InviteCode = env.as_contract(&client.address, || {
        env.storage()
            .persistent()
            .get(&DataKey::InviteCode(code.clone()))
            .unwrap()
    });
    assert_eq!(stored_invite.current_uses, 1);

    let allowlist: Vec<Address> = env.as_contract(&client.address, || {
        env.storage()
            .persistent()
            .get(&DataKey::MarketAllowlist(private_market_id))
            .unwrap()
    });
    assert!(allowlist.iter().any(|entry| entry == invitee));
}

#[test]
fn test_redeem_expired_code() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_timestamp(5_000);

    let (client, _, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let invitee = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));
    let code = client.generate_invite_code(&creator, &private_market_id, &2, &5);

    env.ledger().set_timestamp(5_006);

    let result = client.try_redeem_invite_code(&invitee, &code);
    assert!(matches!(
        result,
        Err(Ok(InsightArenaError::InviteCodeExpired))
    ));
}

#[test]
fn test_redeem_maxed_out_code() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let invitee_1 = Address::generate(&env);
    let invitee_2 = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));
    let code = client.generate_invite_code(&creator, &private_market_id, &1, &300);

    client.redeem_invite_code(&invitee_1, &code);
    let result = client.try_redeem_invite_code(&invitee_2, &code);

    assert!(matches!(
        result,
        Err(Ok(InsightArenaError::InviteCodeMaxUsed))
    ));
}

#[test]
fn test_private_market_blocks_non_invitees() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let non_invitee = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));
    let result = client.try_submit_prediction(
        &non_invitee,
        &private_market_id,
        &symbol_short!("yes"),
        &10_000_000,
    );

    assert!(matches!(result, Err(Ok(InsightArenaError::Unauthorized))));
}

#[test]
fn test_private_market_allows_invitees() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, xlm_token, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let invitee = Address::generate(&env);
    let public_user = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));
    let public_market_id = client.create_market(&creator, &market_params(&env, true));

    let stake = 20_000_000_i128;
    fund(&env, &xlm_token, &invitee, stake);
    fund(&env, &xlm_token, &public_user, stake);

    let code = client.generate_invite_code(&creator, &private_market_id, &2, &600);
    client.redeem_invite_code(&invitee, &code);

    client.submit_prediction(&invitee, &private_market_id, &symbol_short!("yes"), &stake);
    assert!(client.has_predicted(&private_market_id, &invitee));

    // Public markets bypass invite checks; non-invitees can submit directly.
    client.submit_prediction(&public_user, &public_market_id, &symbol_short!("no"), &stake);
    assert!(client.has_predicted(&public_market_id, &public_user));
}

#[test]
fn test_revoke_invite_code() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, _, _, _) = deploy(&env);
    let creator = Address::generate(&env);
    let attacker = Address::generate(&env);
    let invitee = Address::generate(&env);

    let private_market_id = client.create_market(&creator, &market_params(&env, false));
    let code = client.generate_invite_code(&creator, &private_market_id, &3, &600);

    let unauthorized_revoke = client.try_revoke_invite_code(&attacker, &code);
    assert!(matches!(
        unauthorized_revoke,
        Err(Ok(InsightArenaError::Unauthorized))
    ));

    client.revoke_invite_code(&creator, &code);

    let redeem_after_revoke = client.try_redeem_invite_code(&invitee, &code);
    assert!(matches!(
        redeem_after_revoke,
        Err(Ok(InsightArenaError::InvalidInviteCode))
    ));
}
