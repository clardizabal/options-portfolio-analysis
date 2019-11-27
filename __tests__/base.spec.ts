import { evaluate, BinaryOperation, BinaryOperators, Trade, CallOrPut } from "../src";

describe('Trade', () => {
    const SHORT_OTM_PUT = {
        callOrPut: 'PUT' as CallOrPut,
        ticker: 'QQQ' as CallOrPut,
        value: 207,
        quantity: 1,
        strike: 141,
        expirationDate: new Date('2/15/2019'),
        date: new Date('2019-01-07T10:21:05-0500'),
    };
    const LONG_OTM_PUT = {
        callOrPut: 'PUT' as CallOrPut,
        ticker: 'QQQ' as CallOrPut,
        value: -125,
        quantity: 1,
        strike: 136,
        expirationDate: new Date('2/15/2019'),
        date: new Date('2019-01-07T10:21:05-0500'),
    };
    const LONG_OTM_CALL = {
        callOrPut: 'CALL' as CallOrPut,
        ticker: 'QQQ' as CallOrPut,
        value: -46,
        quantity: 1,
        strike: 159,
        expirationDate: new Date('2/15/2019'),
        date: new Date('2019-01-07T10:21:05-0500'),
    };
    const SHORT_OTM_CALL = {
        callOrPut: 'CALL' as CallOrPut,
        ticker: 'QQQ' as CallOrPut,
        value: 145,
        quantity: 1,
        strike: 154,
        expirationDate: new Date('2/15/2019'),
        date: new Date('2019-01-07T10:21:05-0500'),
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
    test('multi four leg strategy is an iron condor', () => {
        const options = [
            LONG_OTM_CALL,
            SHORT_OTM_CALL,
            SHORT_OTM_PUT,
            LONG_OTM_PUT
        ];
        const trade = new Trade(options);
        expect(trade.strategy).toBe('IRON_CONDOR');
    });
});

describe("Simple expression tests", () => {
    test("Check literal value", () => {
        expect(evaluate({ type: "literal", value: 5 })).toBeCloseTo(5);
    });
    test("Check addition", () => {
        let expr = bin("+", 5, 10);
        expect(evaluate(expr)).toBeCloseTo(15);
    });
    test("Check subtraction", () => {
        let expr = bin("-", 5, 10);
        expect(evaluate(expr)).toBeCloseTo(-5);
    });
    test("Check multiplication", () => {
        let expr = bin("*", 5, 10);
        expect(evaluate(expr)).toBeCloseTo(50);
    });
    test("Check division", () => {
        let expr = bin("/", 10, 5);
        expect(evaluate(expr)).toBeCloseTo(2);
    });
});

function bin(op: BinaryOperators, x: number, y: number): BinaryOperation {
    return {
        type: "binary",
        operator: op,
        left: { type: "literal", value: x },
        right: { type: "literal", value: y },
    };
}
