import { addDecimal,
    adjustmentTrade,
    Trade,
    Transaction,
    TransactionDTO,
    openingTrade, closingTrade, parseLegs, handleExerciesOrAssignment,
    Strategies
} from '../index';

export const shouldBeOneTrade = (dateOne: string, dateTwo: string) => {
    const tradeDateOne = new Date(dateOne);
    const tradeDateTwo = new Date(dateTwo);
    const SECONDS = 1000;
    return Math.abs(Number(tradeDateOne) - Number(tradeDateTwo)) <= 3 * SECONDS;
}

export type transactionsMap = {[key: string] : TransactionDTO};
export type tradeType = 'credit' | 'debit' | null;

export interface TradeLog {
    ticker: string;
    profitLoss: number;
    strategy: Strategies;
    id: string;
}

export interface OverviewMetrics {
    numberOfTransactions: number,
    numberOfTrades: number,
    feeAdjustments: number,
    grossProfit: number,
    netProfit: number,
    feesAndCommissionPercentageOfProfit: number,
    commissionPercentageOfProfit: number,
    feesPercentageOfProfit: number,
    amountDeposited: number,
    totalFees: number,
    totalCommission: number,
    totalExt: number,
    returnPercentageOfExt: number,
    winningPercentage: number
}

export interface MetricsWithAverages extends OverviewMetrics {
    averageGrossProfit: number;
    averageNetProfit: number;
}

export class Portfolio {
    profit: number = 0;
    numberOfTrades: number = 0;
    numberOfTransactions: number = 0;
    tradesOpen: number = 0;
    tradesClosed: number = 0;
    trades: {[key: string] : Trade} = {};
    tradeHistory: TradeLog[] = [];
    totalFees: number = 0;
    totalCommission: number = 0;
    amountDeposited: number = 0;
    feeAdjustments: number = 0;
    constructor() {
    }

    parseTransactions = (transactions: Transaction[]) => {
        let queue: TransactionDTO[] = [];
        let lastTransaction: TransactionDTO;
        transactions.forEach((transaction: Transaction, index) => {
            const currentTransaction = new TransactionDTO(transaction);
            this.totalCommission += currentTransaction.commissions;
            this.totalFees = addDecimal(this.totalFees, currentTransaction.fees);
            if (transaction['Type'] === 'Money Movement') {
                const description = transaction['Description'];
                if (description.match('ACH DEPOSIT') !== null) {
                    this.amountDeposited = addDecimal(this.amountDeposited, currentTransaction.value);
                } else {
                    this.feeAdjustments = addDecimal(this.feeAdjustments, currentTransaction.value);
                }
            } else if (transaction['Type'] === 'Trade'
                || transaction['Type'] === 'Receive Deliver') {
                if (queue.length === 0) {
                    queue.push(currentTransaction);
                } else if (shouldBeOneTrade(currentTransaction.date, lastTransaction.date)) {
                    queue.push(currentTransaction);
                } else {
                    const currentTrade = new Trade(queue);
                    if (openingTrade(queue)) {
                        this.addTrade(currentTrade);
                    } else if (closingTrade(queue)){
                        const transactions = parseLegs(queue);
                        this.closeTrade(currentTrade, transactions);
                    } else if (adjustmentTrade(queue)) {
                        const transactions = parseLegs(queue);
                        this.adjustTrade(currentTrade, transactions);
                    } else if (handleExerciesOrAssignment(queue)) {
                        const transactions = parseLegs(queue);
                        this.handleExerciesOrAssignment(currentTrade, transactions);
                    } else {
                        console.log('MISSING A CASE!');
                    }
                    queue = [currentTransaction];
                }
                lastTransaction = currentTransaction;
                if (transaction['Type'] === 'Trade') {
                    this.numberOfTransactions++;
                }
            } else {
                console.log('SOMETHING WENT WRONG');
                console.log(transaction);
            }
        });

        // we have to account for the last trade
        const currentTrade = new Trade(queue);
        if (openingTrade(queue)) {
            this.addTrade(currentTrade);
        } else if (closingTrade(queue)){
            const transactions = parseLegs(queue);
            this.closeTrade(currentTrade, transactions);
        } else if (adjustmentTrade(queue)) {
            const transactions = parseLegs(queue);
            this.adjustTrade(currentTrade, transactions);
        }
    }

