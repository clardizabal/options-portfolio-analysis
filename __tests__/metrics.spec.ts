import { readLocalCsvFile, Transaction, Portfolio, TradeLog } from '../src';

describe('Metrics', () => {
    let transactions: Transaction[];
    let portfolio: Portfolio;
    
    beforeEach(async () => {
        transactions = await readLocalCsvFile as Transaction[];
        portfolio = new Portfolio();
        portfolio.parseTransactions(transactions);
    });

    test('integration - portfolio summary', () => {
        console.log(portfolio.getPortfolioValues());
    });

    test('integration - get trades by strategy', () => {
        // console.log(portfolio.getTradesByStrategy('STRANGLE'));
        const strangleTrades = portfolio.getTradesByStrategy('STRANGLE');
        strangleTrades.forEach((trade) => {
            expect(trade.strategy).toBe('STRANGLE');
        })
        expect(strangleTrades.length).toBe(17);
    });

    test('integration - get P&L from strangles', () => {
        const profitLoss = portfolio.getProfitLossByStrategy('STRANGLE');
        expect(profitLoss).toBe(815);
    });

    test('integration - get average P&L by strategy', () => {
        let avgProfitLoss = portfolio.getAverageProfitLossByStrategy('STRANGLE');
        expect(avgProfitLoss).toBe(47.94);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('IRON_CONDOR');
        expect(avgProfitLoss).toBe(0.29);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('VERTICAL_SPREAD', null);
        expect(avgProfitLoss).toBe(-1.9);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('NAKED');
        expect(avgProfitLoss).toBe(32.25);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('CUSTOM');
        expect(avgProfitLoss).toBe(9.6);


        // console.log(portfolio.getTradesByStrategy('CUSTOM'));
    });

    test('integration - get average P&L of credit/debit spreads', () => {
        let avgProfitLoss = portfolio.getAverageProfitLossByStrategy('VERTICAL_SPREAD', 'debit');
        expect(avgProfitLoss).toBe(-19);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('VERTICAL_SPREAD', 'credit');
        expect(avgProfitLoss).toBe(-2.11);

        avgProfitLoss = portfolio.getAverageProfitLossByStrategy('VERTICAL_SPREAD');
        expect(avgProfitLoss).toBe(-2.11);
    });

    test('integration - get average realized P&L by strategy', () => {
        let avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('STRANGLE');
        expect(avgProfitLoss).toBe(45.76);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('IRON_CONDOR');
        expect(avgProfitLoss).toBe(-3.81);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('VERTICAL_SPREAD', null);
        expect(avgProfitLoss).toBe(-3.76);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('NAKED');
        expect(avgProfitLoss).toBe(31.1);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('CUSTOM');
        expect(avgProfitLoss).toBe(6.17);


        // console.log(portfolio.getTradesByTicker('SPY'));
    });

    test('integration - get average realized P&L of credit/debit spreads', () => {
        let avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('VERTICAL_SPREAD', 'debit');
        expect(avgProfitLoss).toBe(-37.65);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('VERTICAL_SPREAD', 'credit');
        expect(avgProfitLoss).toBe(-4.18);

        avgProfitLoss = portfolio.getAverageRealizedProfitLossByStrategy('VERTICAL_SPREAD');
        expect(avgProfitLoss).toBe(-4.18);
    });

    test('integration - winning %', () => {
        expect(portfolio.getPercentWinnersByStrategy('STRANGLE')).toBe(0.88);
        expect(portfolio.getPercentWinnersByStrategy('IRON_CONDOR')).toBe(0.71);
        expect(portfolio.getPercentWinnersByStrategy('VERTICAL_SPREAD')).toBe(0.67);
        // console.log(portfolio.getTradesByStrategy('NAKED'));
        expect(portfolio.getPercentWinnersByStrategy('NAKED')).toBe(1.00);
        // console.log(portfolio.getTradesByStrategy('STRANGLE').length);
        expect(portfolio.getPercentWinnersByStrategy('VERTICAL_SPREAD', 'debit')).toBe(1.00);
        expect(portfolio.getPercentWinnersByStrategy('CUSTOM')).toBe(0.80);
    });

    test('integration - EXT metrics', () => {
        // console.log(portfolio.getPercentProfitTakenFromExtByStrategy('STRANGLE'));
        expect(portfolio.getPercentProfitTakenFromExtByStrategy('STRANGLE')).toBe(0.38);
        // console.log(portfolio.trades);
        // console.log(portfolio.tradeHistory);
        // console.log(portfolio.tradeHistory.filter((trade) => trade.ticker === 'EEM'));
        console.log(portfolio.getAllTickers());
    });

    test('integration - get metrics by trade', () => {
        const tickers = portfolio.getAllTickers();
        const tradeIdsByTicker = portfolio.getTradeIdsByTicker();
        // const tradeHistoryByTicker = portfolio.getTradesHistoryByTicker();
        console.log(portfolio.getMetricsByTicker());
        // const groupedByTicker = tickers.map((ticker) => {
        //     const tradeIds = tradeIdsByTicker[ticker];
        //     return tradeIds.map((id) => {
        //         return portfolio.trades[id];
        //     });
        // });
        // console.log(groupedByTicker);
    })
});