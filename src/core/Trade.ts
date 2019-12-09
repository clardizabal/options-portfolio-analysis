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
        this.ticker = legs.reduce((ticker, leg) => {
            return ticker || leg.ticker;
        }, '');
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
            if (leg.strike && leg.callOrPut && leg.expirationDate) {
                sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = new Option(leg);
            } else {
                sum[`${leg.description}`] = new Option(leg); 
            }
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
        this.exerciseOrAssignment(transactions).forEach((transaction) => {
            this.value += transaction.value;
        });
        if (Object.keys(this.legs).length === 0) {
            this.status = 'closed';
        }
    }

    roll = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToOpen = optionsToOpen(transactions);
        // console.log('open after we roll: ', legsToOpen);
        legsToOpen.forEach((leg: string) => {
            this.legs[leg] = legs[leg];
            this.value += legs[leg].value;
        });
        this.status = 'open';
    }

    setMaxLoss = () => {
        let min: any;
        const spreadWidth = Object.keys(this.legs).reduce((loss, leg) => {
            loss = Math.abs(loss - Number(this.legs[leg].strike));
            min = min || this.legs[leg];
            min = min && (Number(this.legs[leg].strike) < Number(min.strike)) ? leg : min;
            return loss;
        }, 0);
        const DEFAULT_OPTION_MULTIPLIER = 100;
        min.value = spreadWidth * DEFAULT_OPTION_MULTIPLIER * -1; /** make it negative bc its a loss */

        this.status = 'expired';
    }

    setValue = (value: number) => {
        this.value = value;
    }

    private exerciseOrAssignment = (transactions: transactionsMap): TransactionDTO[] => {
        return Object.keys(transactions).filter((key) => {
            return transactions[key].expirationDate === '';
        }).map((key) => {
            return transactions[key];
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
            const isSameQuantity = legs[0].quantity === legs[1].quantity;
            if (isVertical && isSameQuantity) {
                this.strategy = 'VERTICAL_SPREAD';
            } else if (this.type === 'credit' && !isVertical) {
                this.strategy = 'STRANGLE';
            } else {
                this.strategy = 'CUSTOM';
            }
        } else if (legs.length === 4) {
            if (legs.filter((leg) => {
                return leg.type === 'Receive Deliver';
            }).length === 0 ) {
                this.strategy = 'IRON_CONDOR';
            } else {
                this.strategy = 'EXERCISE_OR_ASSIGNMENT';
            }
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