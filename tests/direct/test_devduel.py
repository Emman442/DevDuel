"""Direct-mode tests for DevDuel"""

import pytest

CONTRACT = "contracts/devduel.py"

def deploy(direct_vm, direct_deploy, owner):
    direct_vm.sender = owner
    direct_vm.value = 0
    return direct_deploy(
        CONTRACT,
        str(owner),
        sdk_version="v0.2.16",
    )

def pay(direct_vm, amount_gen: int):
    # Contract expects whole GEN; gltest value is in wei
    direct_vm.value = amount_gen * 10**18

def rejects(direct_vm, match):
    try:
        return direct_vm.expect_revert(match)
    except Exception:
        return pytest.raises((AssertionError, Exception), match=match)

def mock_github_merged(direct_vm):
    direct_vm.mock_web(
        r"api\.github\.com/repos/.*",
        {"status": 200, "body": '{"merged": true, "merged_at": "2026-10-20T00:00:00Z"}'},
    )
    direct_vm.mock_llm(r"merged", "YES")

def mock_github_open(direct_vm):
    direct_vm.mock_web(
        r"api\.github\.com/repos/.*",
        {"status": 200, "body": '{"merged": false, "state": "open"}'},
    )
    direct_vm.mock_llm(r"merged", "NO")

def create_basic(
    contract,
    claim="Will the example repository PR #1 be merged before the deadline?",
    duration=3600,
):
    return contract.create_market(
        claim,
        "YES if the pull request is merged before the deadline. NO otherwise.",
        "https://api.github.com/repos/example/repo/pulls/1",
        duration,
    )

def test_constructor_sets_admin(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    admin = contract.get_admin()
    assert admin == str(direct_owner)

def test_create_market_basic(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract)
    assert market_id.startswith("market_")

    row = contract.get_market(market_id)
    assert row.claim.startswith("Will the example")
    assert row.status == "open"
    assert row.yes_pool == 0
    assert row.no_pool == 0

def test_create_market_rejects_bad_url(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    with rejects(direct_vm, "https"):
        contract.create_market(
            "This claim is long enough to pass the length check.",
            "Criteria here that is long enough for validation.",
            "http://not-https.com",
            3600,
        )

def test_create_market_rejects_short_claim(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    with rejects(direct_vm, "claim"):
        contract.create_market(
            "short",
            "Criteria here that is long enough for validation.",
            "https://api.github.com/repos/example/repo/pulls/1",
            3600,
        )

def test_create_market_rejects_short_duration(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    with rejects(direct_vm, "duration"):
        create_basic(contract, duration=60)

def test_stake_yes_and_no(direct_vm, direct_deploy, direct_owner, direct_alice):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract)

    direct_vm.sender = direct_alice
    pay(direct_vm, 10)
    contract.stake(market_id, "YES")

    direct_vm.sender = direct_owner
    pay(direct_vm, 5)
    contract.stake(market_id, "NO")

    row = contract.get_market(market_id)
    assert row.yes_pool == 10
    assert row.no_pool == 5

def test_stake_rejects_bad_side(direct_vm, direct_deploy, direct_owner, direct_alice):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract)

    direct_vm.sender = direct_alice
    pay(direct_vm, 10)
    with rejects(direct_vm, "side"):
        contract.stake(market_id, "MAYBE")

def test_resolve_rejects_before_deadline(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract, duration=3600)
    with rejects(direct_vm, "deadline"):
        contract.resolve_market(market_id)

def test_cancel_empty_market(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract)
    contract.cancel_market(market_id)

    row = contract.get_market(market_id)
    assert row.status == "cancelled"

def test_cancel_rejects_with_stakes(direct_vm, direct_deploy, direct_owner, direct_alice):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    market_id = create_basic(contract)

    direct_vm.sender = direct_alice
    pay(direct_vm, 10)
    contract.stake(market_id, "YES")

    with rejects(direct_vm, "stake"):
        contract.cancel_market(market_id)

def test_get_open_markets(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    create_basic(contract)
    create_basic(contract, claim="Will the second example PR be merged before the deadline?")

    markets = contract.get_open_markets()
    assert len(markets) == 2

def test_get_total_markets(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    assert contract.get_total_markets() == 0
    create_basic(contract)
    assert contract.get_total_markets() == 1