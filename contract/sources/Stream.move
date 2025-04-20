module InvestmentFlow::Stream {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use InvestmentFlow::MockDEX;
    use InvestmentFlow::Token::BTC;

    const E_STREAM_INACTIVE: u64 = 1001;
    const E_INVALID_RECIPIENT: u64 = 1002;
    const E_INVALID_CONDITION: u64 = 1003;
    const E_NOT_INITIALIZED: u64 = 1004;
    const E_STREAM_ACTIVE: u64 = 1005;
    const E_INVALID_SENDER: u64 = 1006;
    const E_NO_REMAINING_FUNDS: u64 = 1007;
    const E_INVALID_INTERVAL: u64 = 1008;
    const E_INVESTMENT_NOT_DUE: u64 = 1009;
    const E_INVESTMENT_COMPLETE: u64 = 1010;
    const E_INSUFFICIENT_BTC: u64 = 1011;
    const E_PLAN_ALREADY_EXISTS: u64 = 1012;
    const E_PLAN_ACTIVE_WITHDRAWAL: u64 = 1013;

    struct InvestmentPlan has store {
        investor: address,
        amount_per_investment: u64, 
        interval_seconds: u64,      
        total_investments: u64,    
        investments_made: u64,     
        last_investment_time: u64, 
        is_active: bool,
    }

    struct CoinStore has key {
        apt_coins: coin::Coin<0x1::aptos_coin::AptosCoin>,
        btc_coins: coin::Coin<BTC>,
    }

    struct StreamStore has key {
        plans: vector<InvestmentPlan>,
    }

    
    public entry fun initialize(account: &signer) {
        let sender = signer::address_of(account);
        if (!exists<StreamStore>(sender)) {
            move_to(account, StreamStore {
                plans: vector::empty(),
            });
        };
        if (!exists<CoinStore>(sender)) {
            move_to(account, CoinStore {
                apt_coins: coin::zero<0x1::aptos_coin::AptosCoin>(),
                btc_coins: coin::zero<BTC>(),
            });
        };
        
        if (!coin::is_account_registered<BTC>(sender)) {
            coin::register<BTC>(account);
        };
    }

    
    public entry fun create_investment_plan(
        investor: &signer,
        amount_per_investment: u64,
        interval_seconds: u64,
        total_investments: u64
    ) acquires StreamStore {
        let investor_addr = signer::address_of(investor);
        assert!(exists<StreamStore>(investor_addr), E_NOT_INITIALIZED);
        assert!(interval_seconds > 0, E_INVALID_INTERVAL);
        assert!(total_investments > 0, E_INVALID_CONDITION);

        let plan = InvestmentPlan {
            investor: investor_addr,
            amount_per_investment,
            interval_seconds,
            total_investments,
            investments_made: 0,
            last_investment_time: timestamp::now_seconds(),
            is_active: true,
        };

        let store = borrow_global_mut<StreamStore>(investor_addr);
        vector::push_back(&mut store.plans, plan);
    }

    
    public entry fun execute_investment(investor: &signer, plan_id: u64) acquires StreamStore, CoinStore {
        let investor_addr = signer::address_of(investor);
        let store = borrow_global_mut<StreamStore>(investor_addr);
        let plan = vector::borrow_mut(&mut store.plans, plan_id);

        assert!(plan.is_active, E_STREAM_INACTIVE);
        assert!(plan.investments_made < plan.total_investments, E_INVESTMENT_COMPLETE);

        let current_time = timestamp::now_seconds();
        let next_investment_time = plan.last_investment_time + plan.interval_seconds;
        assert!(current_time >= next_investment_time, E_INVESTMENT_NOT_DUE);
        
        let apt_coins = coin::withdraw<0x1::aptos_coin::AptosCoin>(investor, plan.amount_per_investment);
        let btc_coins = MockDEX::swap_apt_to_btc(apt_coins);
        let coin_store = borrow_global_mut<CoinStore>(investor_addr);
        coin::merge(&mut coin_store.btc_coins, btc_coins);

        plan.investments_made = plan.investments_made + 1;
        plan.last_investment_time = current_time;
        if (plan.investments_made == plan.total_investments) {
            plan.is_active = false;
        };
    }

    
    public entry fun withdraw_btc(account: &signer, amount: u64) acquires CoinStore, StreamStore {
        let addr = signer::address_of(account);
        assert!(exists<StreamStore>(addr), E_NOT_INITIALIZED);
        let store = borrow_global<StreamStore>(addr);
        assert!(vector::length(&store.plans) > 0, E_STREAM_INACTIVE);
        let plan = vector::borrow(&store.plans, 0);
        assert!(!plan.is_active, E_PLAN_ACTIVE_WITHDRAWAL); 

        let coin_store = borrow_global_mut<CoinStore>(addr);
        let balance = coin::value(&coin_store.btc_coins);
        assert!(amount > 0, E_INVALID_CONDITION);
        assert!(balance >= amount, E_INSUFFICIENT_BTC);
        let coins = coin::extract(&mut coin_store.btc_coins, amount);
        coin::deposit<BTC>(addr, coins);
    }

    
    #[view]
    public fun get_investment_plan_status(plan_id: u64, account: address): (bool, u64, u64, u64) acquires StreamStore {
        let store = borrow_global<StreamStore>(account);
        let plan = vector::borrow(&store.plans, plan_id);
        (plan.is_active, plan.amount_per_investment, plan.investments_made, plan.total_investments)
    }

    
    #[view]
    public fun get_btc_balance(account: address): u64 acquires CoinStore {
        let store = borrow_global<CoinStore>(account);
        coin::value(&store.btc_coins)
    }

    #[view]
    public fun get_investment_plan_details(plan_id: u64, account: address): (bool, u64, u64, u64, u64) acquires StreamStore {
        let store = borrow_global<StreamStore>(account);
        let plan = vector::borrow(&store.plans, plan_id);
        (
            plan.is_active,
            plan.amount_per_investment,
            plan.investments_made,
            plan.total_investments,
            plan.last_investment_time
        )
    }
}