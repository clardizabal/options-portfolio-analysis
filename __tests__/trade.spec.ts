import { Trade, CallOrPut, InstrumentType, Action, TransactionType } from "../app";
describe('Trade', () => {
    const genericTransaction = {
        instrumentType: 'Equity Option' as InstrumentType,
        commissions: -1,
        fees: -0.14,
        multiplier: 100,
        type: 'Trade' as TransactionType,
        description: 'generic',
    }
    const sellTransaction = {
        ...genericTransaction,
        action: 'SELL_TO_OPEN' as Action,
    }
    const buyTransaction = {
        ...genericTransaction,
        action: 'BUY_TO_OPEN' as Action,
    }
    const SHORT_OTM_PUT = {
        callOrPut: 'PUT' as CallOrPut,
        ticker: 'IWM',
        value: 207,
        quantity: 1,
        strike: '141',
        expirationDate: '2/15/2019',
        date: '2019-01-07T10:21:05-0500',
        action: 'SELL_TO_OPEN',
        ...sellTransaction,
    };
    const LONG_OTM_PUT = {
        callOrPut: 'PUT' as CallOrPut,
        ticker: 'IWM',
        value: -125,
        quantity: 1,
        strike: '136',
        expirationDate: '2/15/2019',
        date: '2019-01-07T10:21:05-0500',
        action: 'BUY_TO_OPEN',
        ...buyTransaction,
    };
    const LONG_OTM_CALL = {
        callOrPut: 'CALL' as CallOrPut,
        ticker: 'IWM',
        value: -46,
        quantity: 1,
        strike: '159',
        expirationDate: '2/15/2019',
        date: '2019-01-07T10:21:05-0500',
        action: 'BUY_TO_OPEN',
        ...buyTransaction,
    };
    const SHORT_OTM_CALL = {
        callOrPut: 'CALL' as CallOrPut,
        ticker: 'IWM',
        value: 145,
        quantity: 1,
        strike: '154',
        expirationDate: '2/15/2019',
        date: '2019-01-07T10:21:05-0500',
        action: 'SELL_TO_OPEN',
        ...sellTransaction,
    };

    test('trade type should be credit positive option values', () => {
        const options = [SHORT_OTM_PUT];
        const trade = new Trade(options);
        expect(trade.type).toBe('credit');
    });

    test('trade type should be debit for negative option values', () => {
        const options = [LONG_OTM_CALL];
        const trade = new Trade(options);
        expect(trade.type).toBe('debit');
    });

    test('multi leg options', () => {
        const options = [
            SHORT_OTM_PUT,
            SHORT_OTM_CALL,
            LONG_OTM_CALL,
        ]
        const trade = new Trade(options);
        expect(trade.type).toBe('credit');
    });

    test('single leg strategy type', () => {
        const options = [SHORT_OTM_PUT];
        const trade = new Trade(options);
        expect(trade.strategy).toBe('NAKED');
    });

    test('multi leg custom strategy type', () => {
        const options = [
            SHORT_OTM_PUT,
            SHORT_OTM_CALL,
            LONG_OTM_CALL,
        ]
        const trade = new Trade(options);
        expect(trade.strategy).toBe('CUSTOM');
    });

    test('multi short put short call strategy is a strangle', () => {
        const options = [SHORT_OTM_PUT, SHORT_OTM_CALL];
        const trade = new Trade(options);
        expect(trade.strategy).toBe('STRANGLE');
    });

    test('multi short call and long call strategy is a vertical spread', () => {
        const options = [LONG_OTM_CALL, SHORT_OTM_CALL];
        const trade = new Trade(options);
        expect(trade.strategy).toBe('VERTICAL_SPREAD');
    });
    test('multi four leg strategy is an iron condor with correct trade value', () => {
        const options = [
            LONG_OTM_CALL,
            SHORT_OTM_CALL,
            SHORT_OTM_PUT,
            LONG_OTM_PUT
        ];
        const trade = new Trade(options);
        expect(trade.strategy).toBe('IRON_CONDOR');
        expect(trade.value).toBe(181);
    });
});