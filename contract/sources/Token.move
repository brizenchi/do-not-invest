module InvestmentFlow::Token {
    use std::signer;
    use aptos_framework::managed_coin;
    use aptos_framework::coin;

    struct BTC has key, store {}
    
    public entry fun initialize(account: &signer) {
        managed_coin::initialize<BTC>(
            account,
            b"Mock Bitcoin",
            b"BTC",
            8, 
            true
        );
    }
    
    public entry fun mint(account: &signer, amount: u64) {
        let addr = signer::address_of(account);
        if (!coin::is_account_registered<BTC>(addr)) {
            coin::register<BTC>(account);
        };
        managed_coin::mint<BTC>(account, addr, amount);
    }
}