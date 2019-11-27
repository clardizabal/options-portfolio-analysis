// type Action = 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' | 'BUY_TO_OPEN';
// type TransactionType =  'Trade' | 'Money Movement' | 'Receive Deliver';
type Strategies = 'BUTTERFLY' | 'STRANGLE' | 'STRADDLE' | 'IRON_CONDOR' | 'VERTICAL_SPREAD' | 'NAKED' | 'CUSTOM';
// type InstrumentType = 'Equity Option';
export type CallOrPut = 'CALL' | 'PUT';


export interface Option {
    callOrPut: CallOrPut;
    strike: number;
    expirationDate: Date;
    date: Date;
    quantity: number;
    value: number;
    ticker: string;
}
// export class Option {
//     callOrPut: 'CALL' | 'PUT';
//     strike: number;
//     expirationDate: any;
//     dateOpened: any;
//     constructor() {
//     }
// }

// export class Transaction implements Option {
//     action: Action;
//     instrumentType: InstrumentType;
//     value: number;
//     quantity: number;
//     commissions: number;
//     multiplier: number;
//     ticker: string;
//     date: Date;
//     expirationDate: Date;
//     strike: number;
//     callOrPut: CallOrPut;
// }

export class Trade {
    ticker: string = '';
    value: number = 0;
    legs: Option[];
    strategy: Strategies = 'NAKED';
    type: 'debit' | 'credit' = 'debit';
    constructor(legs: Option[]) {
        this.legs = legs;
        this.parseTrade(legs);
    }

    parseTrade = (legs: Option[]) => {
        this.checkTradeType(legs);
        this.checkStrategyType(legs);
    }
    
    private checkTradeType = (legs: Option[]) => {
        let sum = 0;
        sum = legs.reduce((sum, leg) => {
            return sum + leg.value;
        }, sum);
        this.type = sum > 0 ? 'credit' : 'debit';
    }

    private checkStrategyType = (legs: Option[]) => {
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
}

// export class Portfolio {
//     profit: number;
//     numberOfTrades: number;
//     tradesOpen: number;
//     tradesClosed: number;
//     trades: Trade[];

//     constructor() {

//     }
// }