    getTradesByTicker = (ticker: string) => {
        return Object.keys(this.trades).filter((id) => {
            return this.trades[id].ticker === ticker;
        }).map((id) => this.trades[id]);
    }

    // Add a new trade to trade history and open positions
    addTrade = (trade: Trade) => {
        this.trades[trade.id] = trade;
        this.numberOfTrades++;
    }
    
    // Close an existing trade
    closeTrade = (trade: Trade, transactions: transactionsMap) => {
        const ticker: string = trade.ticker;
        const _trades: string[] = Object.keys(this.trades).filter((key) => {
            return (this.trades[key].ticker === ticker
                && this.trades[key].status === 'open');
        });
        // console.log('ids: ', _trades);
        for (let id of _trades) {
            this.trades[id].closeLegs(trade.legs, transactions);
            if (this.trades[id].status === 'closed') {
                this.logTrade(this.trades[id]);
            }
        }
    }

    handleExerciesOrAssignment = (trade: Trade, transactions: transactionsMap) => {
        // trade.setMaxLoss();
        this.closeTrade(trade, transactions);
    }

    logTrade = (trade: Trade) => {
        const tradeLog = {
            ticker: trade.ticker,
            profitLoss: trade.value,
            strategy: trade.strategy,
            id: trade.id,
        }
        this.tradeHistory.push(tradeLog);
        this.profit += trade.value;
    }

    // Adjust an existing trade
    adjustTrade = (trade: Trade, transactions: transactionsMap) => {
        const ticker: string = trade.ticker;
        const _trades: string[] = Object.keys(this.trades).filter((key) => {
            return this.trades[key].ticker === ticker 
                && this.trades[key].status === 'open';
        });

        for (let id of _trades) {
            this.trades[id].closeLegs(trade.legs, transactions);
            this.trades[id].roll(trade.legs, transactions);
        }
    }
    

    getPortfolioValues = (): OverviewMetrics => {
        const totalExt = this.getTotalExt();
        const totalFeesAndCommissions = this.totalFees + this.totalCommission;
        const numberOfWinningTrades = this.tradeHistory.filter((trade) => trade.profitLoss > 0).length;
        return {
            numberOfTransactions: this.numberOfTransactions,
            numberOfTrades: this.numberOfTrades,
            feeAdjustments: this.feeAdjustments,
            grossProfit: this.profit,
            netProfit: this.profit + this.feeAdjustments + totalFeesAndCommissions,
            feesAndCommissionPercentageOfProfit: Math.abs(totalFeesAndCommissions) / this.profit,
            commissionPercentageOfProfit: Math.abs(this.totalCommission) / this.profit,
            feesPercentageOfProfit: Math.abs(this.totalFees) / this.profit,
            amountDeposited: this.amountDeposited,
            totalFees: this.totalFees,
            totalCommission: this.totalCommission,
            totalExt,
            returnPercentageOfExt: this.profit / totalExt,
            winningPercentage: numberOfWinningTrades / this.numberOfTrades,
        }
    }

    getTradesByStrategy = (strategy: Strategies, type: 'credit' | 'debit'  | null = 'credit'): any[] => {
        return Object.keys(this.trades).filter((id) => {
            if (type !== null) {
                return this.trades[id].strategy === strategy
                    && this.trades[id].status === 'closed'
                    && this.trades[id].type === type;
            } else {
                return this.trades[id].strategy === strategy
                    && this.trades[id].status === 'closed';
            }
        }).map((id) => this.trades[id]);
    }

    toTradeSummary = (trade: Trade) => {
        return {
            ticker: trade.ticker,
            strategy: trade.strategy,
            value: trade.value,
            grossProfit: trade.value,
            netProfit: trade.getRealizedProfitLoss(),
            dateOpened: trade.date,
            // dateClosed: trade.dateClosed,
            ext: trade.originalCreditReceived,
        };
    }

    getProfitLossByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        return this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return sum = addDecimal(sum, trade.value);
        }, 0);
    }

    getRealizedProfitLossByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        return this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return sum = addDecimal(sum, trade.getRealizedProfitLoss());
        }, 0);
    }

    getAverageProfitLossByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        const numberOfTrades = this.getTradesByStrategy(strategy, type).length;
        return Number((this.getProfitLossByStrategy(strategy) / numberOfTrades).toFixed(2));
    }

    getAverageRealizedProfitLossByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        const numberOfTrades = this.getTradesByStrategy(strategy, type).length;
        return Number((this.getRealizedProfitLossByStrategy(strategy) / numberOfTrades).toFixed(2));
    }

    getPercentWinnersByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        const trades = this.getTradesByStrategy(strategy, type)
        const numberOfTrades = trades.length;
        const numberOfWinningTrades = trades.filter((trade) => (trade.getRealizedProfitLoss() > 0)).length;
        return Number((numberOfWinningTrades / numberOfTrades).toFixed(2));
    }

    getTotalExt = () => {
        return Object.keys(this.trades).reduce((sum, tradeId) => {
            const trade = this.trades[tradeId];
            return addDecimal(sum, trade.originalCreditReceived);
        }, 0);
    }

    getTotalExtOfTrades = (trades: Trade[]) => {
        return trades.reduce((sum, trade) => {
            return addDecimal(sum, trade.originalCreditReceived);
        }, 0)
    }

    getPercentProfitTakenFromExtByStrategy = (strategy: Strategies, type: tradeType = 'credit') => {
        const totalProfit = this.getProfitLossByStrategy(strategy, type);
        const totalExt = this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return addDecimal(sum, trade.originalCreditReceived);
        }, 0);
        return Number((totalProfit / totalExt).toFixed(2));
    }

    getTradesGroupedByTicker = (): {[key: string] : any} => {
        // console.log(this.tradeHistory);
        return this.tradeHistory.reduce((_tickers, trade) => {
            if (_tickers.hasOwnProperty(trade.ticker)) {
                _tickers[trade.ticker].push(this.trades[trade.id]);
            } else {
                _tickers[trade.ticker] = [this.trades[trade.id]];
            }
            return _tickers;
        }, {} as any);
    }

    getTradesGroupedByStrategy = () => {
        return this.tradeHistory.reduce((_strategies, trade) => {
            if (_strategies[trade.strategy]) {
                _strategies[trade.strategy].push(this.trades[trade.id]);
            } else {
                _strategies[trade.strategy] = [this.trades[trade.id]];
            }
            return _strategies;
        }, {} as any)
    }

    getMetricsByStrategy = (): {[key: string]: MetricsWithAverages} => {
        const tradesGroupedByStrategy = this.getTradesGroupedByStrategy();
        Object.keys(tradesGroupedByStrategy).forEach((strategy) => {
            const initialOutput: MetricsWithAverages = {
                numberOfTransactions: 0,
                numberOfTrades: 0,
                feeAdjustments: 0,
                grossProfit: 0,
                netProfit: 0,
                feesAndCommissionPercentageOfProfit: 0,
                commissionPercentageOfProfit: 0,
                feesPercentageOfProfit: 0,
                amountDeposited: 0,
                totalFees: 0,
                totalCommission: 0,
                totalExt: 0,
                returnPercentageOfExt: 0,
                winningPercentage: this.getPercentWinnersByStrategy(strategy as Strategies),
                averageGrossProfit: 0,
                averageNetProfit: 0,
            }
            tradesGroupedByStrategy[strategy] = tradesGroupedByStrategy[strategy].reduce((sum: any, trade: Trade) => {
                // TODO: value is correct but profitLoss is incorrect for some trades because trade does not calculate expiration/assignments
                sum.grossProfit = addDecimal(sum.grossProfit, trade.value);
                sum.netProfit = addDecimal(sum.netProfit, trade.getRealizedProfitLoss());
                sum.feesAndCommissionPercentageOfProfit = sum.netProfit > 0 ?
                    Number((Math.abs(sum.netProfit - sum.grossProfit) / Math.abs(sum.grossProfit)).toFixed(2)) : 0;
                sum.numberOfTrades++;
                // sum.numberOfTransactions TODO: need to get total transaction for a trade
                // TODO: keep track of transactions per trade
                sum.totalFees = addDecimal(sum.totalFees, trade.fees);
                sum.totalCommission = addDecimal(sum.totalCommission, trade.commissions);
                sum.commissionPercentageOfProfit = Math.abs(sum.totalCommission) / sum.grossProfit;
                sum.feesPercentageOfProfit = Math.abs(sum.totalFees) / sum.grossProfit;
                sum.totalExt = addDecimal(sum.totalExt, trade.originalCreditReceived); // TODO: include rolls
                sum.returnPercentageOfExt = sum.grossProfit / sum.totalExt;
                sum.averageGrossProfit = sum.grossProfit / sum.numberOfTrades;
                sum.averageNetProfit = sum.netProfit / sum.numberOfTrades;
                return sum;
            }, initialOutput);
        });

        return tradesGroupedByStrategy;
    }

    getMetricsByTicker = (): {[key: string]: MetricsWithAverages} => {
        const tradesGroupedByTicker = this.getTradesGroupedByTicker();
        
        this.getAllTickers().forEach((ticker) => {
            const initialOutput: MetricsWithAverages = {
                numberOfTransactions: 0,
                numberOfTrades: 0,
                feeAdjustments: 0,
                grossProfit: 0,
                netProfit: 0,
                feesAndCommissionPercentageOfProfit: 0,
                commissionPercentageOfProfit: 0,
                feesPercentageOfProfit: 0,
                amountDeposited: 0,
                totalFees: 0,
                totalCommission: 0,
                totalExt: 0,
                returnPercentageOfExt: 0,
                winningPercentage: 0,
                averageNetProfit: 0,
                averageGrossProfit: 0,
            }

            tradesGroupedByTicker[ticker] = tradesGroupedByTicker[ticker].reduce((sum: any, trade: Trade) => {
                // TODO: value is correct but profitLoss is incorrect for some trades because trade does not calculate expiration/assignments
                sum.grossProfit = addDecimal(sum.grossProfit, trade.value);
                sum.netProfit = addDecimal(sum.netProfit, trade.getRealizedProfitLoss());
                sum.feesAndCommissionPercentageOfProfit = sum.netProfit > 0 ?
                    Number((Math.abs(sum.netProfit - sum.grossProfit) / Math.abs(sum.grossProfit)).toFixed(2)) : 0;
                sum.numberOfTrades++;
                // sum.numberOfTransactions TODO: need to get total transaction for a trade
                // TODO: keep track of transactions per trade
                sum.totalFees = addDecimal(sum.totalFees, trade.fees);
                sum.totalCommission = addDecimal(sum.totalCommission, trade.commissions);
                sum.commissionPercentageOfProfit = Math.abs(sum.totalCommission) / sum.grossProfit;
                sum.feesPercentageOfProfit = Math.abs(sum.totalFees) / sum.grossProfit;
                sum.totalExt = addDecimal(sum.totalExt, trade.originalCreditReceived); // TODO: include rolls
                sum.returnPercentageOfExt = sum.grossProfit / sum.totalExt;
                sum.returnPercentageOfExt = sum.grossProfit / sum.totalExt;
                sum.averageGrossProfit = sum.grossProfit / sum.numberOfTrades;
                sum.averageNetProfit = sum.netProfit / sum.numberOfTrades;
                return sum;
            }, initialOutput as MetricsWithAverages);
        });
        return tradesGroupedByTicker;
    }
    // private tradeToOverviewMetrics = (trade: Trade): OverviewMetrics => {

    // }

    getTradeIdsByTicker = () => {
        return this.tradeHistory.reduce((_tickers, trade) => {
            if (_tickers.hasOwnProperty(trade.ticker)) {
                _tickers[trade.ticker].push(trade.id);
            } else {
                _tickers[trade.ticker] = [trade.id];
            }
            return _tickers;
        }, {} as any);
    }

    getAllTickers = () => {
        return Object.keys(this.getTradeIdsByTicker());
    }

    getTradesHistoryByTicker = () => {
        return this.tradeHistory.reduce((_tickers, trade) => {
            if (_tickers.hasOwnProperty(trade.ticker)) {
                _tickers[trade.ticker].push(trade);
            } else {
                _tickers[trade.ticker] = [trade];
            }
            return _tickers;
        }, {} as any);
    }
}