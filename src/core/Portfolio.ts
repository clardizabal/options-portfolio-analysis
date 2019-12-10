import { uuid } from 'uuidv4';
import { addDecimal,
    adjustmentTrade,
    Trade,
    Transaction,
    TransactionDTO,
    openingTrade, closingTrade, parseLegs, handleExerciesOrAssignment,
} from '../index';
import { Strategies } from './types';

export const shouldBeOneTrade = (dateOne: string, dateTwo: string) => {
    const tradeDateOne = new Date(dateOne);
    const tradeDateTwo = new Date(dateTwo);
    const SECONDS = 1000;
    return Math.abs(Number(tradeDateOne) - Number(tradeDateTwo)) <= 3 * SECONDS;
}

export type transactionsMap = {[key: string] : TransactionDTO};
export interface TradeLog {
    ticker: string;
    profitLoss: number;
    strategy: Strategies;
}
export class Portfolio {
    profit: number = 0;
    numberOfTrades: number = 0;
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
        this.trades[uuid()] = trade;
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

    getPortfolioValues = () => {
        return {
            feeAdjustments: this.feeAdjustments,
            profit: this.profit,
            amountDeposited: this.amountDeposited,
            numberOfTrades: this.numberOfTrades,
            totalFees: this.totalFees,
            totalCommission: this.totalCommission,
        }
    }

    getTradesByStrategy(strategy: Strategies, type: 'credit' | 'debit'  | null = 'credit'): Trade[] {
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

    getProfitLossByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        return this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return sum = addDecimal(sum, trade.profitLoss);
        }, 0);
    }

    getRealizedProfitLossByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        return this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return sum = addDecimal(sum, trade.getRealizedProfitLoss());
        }, 0);
    }

    getAverageProfitLossByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        const numberOfTrades = this.getTradesByStrategy(strategy, type).length;
        return Number((this.getProfitLossByStrategy(strategy) / numberOfTrades).toFixed(2));
    }

    getAverageRealizedProfitLossByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        const numberOfTrades = this.getTradesByStrategy(strategy, type).length;
        return Number((this.getRealizedProfitLossByStrategy(strategy) / numberOfTrades).toFixed(2));
    }

    getPercentWinnersByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        const trades = this.getTradesByStrategy(strategy, type)
        const numberOfTrades = trades.length;
        const numberOfWinningTrades = trades.filter((trade) => (trade.getRealizedProfitLoss() > 0)).length;
        return Number((numberOfWinningTrades / numberOfTrades).toFixed(2));
    }

    getPercentProfitTakenFromExtByStrategy = (strategy: Strategies, type: 'credit' | 'debit' = 'credit') => {
        const totalProfit = this.getProfitLossByStrategy(strategy, type);
        const totalExt = this.getTradesByStrategy(strategy, type).reduce((sum, trade) => {
            return addDecimal(sum, trade.originalCreditReceived);
        }, 0);
        return Number((totalProfit / totalExt).toFixed(2));
    }
}