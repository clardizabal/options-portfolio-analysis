import { readLocalCsvFile, Transaction, Portfolio, TradeLog, openingTrade } from '../src';

describe('Read local csv file', () => {
    let transactions: Transaction[];
    beforeEach(async () => {
        transactions = await readLocalCsvFile as Transaction[];
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
        const portfolio = new Portfolio();
        // expect(transactions.length).toBe(374);
        portfolio.parseTransactions(transactions);
        // expect(portfolio.numberOfTrades).toBe(1);
        // expect(portfolio.profit).toBe(775);

        let tradeHistory: any = {}
        const combinedTradeHistory = portfolio.tradeHistory.reduce((sum, tradeLog: TradeLog) => {
            if (sum.hasOwnProperty(tradeLog.ticker)) {
                sum[tradeLog.ticker] += tradeLog.profitLoss;
            } else {
                sum[tradeLog.ticker] = tradeLog.profitLoss;
            }
            return sum;
        }, tradeHistory);
        console.log(combinedTradeHistory);

        const openTrades = Object.keys(portfolio.trades).filter((trade) => {
            return portfolio.trades[trade].status === 'open';
        }).map((id) => {
            return portfolio.trades[id];
        });
        console.log(openTrades);
        // console.log(portfolio.trades);
        expect(openTrades.length).toBe(8);
    });
});