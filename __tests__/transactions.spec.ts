import {
    Transaction,
    CallOrPut,
    Trade,
    Action,
    Portfolio,
    Option,
    InstrumentType,
    TransactionType,
    addDecimal
} from '../app';

describe('Evaluate Portfolio', () => {
    const portfolio = new Portfolio();
    // A trade is a single or multiple transactions
    // with the same date and ticker,
    // and all legs with action: *_TO_OPEN
    const unusedColumns = {
        'Average Price': '0',
        Multiplier: '100',
        Description: 'description',
        Symbol: 'ABC 123JAN000'
    }
    const transactions: Transaction[] = [
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '528',
            Quantity: '1',
            'Strike Price': '165',
            'Expiration Date': '2/15/2019',
            Date: '2019-01-08T12:01:40-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_OPEN',
            Value: '-414',
            Quantity: '1',
            'Strike Price': '167',
            'Expiration Date': '2/15/2019',
            Date: '2019-01-08T12:01:40-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '260',
            Quantity: '1',
            'Strike Price': '165',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:41:20-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_OPEN',
            Value: '-190',
            Quantity: '1',
            'Strike Price': '167',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:41:20-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_CLOSE',
            Value: '238',
            Quantity: '1',
            'Strike Price': '167',
            'Expiration Date': '2/15/2019',
            Date: '2019-01-25T10:41:20-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_CLOSE',
            Value: '-348',
            Quantity: '1',
            'Strike Price': '165', 
            'Expiration Date': '2/15/2019',
            Date: '2019-01-25T10:41:20-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'XOP' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '79',
            Quantity: '1',
            'Strike Price': '29',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:41:31-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'XOP' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '72',
            Quantity: '1',
            'Strike Price': '32',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:41:31-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'IWM' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '207',
            Quantity: '1',
            'Strike Price': '141',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:47:18-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'IWM' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_OPEN',
            Value: '-125',
            Quantity: '1',
            'Strike Price': '136',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:47:18-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'IWM' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_OPEN',
            Value: '-46',
            Quantity: '1',
            'Strike Price': '159',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:47:18-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'IWM' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '145',
            Quantity: '1',
            'Strike Price': '154',
            'Expiration Date': '3/15/2019',
            Date: '2019-01-25T10:47:18-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'SNAP' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '33',
            Quantity: '1',
            'Strike Price': '6.50',
            'Expiration Date': '2/15/2019',
            Date: '2019-02-05T10:42:06-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'SNAP' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_CLOSE',
            Value: '-2',
            Quantity: '1',
            'Strike Price': '6.50',
            'Expiration Date': '2/15/2019',
            Date: '2019-02-06T09:46:35-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'M' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '66',
            Quantity: '1',
            'Strike Price': '22',
            'Expiration Date': '5/17/2019',
            Date: '2019-03-26T11:05:58-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'EWZ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_OPEN' as Action,
            Value: '-186',
            Quantity: '1',
            'Strike Price': '39',
            'Expiration Date': '5/17/2019',
            Date: '2019-03-28T09:32:24-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'EWZ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '-2',
            Type: 'Trade',
            Fees: '-0.28',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '222',
            Quantity: '2',
            'Strike Price': '37',
            'Expiration Date': '5/17/2019',
            Date: '2019-03-28T09:32:25-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'M' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'BUY_TO_CLOSE',
            Value: '-33',
            Quantity: '1',
            'Strike Price': '22',
            'Expiration Date': '5/17/2019',
            Date: '2019-04-05T13:28:28-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'EWZ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_CLOSE' as Action,
            Value: '51',
            Quantity: '1',
            'Strike Price': '39',
            'Expiration Date': '5/17/2019',
            Date: '2019-03-28T09:32:24-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'EWZ' as CallOrPut,
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.28',
            Action: 'BUY_TO_CLOSE' as Action,
            Value: '-48',
            Quantity: '2',
            'Strike Price': '37',
            'Expiration Date': '5/17/2019',
            Date: '2019-03-28T09:32:25-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'X',
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN' as Action,
            Value: '48',
            Quantity: '1',
            'Strike Price': '13',
            'Expiration Date': '7/19/2019',
            Date: '2019-06-13T10:23:10-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'X',
            'Instrument Type': 'Equity Option',
            Commissions: '-1',
            Type: 'Trade',
            Fees: '-0.14',
            Action: 'SELL_TO_OPEN',
            Value: '55',
            Quantity: '1',
            'Strike Price': '15',
            'Expiration Date': '7/19/2019',
            Date: '2019-06-13T10:23:10-0400',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'X',
            'Instrument Type': 'Equity Option',
            Commissions: '-2',
            Type: 'Trade',
            Fees: '-0.28',
            Action: 'SELL_TO_OPEN',
            Value: '90',
            Quantity: '2',
            'Strike Price': '13',
            'Expiration Date': '1/17/2020',
            Date: '2019-11-22T11:35:06-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'X',
            'Instrument Type': 'Equity Option',
            Commissions: '-2',
            Type: 'Trade',
            Fees: '-0.28',
            Action: 'SELL_TO_OPEN',
            Value: '95',
            Quantity: '2',
            'Strike Price': '13',
            'Expiration Date': '1/17/2020',
            Date: '2019-11-23T11:35:06-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'PUT' as CallOrPut,
            'Underlying Symbol': 'X',
            'Instrument Type': 'Equity Option',
            Commissions: '0',
            Type: 'Trade',
            Fees: '-0.28',
            Action: 'BUY_TO_CLOSE',
            Value: '-45',
            Quantity: '1',
            'Strike Price': '13',
            'Expiration Date': '1/17/2020',
            Date: '2019-11-24T11:35:06-0500',
            ...unusedColumns,
        },
    ]
    portfolio.parseTransactions(transactions);
    test('evaluate correct number of trades', () => {
        expect(portfolio.numberOfTrades).toBe(9);
        const commissions = transactions.reduce((sum, transaction) => {
            return sum += Number(transaction.Commissions);
        }, 0);
        const fees = transactions.reduce((sum, transaction) => {
            return addDecimal(sum, Number(transaction.Fees));
        }, 0)
        expect(portfolio.totalCommission).toBe(commissions);
        expect(portfolio.totalFees).toBe(fees);
        for(let key in portfolio.trades) {
            expect(portfolio.trades[key]).toBeInstanceOf(Trade);
        }
    });

    test('evaluate a custom trade', () => {
        const customTrades = portfolio.getAllTradesByTicker('EWZ');
        const customTrade = customTrades[0];
        expect(customTrade).toBeInstanceOf(Trade);
        expect(customTrade.strategy).toBe('CUSTOM');
    });

    test('close trade partial quantity', () => {
        const nakedTrades = portfolio.getAllTradesByTicker('X');
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
        const adjustedTrades = portfolio.getAllTradesByTicker('QQQ');
        const adjustedTrade = adjustedTrades[0];
        expect(adjustedTrade).toBeInstanceOf(Trade);
        const mappedLegs = adjustedTrade.legs;
        expect(mappedLegs['165CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['167CALL3/15/2019']).toBeInstanceOf(Option);
        expect(mappedLegs['165CALL3/15/2019'].expirationDate).toBe('3/15/2019');
        expect(mappedLegs['167CALL3/15/2019'].expirationDate).toBe('3/15/2019');
    });

    test('closing a trade', () => {
        const snapTrades = portfolio.getAllTradesByTicker('SNAP');
        const snapTrade = snapTrades[0];
        expect(snapTrade).toBeInstanceOf(Trade);
        expect(snapTrade.value).toBe(31);
        const snapLegs = snapTrade.legs;
        expect(Object.keys(snapLegs).length).toBe(0);
    });

    test('closing a trade after a roll', () => {
        const closingTransactions = [{
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option' as InstrumentType,
            Type: 'Trade' as TransactionType,
            Fees: '-0.14',
            Commissions: '0',
            Action: 'SELL_TO_CLOSE' as Action,
            Value: '835',
            Quantity: '1',
            'Strike Price': '167',
            'Expiration Date': '3/15/2019',
            Date: '2019-02-25T11:07:12-0500',
            ...unusedColumns,
        },
        {
            'Call or Put': 'CALL' as CallOrPut,
            'Underlying Symbol': 'QQQ' as CallOrPut,
            'Instrument Type': 'Equity Option' as InstrumentType,
            Type: 'Trade' as TransactionType,
            Commissions: '0',
            Fees: '-0.14',
            Action: 'BUY_TO_CLOSE' as Action,
            Value: '-1020',
            Quantity: '1',
            'Strike Price': '165',
            'Expiration Date': '3/15/2019',
            Date: '2019-02-25T11:07:12-0500',
            ...unusedColumns,
        }];
        portfolio.parseTransactions(closingTransactions);
        const qqqTrades = portfolio.getAllTradesByTicker('QQQ');
        const qqqTrade = qqqTrades[0];
        expect(qqqTrade).toBeInstanceOf(Trade);
        expect(qqqTrade.value).toBe(-111);
        const qqqLegs = qqqTrade.legs;
        expect(qqqLegs['165CALL3/15/2019']).toBeUndefined;
        expect(qqqLegs['167CALL3/15/2019']).toBeUndefined;
    });

    test('rolling a trade', () => {
        const rollTransactions = [
            {
                'Call or Put': 'PUT' as CallOrPut,
                'Underlying Symbol': 'X',
                'Instrument Type': 'Equity Option' as InstrumentType,
                Commissions: '-1',
                Type: 'Trade' as TransactionType,
                Fees: '-0.14',
                Action: 'SELL_TO_OPEN' as Action,
                Value: '107',
                Quantity: '1',
                'Strike Price': '14',
                'Expiration Date': '8/16/2019',
                Date: '2019-06-25T09:42:02-0400',
                ...unusedColumns,
            },
            {
                'Call or Put': 'CALL' as CallOrPut,
                'Underlying Symbol': 'X',
                'Instrument Type': 'Equity Option' as InstrumentType,
                Commissions: '0',
                Type: 'Trade' as TransactionType,
                Fees: '-0.14',
                Action: 'BUY_TO_CLOSE' as Action,
                Value: '-45',
                Quantity: '1',
                'Strike Price': '15',
                'Expiration Date': '7/19/2019',
                Date: '2019-06-25T09:42:02-0400',
                ...unusedColumns,
            },
            {
                'Call or Put': 'CALL' as CallOrPut,
                'Underlying Symbol': 'X',
                'Instrument Type': 'Equity Option' as InstrumentType,
                Commissions: '-1',
                Type: 'Trade' as TransactionType,
                Fees: '-0.14',
                Action: 'SELL_TO_OPEN' as Action,
                Value: '58',
                Quantity: '1',
                'Strike Price': '16',
                'Expiration Date': '8/16/2019',
                Date: '2019-06-25T09:42:02-0400',
                ...unusedColumns,
            },
            {
                'Call or Put': 'PUT' as CallOrPut,
                'Underlying Symbol': 'X',
                'Instrument Type': 'Equity Option' as InstrumentType,
                Commissions: '0',
                Type: 'Trade' as TransactionType,
                Fees: '-0.14',
                Action: 'BUY_TO_CLOSE' as Action,
                Value: '-27',
                Quantity: '1',
                'Strike Price': '13',
                'Expiration Date': '7/19/2019',
                Date: '2019-06-25T09:42:02-0400',
                ...unusedColumns,
            },
        ];

        let xTrades = portfolio.getAllTradesByTicker('X');
        let xTrade = xTrades[0];
        let xLegs = xTrade.legs;
        expect(xLegs['13PUT7/19/2019']).toBeInstanceOf(Option);
        expect(xLegs['15CALL7/19/2019']).toBeInstanceOf(Option);
        portfolio.parseTransactions(rollTransactions);
        
        xTrades = portfolio.getAllTradesByTicker('X');
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
        expect(portfolio.tradeHistory.length).toBe(4);
        const rpl = portfolio.tradeHistory.reduce((sum, trade) => {
            return sum += trade.profitLoss;
        }, 0)
        expect(portfolio.profit).toBe(rpl);
        expect(portfolio.totalCommission).toBe(-23);
        expect(portfolio.totalFees).toBe(-5.04);
    });
});
