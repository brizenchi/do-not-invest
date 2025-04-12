module InvestmentFlow::Stream {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    // 投资流数据结构
    struct InvestmentStream has store {
        sender: address,           // 发起人地址
        recipient: address,        // 目标协议地址（如 Amnis Finance）
        total_amount: u64,        // 总投资金额
        released_amount: u64,     // 已释放金额
        rate_per_second: u64,     // 每秒释放速率
        start_time: u64,          // 开始时间
        end_time: u64,            // 结束时间
        is_active: bool,          // 是否活跃
        event_condition: vector<u8>, // 事件触发条件（如 "apy_above_5"）
    }

    // 存储所有流的全局资源
    struct StreamStore has key {
        streams: vector<InvestmentStream>,
    }

    // 初始化全局存储
    public entry fun initialize(account: &signer) {
        let sender = signer::address_of(account);
        move_to(account, StreamStore { streams: vector::empty() });
    }

    // 创建时间触发投资流
    public entry fun create_stream(
        sender: &signer,
        recipient: address,
        total_amount: u64,
        rate_per_second: u64,
        duration: u64
    ) acquires StreamStore {
        let sender_addr = signer::address_of(sender);
        let start_time = timestamp::now_seconds();
        let stream = InvestmentStream {
            sender: sender_addr,
            recipient,
            total_amount,
            released_amount: 0,
            rate_per_second,
            start_time,
            end_time: start_time + duration,
            is_active: true,
            event_condition: vector::empty(),
        };

        // 锁定资金到合约
        coin::transfer<0x1::aptos_coin::AptosCoin>(sender, @InvestmentFlow, total_amount);

        // 存储流
        let store = borrow_global_mut<StreamStore>(@InvestmentFlow);
        vector::push_back(&mut store.streams, stream);
    }

    // 创建事件触发投资流
    public entry fun create_event_stream(
        sender: &signer,
        recipient: address,
        total_amount: u64,
        condition: vector<u8>
    ) acquires StreamStore {
        let sender_addr = signer::address_of(sender);
        let stream = InvestmentStream {
            sender: sender_addr,
            recipient,
            total_amount,
            released_amount: 0,
            rate_per_second: 0,
            start_time: timestamp::now_seconds(),
            end_time: 0,
            is_active: true,
            event_condition: condition,
        };

        // 锁定资金
        coin::transfer<0x1::aptos_coin::AptosCoin>(sender, @InvestmentFlow, total_amount);

        // 存储流
        let store = borrow_global_mut<StreamStore>(@InvestmentFlow);
        vector::push_back(&mut store.streams, stream);
    }

    // 提取时间触发投资
    public entry fun claim(stream_id: u64, recipient: &signer) acquires StreamStore {
        let store = borrow_global_mut<StreamStore>(@InvestmentFlow);
        let stream = vector::borrow_mut(&mut store.streams, stream_id);
        assert!(stream.is_active, 1001);
        assert!(signer::address_of(recipient) == stream.recipient, 1002);

        let current_time = timestamp::now_seconds();
        let payable = (current_time - stream.start_time) * stream.rate_per_second;
        if (payable + stream.released_amount > stream.total_amount) {
            payable = stream.total_amount - stream.released_amount;
        };

        // 释放资金到目标协议
        coin::transfer<0x1::aptos_coin::AptosCoin>(@InvestmentFlow, stream.recipient, payable);
        stream.released_amount = stream.released_amount + payable;

        // 如果流耗尽，标记为非活跃
        if (stream.released_amount == stream.total_amount) {
            stream.is_active = false;
        };
    }

    // 触发事件投资
    public entry fun trigger_event(stream_id: u64, oracle_data: vector<u8>) acquires StreamStore {
        let store = borrow_global_mut<StreamStore>(@InvestmentFlow);
        let stream = vector::borrow_mut(&mut store.streams, stream_id);
        assert!(stream.is_active, 1001);
        assert!(stream.event_condition == oracle_data, 1003);

        // 释放全部资金
        let payable = stream.total_amount - stream.released_amount;
        coin::transfer<0x1::aptos_coin::AptosCoin>(@InvestmentFlow, stream.recipient, payable);
        stream.released_amount = stream.total_amount;
        stream.is_active = false;
    }

    // 查询流状态
    public fun get_stream_status(stream_id: u64): (bool, u64, u64, address) acquires StreamStore {
        let store = borrow_global<StreamStore>(@InvestmentFlow);
        let stream = vector::borrow(&store.streams, stream_id);
        (stream.is_active, stream.total_amount, stream.released_amount, stream.recipient)
    }
}