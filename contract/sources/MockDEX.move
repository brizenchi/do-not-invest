module InvestmentFlow::MockDEX {
    use std::signer;
    use aptos_framework::coin;
    use InvestmentFlow::Token::BTC;
    use 0x1::aptos_coin::AptosCoin;

    struct LiquidityPool has key {
        apt_reserve: coin::Coin<AptosCoin>,
        btc_reserve: coin::Coin<BTC>,
    }

    const E_POOL_NOT_INITIALIZED: u64 = 2001;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 2002;
    const E_INVALID_CONDITION: u64 = 2003;

    public entry fun initialize(account: &signer, apt_amount: u64, btc_amount: u64) {
        let sender = signer::address_of(account);
        if (!coin::is_account_registered<BTC>(sender)) {
            coin::register<BTC>(account);
        };
        if (!coin::is_account_registered<AptosCoin>(sender)) {
            coin::register<AptosCoin>(account);
        };
        if (!exists<LiquidityPool>(sender)) {
            let btc_coins = coin::withdraw<BTC>(account, btc_amount);
            let apt_coins = coin::withdraw<AptosCoin>(account, apt_amount);
            move_to(account, LiquidityPool {
                apt_reserve: apt_coins,
                btc_reserve: btc_coins,
            });
        };
    }

    public fun swap_apt_to_btc(apt_coins: coin::Coin<AptosCoin>): coin::Coin<BTC> acquires LiquidityPool {
        let apt_amount = coin::value(&apt_coins);
        assert!(apt_amount > 0, E_INVALID_CONDITION);

        let pool_addr = @InvestmentFlow;
        assert!(exists<LiquidityPool>(pool_addr), E_POOL_NOT_INITIALIZED);

        let pool = borrow_global_mut<LiquidityPool>(pool_addr);
        coin::merge(&mut pool.apt_reserve, apt_coins);

        let btc_amount = apt_amount / 10000;
        assert!(btc_amount > 0, E_INVALID_CONDITION);
        assert!(coin::value(&pool.btc_reserve) >= btc_amount, E_INSUFFICIENT_LIQUIDITY);

        coin::extract(&mut pool.btc_reserve, btc_amount)
    }

    #[view]
    public fun get_pool_reserves(account: address): (u64, u64) acquires LiquidityPool {
        let pool = borrow_global<LiquidityPool>(account);
        (coin::value(&pool.apt_reserve), coin::value(&pool.btc_reserve))
    }
}