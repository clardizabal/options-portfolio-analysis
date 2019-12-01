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
    parseLegs
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            fees: 0,
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
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
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
            fees: 0,
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
            commissions: 0,
            type: 'Trade',
            fees: 0,
            action: 'SELL_TO_OPEN' as Action,
            value: 33,
            quantity: 1,
            strike: 22,
            expirationDate: '5/17/2019',
            date: '2019-03-26T11:05:58-0400',
        },
        {
            callOrPut: 'PUT' as CallOrPut,
            ticker: 'M' as CallOrPut,
            instrumentType: 'Equity Option',
            commissions: 0,
            type: 'Trade',
            fees: 0,
            action: 'BUY_TO_CLOSE',
            value: -33,
            quantity: 1,
            strike: 22,
            expirationDate: '5/17/2019',
            date: '2019-04-05T13:28:28-0400',
        },
    ]
    portfolio.parseTransactions(transactions);
    test('evaluate correct number of trades', () => {
        expect(portfolio.numberOfTrades).toBe(5);
        expect(portfolio.trades['XOP']).toBeInstanceOf(Trade);
        expect(portfolio.trades['IWM']).toBeInstanceOf(Trade);
        expect(portfolio.trades['QQQ']).toBeInstanceOf(Trade);
    });

    test('updates trade with adjusted legs', () => {
        const adjustedTrade = portfolio.trades['QQQ'];
        expect(adjustedTrade).toBeInstanceOf(Trade);
        const mappedLegs = adjustedTrade.legs;
        expect(mappedLegs['165CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['167CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['165CALL3/15/2019'].expirationDate).toBe('3/15/2019');
        expect(mappedLegs['167CALL3/15/2019'].expirationDate).toBe('3/15/2019');
    });

    test('adding a trade', () => {

    });

    test('adjusting a trade', () => {

    });

    test('closing a trade', () => {
        const snapTrade = portfolio.trades['SNAP'];
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
            commissions: 0,
            // type: 'Trade' as TransactionType,
            // fees: 0,
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
            commissions: 0,
            // type: 'Trade' as TransactionType,
            // fees: 0,
            action: 'BUY_TO_CLOSE' as Action,
            value: -1020,
            quantity: 1,
            strike: 165,
            expirationDate: '3/15/2019',
            date: '2019-02-25T11:07:12-0500',
        }];
        portfolio.closeTrade(
            new Trade(closingTransactions),
            parseLegs(closingTransactions));
        
        const qqqTrade = portfolio.trades['QQQ'];
        expect(qqqTrade).toBeInstanceOf(Trade);
        expect(qqqTrade.value).toBe(-111);
        const qqqLegs = qqqTrade.legs;
        expect(qqqLegs['165CALL3/15/2019']).toBeUndefined;
        expect(qqqLegs['167CALL3/15/2019']).toBeUndefined;
    });
});
