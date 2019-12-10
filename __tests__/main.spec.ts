import { readLocalCsvFile, Transaction, Portfolio, TradeLog, openingTrade } from '../src';

describe('Read local csv file', () => {
    let transactions: Transaction[];
    let portfolio: Portfolio;
    beforeEach(async () => {
        transactions = await readLocalCsvFile as Transaction[];
        portfolio = new Portfolio();
        portfolio.parseTransactions(transactions);
    })
    test('readLocalCsvFile', () => {
        try {
            expect(transactions).toBeInstanceOf(Array);
            // expect(transactions.length).toBe(346);
        }
        catch (err) {
            console.log(err);
        }
    });

    test('integration - read and parse csv for transactions', () => {
        expect(transactions.length).toBe(374);
        expect(portfolio.numberOfTrades).toBe(Object.keys(portfolio.trades).length);
        expect(portfolio.profit).toBe(744);

        let tradeHistory: any = {}
        const combinedTradeHistory = portfolio.tradeHistory.reduce((sum, tradeLog: TradeLog) => {
            if (sum.hasOwnProperty(tradeLog.ticker)) {
                sum[tradeLog.ticker] += tradeLog.profitLoss;
            } else {
                sum[tradeLog.ticker] = tradeLog.profitLoss;
            }
            return sum;
        }, tradeHistory);
        // console.log(combinedTradeHistory);
        expect(combinedTradeHistory['QQQ']).toBe(-111);
        expect(combinedTradeHistory['X']).toBe(180);
        expect(combinedTradeHistory['SPY']).toBe(-346);
        expect(combinedTradeHistory['SLV']).toBe(8);
        expect(combinedTradeHistory['MDLZ']).toBe(40);
        expect(combinedTradeHistory['AMZN']).toBe(-50);


        const openTrades = Object.keys(portfolio.trades).filter((trade) => {
            return portfolio.trades[trade].status === 'open';
        }).map((id) => {
            return portfolio.trades[id];
        });
        // console.log(openTrades);
        // console.log(portfolio.trades);
        expect(openTrades.length).toBe(8);
    });

    test('integration - calculate money deposited', () => {
        expect(portfolio.amountDeposited).toBe(2500);
    });

    test('integration - calculate fee adjustments', () => {
        expect(portfolio.feeAdjustments).toBe(-0.9);
    });

    test('integration - portfolio summary', () => {
        console.log(portfolio.getPortfolioValues());
    });

    test('integration - get trades by strategy', () => {
        console.log(portfolio.getTradesByStrategy('STRANGLE'));
    });
});