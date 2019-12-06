import {uuid} from 'uuidv4';
import {
    TransactionDTO,
    Option,
    Strategies,
    tradeStatus,
    transactionsMap,
    optionsToClose,
    optionsToOpen,
    addDecimal
} from '../index';

type optionsMap = {[key: string] : Option};

export class Trade {
    id: string;
    ticker: string = '';
    value: number = 0;
    legs: optionsMap = {};
    strategy: Strategies = 'NAKED';
    type: 'debit' | 'credit' = 'debit';
    profitLoss: number = 0;
    fees: number = 0;
    commissions: number = 0;
    status: tradeStatus = 'open';
    date: string;

    constructor(legs: TransactionDTO[]) {
        this.ticker = legs[0].ticker;
        this.date = legs[0].date;
        this.id = uuid();
        this.parseTrade(legs);
    }

    parseTrade = (legs: TransactionDTO[]) => {
        this.setTradeType(legs);
        this.setStrategyType(legs);
        this.setTradeValue(legs);
        this.setCommissionAndFees(legs);
        this.legs = legs.reduce((sum, leg: TransactionDTO) => {
            sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = new Option(leg);
            return sum;
        }, this.legs);
    }
    closeLegs = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToClose = optionsToClose(transactions);
        legsToClose.forEach((leg: string) => {
            if (this.legs.hasOwnProperty(leg)) {
                this.value += legs[leg].value;
                this.profitLoss = this.value; 
                if (legs[leg].quantity === this.legs[leg].quantity) {
                    delete this.legs[leg];
                    // we have to mutate to object here, so that the next time this function runs
                    // the we close legs based on the updated quantity...
                    legs[leg].quantity = 0;
                } else if (legs[leg].quantity < this.legs[leg].quantity) {
                    this.legs[leg].quantity -= legs[leg].quantity;
                    legs[leg].quantity = 0;
                } else {
                    legs[leg].quantity -= this.legs[leg].quantity;
                    delete this.legs[leg];
                }
            }
        });
        if (Object.keys(this.legs).length === 0) {
            this.status = 'closed';
        }
    }

    roll = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToOpen = optionsToOpen(transactions);
        legsToOpen.forEach((leg: string) => {
            this.legs[leg] = legs[leg];
            this.value += legs[leg].value;
        });
        this.status = 'open';
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
            const isSameQuantity = legs[0].quantity === legs[1].quantity;
            if (isVertical && isSameQuantity) {
                this.strategy = 'VERTICAL_SPREAD';
            } else if (this.type === 'credit' && !isVertical) {
                this.strategy = 'STRANGLE';
            } else {
                this.strategy = 'CUSTOM';
            }
        } else if (legs.length === 4) {
            this.strategy = 'IRON_CONDOR';
        } else {
            this.strategy = 'CUSTOM';
        }
    }

    private setTradeValue = (legs: TransactionDTO[]) => {
        this.value = legs.reduce((sum, transaction) => {
            return sum + transaction.value;
        }, 0);
    }

    private setCommissionAndFees = (legs: TransactionDTO[]) => {
        this.fees = legs.reduce((sum, transaction) => {
            return addDecimal(sum, transaction.fees);
        }, 0);
        this.commissions = legs.reduce((sum, transaction) => {
            return sum + transaction.commissions;
        }, 0);
    }
}