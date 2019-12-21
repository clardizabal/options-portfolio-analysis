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
    originalPosition: optionsMap = {};
    originalCreditReceived = 0;
    strategy: Strategies = 'NAKED';
    type: 'debit' | 'credit' = 'debit';
    profitLoss: number = 0;
    fees: number = 0;
    commissions: number = 0;
    status: tradeStatus = 'open';
    date: string;
    closeDate: string | null = null;
    daysTradeOpen: number = 0;
    daysToExpiration: number;
    rolls: number = 0;

    constructor(legs: TransactionDTO[]) {
        this.ticker = legs.reduce((ticker, leg) => {
            return ticker || leg.ticker;
        }, '');
        this.date = legs[0].date;
        this.id = uuid();
        this.daysToExpiration = this.getDaysToExpiration(legs);
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
        this.originalPosition = {
            ...this.legs
        }
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
            this.profitLoss = this.value;
        });
        this.status = 'closed';
        this.closeDate = this.getDateOfTransactions(transactions);
        this.daysTradeOpen = this.getDaysInTrade();
    }

    getDateOfTransactions = (transactions: transactionsMap) => {
        const firstKey = Object.keys(transactions)[0];
        const firstTransaction = transactions[firstKey];
        return firstTransaction.date;
    }

    getDaysInTrade = () => {
        const dayClosed = new Date(this.closeDate as string);
        const dayOpened = new Date(this.date);
        return this.getDaysInBetween(dayOpened, dayClosed);
    }

    getDaysToExpiration = (transactions: TransactionDTO[]) => {
        const firstTransaction = transactions[0];
        const lastDay = new Date(firstTransaction.expirationDate);
        const firstDay = new Date(firstTransaction.date);
        return this.getDaysInBetween(firstDay, lastDay);
    }

    getDaysInBetween = (firstDay: Date, lastDay: Date) => {
        const MILLISECONDS = 1000; // in one second
        const SECONDS = 3600; // in one hour
        const HOURS = 24; // in one day
        return Math.round((lastDay.getTime() - firstDay.getTime())/(MILLISECONDS*SECONDS*HOURS));
    }

    roll = (legs: optionsMap, transactions: transactionsMap) => {
        const legsToOpen = optionsToOpen(transactions);
        // console.log('open after we roll: ', legsToOpen);
        legsToOpen.forEach((leg: string) => {
            this.legs[leg] = legs[leg];
            this.value += legs[leg].value;
        });
        this.status = 'open';
        this.rolls++;
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

    getRealizedProfitLoss = () => {
        return addDecimal(this.profitLoss, addDecimal(this.fees, this.commissions));
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
                if (legs[0].expirationDate === legs[1].expirationDate) {
                    this.strategy = 'VERTICAL_SPREAD';
                } else if (legs[0].strike === legs[1].strike) {
                    this.strategy = 'CALENDAR';
                } else {
                    this.strategy = 'DIAGONAL';
                }
            } else if (this.type === 'credit' && !isVertical) {
                if (legs[0].strike === legs[1].strike) {
                    this.strategy = 'STRADDLE';
                } else {
                    this.strategy = 'STRANGLE';
                }
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
        this.originalCreditReceived = this.value;
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