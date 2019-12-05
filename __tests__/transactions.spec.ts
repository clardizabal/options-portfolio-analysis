import {
    Transaction,
    CallOrPut,
    TransactionDTO,
    Trade,
    Action,
    openingTrade,
    Portfolio,
    Option,
    adjustmentTrade,
    closingTrade,
    InstrumentType,
    TransactionType,
    parseLegs,
    addDecimal
} from '../src';

describe('Evaluate Portfolio', () => {
    const portfolio = new Portfolio();
    // A trade is a single or multiple transactions
    // with the same date and ticker,
    // and all legs with action: *_TO_OPEN
    const transactions: Transaction[] = [
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 528,
            quantity: 1,
            strike: 165,
            expirationDate: '2/15/2019',
            date: '2019-01-08T12:01:40-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_OPEN',
            value: -414,
            quantity: 1,
            strike: 167,
            expirationDate: '2/15/2019',
            date: '2019-01-08T12:01:40-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 260,
            quantity: 1,
            strike: 165,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:41:20-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_OPEN',
            value: -190,
            quantity: 1,
            strike: 167,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:41:20-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_CLOSE',
            value: 238,
            quantity: 1,
            strike: 167,
            expirationDate: '2/15/2019',
            date: '2019-01-25T10:41:20-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_CLOSE',
            value: -348,
            quantity: 1,
            strike: 165,    
            expirationDate: '2/15/2019',
            date: '2019-01-25T10:41:20-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'XOP' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 79,
            quantity: 1,
            strike: 29,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:41:31-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'XOP' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 72,
            quantity: 1,
            strike: 32,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:41:31-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'IWM' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 207,
            quantity: 1,
            strike: 141,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:47:18-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'IWM' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_OPEN',
            value: -125,
            quantity: 1,
            strike: 136,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:47:18-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'IWM' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_OPEN',
            value: -46,
            quantity: 1,
            strike: 159,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:47:18-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'IWM' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 145,
            quantity: 1,
            strike: 154,
            expirationDate: '3/15/2019',
            date: '2019-01-25T10:47:18-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'SNAP' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 33,
            quantity: 1,
            strike: 6.50,
            expirationDate: '2/15/2019',
            date: '2019-02-05T10:42:06-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'SNAP' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_CLOSE',
            value: -2,
            quantity: 1,
            strike: 6.50,
            expirationDate: '2/15/2019',
            date: '2019-02-06T09:46:35-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'M' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 66,
            quantity: 1,
            strike: 22,
            expirationDate: '5/17/2019',
            date: '2019-03-26T11:05:58-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'EWZ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_OPEN' as Action,
            value: -186,
            quantity: 1,
            strike: 39,
            expirationDate: '5/17/2019',
            date: '2019-03-28T09:32:24-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'EWZ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: -2,
            type: 'Trade',
            fees: -0.28,
            action: 'SELL_TO_OPEN' as Action,
            value: 222,
            quantity: 2,
            strike: 37,
            expirationDate: '5/17/2019',
            date: '2019-03-28T09:32:25-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'M' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.14,
            action: 'BUY_TO_CLOSE',
            value: -33,
            quantity: 1,
            strike: 22,
            expirationDate: '5/17/2019',
            date: '2019-04-05T13:28:28-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'EWZ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_CLOSE' as Action,
            value: 51,
            quantity: 1,
            strike: 39,
            expirationDate: '5/17/2019',
            date: '2019-03-28T09:32:24-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'EWZ' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.28,
            action: 'BUY_TO_CLOSE' as Action,
            value: -48,
            quantity: 2,
            strike: 37,
            expirationDate: '5/17/2019',
            date: '2019-03-28T09:32:25-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'X',
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN' as Action,
            value: 48,
            quantity: 1,
            strike: 13,
            expirationDate: '7/19/2019',
            date: '2019-06-13T10:23:10-0400',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'X',
            instrumentType: 'Equity Option',
            commissions: -1,
            type: 'Trade',
            fees: -0.14,
            action: 'SELL_TO_OPEN',
            value: 55,
            quantity: 1,
            strike: 15,
            expirationDate: '7/19/2019',
            date: '2019-06-13T10:23:10-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'X',
            instrumentType: 'Equity Option',
            commissions: -2,
            type: 'Trade',
            fees: -0.28,
            action: 'SELL_TO_OPEN',
            value: 90,
            quantity: 2,
            strike: 13,
            expirationDate: '1/17/2020',
            date: '2019-11-22T11:35:06-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'X',
            instrumentType: 'Equity Option',
            commissions: -2,
            type: 'Trade',
            fees: -0.28,
            action: 'SELL_TO_OPEN',
            value: 95,
            quantity: 2,
            strike: 13,
            expirationDate: '1/17/2020',
            date: '2019-11-23T11:35:06-0500',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'X',
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: -0.28,
            action: 'BUY_TO_CLOSE',
            value: -45,
            quantity: 1,
            strike: 13,
            expirationDate: '1/17/2020',
            date: '2019-11-24T11:35:06-0500',
        },
    ]
    portfolio.parseTransactions(transactions);
    test('evaluate correct number of trades', () => {
        expect(portfolio.numberOfTrades).toBe(9);
        const commissions = transactions.reduce((sum, transaction) => {
            return sum += transaction.commissions;
        }, 0);
        const fees = transactions.reduce((sum, transaction) => {
            return addDecimal(sum, transaction.fees);
        }, 0)
        expect(portfolio.totalCommission).toBe(commissions);
        expect(portfolio.totalFees).toBe(fees);
        for(let key in portfolio.trades) {
            expect(portfolio.trades[key]).toBeInstanceOf(Trade);
        }
    });

    test('evaluate a custom trade', () => {
        const customTrades = portfolio.getTradesByTicker('EWZ');
        const customTrade = customTrades[0];
        expect(customTrade).toBeInstanceOf(Trade);
        expect(customTrade.strategy).toBe('CUSTOM');
    });

    test('close trade partial quantity', () => {
        const nakedTrades = portfolio.getTradesByTicker('X');
        nakedTrades.forEach((trade) => {
            if (trade.strategy === 'NAKED' && trade.date === '2019-11-22T11:35:06-0500') {
                expect(trade.legs['13PUT1/17/2020'].quantity).toBe(1);
            }
            if (trade.strategy === 'NAKED' && trade.date === '2019-11-23T11:35:06-0500') {
                expect(trade.legs['13PUT1/17/2020'].quantity).toBe(2);
            }
        })
    })
    
    test('updates trade with adjusted legs', () => {
        // TODO: have a function that returns all trades of an underlying mapped by id
        const adjustedTrades = portfolio.getTradesByTicker('QQQ');
        const adjustedTrade = adjustedTrades[0];
        expect(adjustedTrade).toBeInstanceOf(Trade);
        const mappedLegs = adjustedTrade.legs;
        expect(mappedLegs['165CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['167CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['165CALL3/15/2019'].expirationDate).toBe('3/15/2019');
        expect(mappedLegs['167CALL3/15/2019'].expirationDate).toBe('3/15/2019');
    });

    test('closing a trade', () => {
        const snapTrades = portfolio.getTradesByTicker('SNAP');
        const snapTrade = snapTrades[0];
        expect(snapTrade).toBeInstanceOf(Trade);
        expect(snapTrade.value).toBe(31);
        const snapLegs = snapTrade.legs;
        expect(Object.keys(snapLegs).length).toBe(0);
    });

    test('closing a trade after a roll', () => {
        const closingTransactions = [{
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option' as InstrumentType,
            type: 'Trade' as TransactionType,
            fees: -0.14,
            commissions: 0,
            action: 'SELL_TO_CLOSE' as Action,
            value: 835,
            quantity: 1,
            strike: 167,
            expirationDate: '3/15/2019',
            date: '2019-02-25T11:07:12-0500',
        },
        {
            callOrPut: 'CALL' as CallOrPut,
            ticker: 'QQQ' as CallOrPut,
            instrumentType: 'Equity Option' as InstrumentType,
            type: 'Trade' as TransactionType,
            commissions: 0,
            fees: -0.14,
            action: 'BUY_TO_CLOSE' as Action,
            value: -1020,
            quantity: 1,
            strike: 165,
            expirationDate: '3/15/2019',
            date: '2019-02-25T11:07:12-0500',
        }];
        // var _test = portfolio.getTradesByTicker('QQQ');
        // console.log(_test);
        portfolio.parseTransactions(closingTransactions);
        const qqqTrades = portfolio.getTradesByTicker('QQQ');
        const qqqTrade = qqqTrades[0];
        expect(qqqTrade).toBeInstanceOf(Trade);
        expect(qqqTrade.value).toBe(-111);
        const qqqLegs = qqqTrade.legs;
        expect(qqqLegs['165CALL3/15/2019']).toBeUndefined;
        expect(qqqLegs['167CALL3/15/2019']).toBeUndefined;

        // console.log(portfolio.trades);
    });

    test('rolling a trade', () => {
        const rollTransactions = [
            {
                callOrPut: 'PUT' as CallOrPut,
                ticker: 'X',
                instrumentType: 'Equity Option' as InstrumentType,
                commissions: -1,
                type: 'Trade' as TransactionType,
                fees: -0.14,
                action: 'SELL_TO_OPEN' as Action,
                value: 107,
                quantity: 1,
                strike: 14,
                expirationDate: '8/16/2019',
                date: '2019-06-25T09:42:02-0400',
            },
            {
                callOrPut: 'CALL' as CallOrPut,
                ticker: 'X',
                instrumentType: 'Equity Option' as InstrumentType,
                commissions: 0,
                type: 'Trade' as TransactionType,
                fees: -0.14,
                action: 'BUY_TO_CLOSE' as Action,
                value: -45,
                quantity: 1,
                strike: 15,
                expirationDate: '7/19/2019',
                date: '2019-06-25T09:42:02-0400',
            },
            {
                callOrPut: 'CALL' as CallOrPut,
                ticker: 'X',
                instrumentType: 'Equity Option' as InstrumentType,
                commissions: -1,
                type: 'Trade' as TransactionType,
                fees: -0.14,
                action: 'SELL_TO_OPEN' as Action,
                value: 58,
                quantity: 1,
                strike: 16,
                expirationDate: '8/16/2019',
                date: '2019-06-25T09:42:02-0400',
            },
            {
                callOrPut: 'PUT' as CallOrPut,
                ticker: 'X',
                instrumentType: 'Equity Option' as InstrumentType,
                commissions: 0,
                type: 'Trade' as TransactionType,
                fees: -0.14,
                action: 'BUY_TO_CLOSE' as Action,
                value: -27,
                quantity: 1,
                strike: 13,
                expirationDate: '7/19/2019',
                date: '2019-06-25T09:42:02-0400',
            },
        ];

        let xTrades = portfolio.getTradesByTicker('X');
        let xTrade = xTrades[0];
        let xLegs = xTrade.legs;
        expect(xLegs['13PUT7/19/2019']).toBeInstanceOf(Option);
        expect(xLegs['15CALL7/19/2019']).toBeInstanceOf(Option);
        portfolio.parseTransactions(rollTransactions);
        
        xTrades = portfolio.getTradesByTicker('X');
        xTrade = xTrades[0];
        expect(xTrade).toBeInstanceOf(Trade);
        expect(xTrade.value).toBe(196);
        xLegs = xTrade.legs;
        expect(xLegs['14PUT8/16/2019']).toBeInstanceOf(Option);
        expect(xLegs['16CALL8/16/2019']).toBeInstanceOf(Option);
        expect(xLegs['13PUT7/19/2019']).toBeUndefined;
        expect(xLegs['15CALL7/19/2019']).toBeUndefined;
    });

    test('portfolio has correct P&L', () => {
        console.log(portfolio.tradeHistory);
        expect(portfolio.tradeHistory.length).toBe(4);
        const rpl = portfolio.tradeHistory.reduce((sum, trade) => {
            return sum += trade.profitLoss;
        }, 0)
        expect(portfolio.profit).toBe(rpl);
        expect(portfolio.totalCommission).toBe(-23);
        expect(portfolio.totalFees).toBe(-5.04);
        console.log(portfolio.trades);
    });
});
