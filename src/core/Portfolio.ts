import { uuid } from 'uuidv4';
import { addDecimal,
    adjustmentTrade,
    Trade,
    Transaction,
    TransactionDTO,
    openingTrade, closingTrade, parseLegs,
} from '../index';

export const shouldBeOneTrade = (dateOne: string, dateTwo: string) => {
    const tradeDateOne = new Date(dateOne);
    const tradeDateTwo = new Date(dateTwo);
    const SECONDS = 1000;
    return Math.abs(Number(tradeDateOne) - Number(tradeDateTwo)) <= 3 * SECONDS;
}

export type transactionsMap = {[key: string] : TransactionDTO};

export class Portfolio {
    profit: number = 0;
    numberOfTrades: number = 0;
    tradesOpen: number = 0;
    tradesClosed: number = 0;
    trades: {[key: string] : Trade} = {};
    tradeHistory: any[] = [];
    totalFees: number = 0;
    totalCommission: number = 0;

    constructor() {
    }

    parseTransactions = (transactions: Transaction[]) => {
        let queue: TransactionDTO[] = [];
        let lastTransaction: TransactionDTO;
            transactions.forEach((transaction: Transaction) => {
                const currentTransaction = new TransactionDTO(transaction);
                // Add commissions and fees
                this.totalCommission += currentTransaction.commissions;
                this.totalFees = addDecimal(this.totalFees, currentTransaction.fees);
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
                    }
                    // need a default case
                    queue = [currentTransaction];
                }
                lastTransaction = currentTransaction;
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
        const _trades: Trade[] = Object.keys(this.trades).filter((key) => {
            return this.trades[key].ticker === ticker
                && this.trades[key].status === 'open';
        }).map((key) => {
            return this.trades[key];
        });
        for (let _trade of _trades) {
            _trade.closeLegs(trade.legs, transactions);
            if (_trade.status === 'closed') {
                this.logTrade(_trade);
            }
        }
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
        const _trades: Trade[] = Object.keys(this.trades).filter((key) => {
            return this.trades[key].ticker === ticker;
        }).map((key) => {
            return this.trades[key];
        });
        _trades[0].closeLegs(trade.legs, transactions);
        _trades[0].roll(trade.legs, transactions);
    }
}