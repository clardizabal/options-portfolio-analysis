export type Action = 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' | 'BUY_TO_OPEN';
export type TransactionType =  'Trade' | 'Money Movement' | 'Receive Deliver';
type Strategies = 'BUTTERFLY' | 'STRANGLE' | 'STRADDLE' | 'IRON_CONDOR' | 'VERTICAL_SPREAD' | 'NAKED' | 'CUSTOM';
export type InstrumentType = 'Equity Option';
export type CallOrPut = 'CALL' | 'PUT';
type optionsMap = {[key: string] : Option};
type transactionsMap = {[key: string] : TransactionDTO};

export class Option {
    callOrPut: CallOrPut;
    strike: number;
    expirationDate: string;
    date: string;
    quantity: number;
    value: number;
    ticker: string;

    constructor(dto: TransactionDTO) {
        this.callOrPut = dto.callOrPut;
        this.strike = dto.strike;
        this.expirationDate = dto.expirationDate;
        this.date = dto.date;
        this.quantity = dto.quantity;
        this.value = dto.value;
        this.ticker = dto.ticker;
    }
}
export interface Transaction extends Option {
    type: TransactionType;
    action: Action;
    instrumentType: InstrumentType;
    commissions: number;
    fees: number;
}
export class TransactionDTO {
    action: Action;
    instrumentType: InstrumentType;
    value: number;
    quantity: number;
    commissions: number;
    ticker: string;
    date: string;
    expirationDate: string;
    strike: number;
    callOrPut: CallOrPut;

    constructor(dto: Transaction) {
        this.action = dto.action;
        this.instrumentType = dto.instrumentType;
        this.value = dto.value;
        this.quantity = dto.quantity;
        this.commissions = dto.commissions;
        this.ticker = dto.ticker;
        this.date = dto.date;
        this.expirationDate = dto.expirationDate;
        this.strike = dto.strike;
        this.callOrPut = dto.callOrPut;
    }
}

export class Trade {
    ticker: string = '';
    value: number = 0;
    legs: optionsMap = {};
    strategy: Strategies = 'NAKED';
    type: 'debit' | 'credit' = 'debit';
    profitLoss: number = 0;
    constructor(legs: TransactionDTO[]) {
        this.ticker = legs[0].ticker;
        this.parseTrade(legs);
    }

    parseTrade = (legs: TransactionDTO[]) => {
        this.setTradeType(legs);
        this.setStrategyType(legs);
        this.setTradeValue(legs);
        this.legs = legs.reduce((sum, leg: TransactionDTO) => {
            sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = new Option(leg);
            return sum;
        }, this.legs);
    }
    closeLegs = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToClose = optionsToClose(transactions);
        legsToClose.forEach((leg: string) => {
            this.value += legs[leg].value;
            delete this.legs[leg];
        });
    }
    roll = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToOpen = optionsToOpen(transactions);
        legsToOpen.forEach((leg: string) => {
            this.legs[leg] = legs[leg];
            this.value += legs[leg].value;
        });
    }
    private setTradeType = (legs: TransactionDTO[]) => {
        let sum = 0;
        sum = legs.reduce((sum, leg) => {
            return sum + leg.value;
        }, sum);
        this.type = sum > 0 ? 'credit' : 'debit';
    }

    private setStrategyType = (legs: TransactionDTO[]) => {
        if (legs.length === 1) {
            this.strategy = 'NAKED';
        } else if (legs.length === 2) {
            const isVertical = legs[0].callOrPut === legs[1].callOrPut;
            if (isVertical) {
                this.strategy = 'VERTICAL_SPREAD';
            }
            if (this.type === 'credit' && !isVertical) {
                this.strategy = 'STRANGLE';
            }
        } else if (legs.length === 4) {
            this.strategy = 'IRON_CONDOR';
        } else {
            this.strategy = 'CUSTOM';
        }
    }

    private setTradeValue = (legs: TransactionDTO[]) => {
        this.value = legs.reduce((sum, option) => {
            return sum + option.value;
        }, 0);
    }
}

export const openingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        return sum
            && option.action === 'BUY_TO_OPEN'
            || option.action === 'SELL_TO_OPEN';
    }, true);
}
export const adjustmentTrade = (queue: TransactionDTO[]): boolean => {
    const tradeAction = queue.map((option) => option.action);
    return tradeAction.indexOf('BUY_TO_CLOSE') >= 0 
        || tradeAction.indexOf('SELL_TO_CLOSE') >= 0
        && tradeAction.indexOf('BUY_TO_OPEN') >= 0
        || tradeAction.indexOf('SELL_TO_OPEN') >= 0;
}
export const closingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        return (option.action === 'BUY_TO_CLOSE'
            || option.action === 'SELL_TO_CLOSE')
            && sum;
    }, true);
}

export const optionsToClose = (legs: transactionsMap): string[] => {
    return Object.keys(legs).filter((key) => {
        return legs[key].action === 'SELL_TO_CLOSE'
            || legs[key].action === 'BUY_TO_CLOSE';
    })
}

export const optionsToOpen = (legs: transactionsMap): string[] => {
    return Object.keys(legs).filter((key) => {
        return legs[key].action === 'SELL_TO_OPEN'
            || legs[key].action === 'BUY_TO_OPEN';
    })
}

export const parseLegs = (legs: TransactionDTO[]): transactionsMap => {
    const _legs: transactionsMap = {};
    return legs.reduce((sum, leg: TransactionDTO) => {
        sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = leg;
        return sum;
    }, _legs);

}

export class Portfolio {
    profit: number = 0;
    numberOfTrades: number = 0;
    tradesOpen: number = 0;
    tradesClosed: number = 0;
    trades: {[key: string] : Trade} = {};
    tradeHistory = [];

    constructor() {
    }

    parseTransactions = (transactions: Transaction[]) => {
        let queue: TransactionDTO[] = [];
        let lastTransaction: TransactionDTO;
        console.log(transactions);
            transactions.forEach((transaction: Transaction) => {
                const currentTransaction = new TransactionDTO(transaction);
                if (queue.length === 0) {
                    queue.push(currentTransaction);
                } else if (currentTransaction.date === lastTransaction.date) {
                    queue.push(currentTransaction);
                } else {
                    // check if opening trade
                    const currentTrade = new Trade(queue);
                    if (openingTrade(queue)) {
                        this.addTrade(currentTrade);
                    } else if (closingTrade(queue)){
                        console.log('close this trade', currentTrade);
                        const transactions = parseLegs(queue);
                        this.closeTrade(currentTrade, transactions);
                    } else if (adjustmentTrade(queue)) {
                        // console.log('adjust this trade');
                        const transactions = parseLegs(queue);
                        this.adjustTrade(currentTrade, transactions);
                    }
                    // need a default case
                    queue = [currentTransaction];
                }
                lastTransaction = currentTransaction;
        });
    }

    // Add a new trade to trade history and open positions
    addTrade = (trade: Trade) => {
        this.trades[trade.ticker] = trade;
        this.numberOfTrades++;
    }

    // Close an existing trade
    closeTrade = (trade: Trade, transactions: transactionsMap) => {
        const ticker: string = trade.ticker;
        const _trade = this.trades[ticker];
        _trade.closeLegs(trade.legs, transactions);
    }

    // Adjust an existing trade
    adjustTrade = (trade: Trade, transactions: transactionsMap) => {
        const ticker: string = trade.ticker;
        const _trade = this.trades[ticker];
        _trade.closeLegs(trade.legs, transactions);
        _trade.roll(trade.legs, transactions);
    }
}