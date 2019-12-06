export type Action = 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' | 'BUY_TO_OPEN';
export type TransactionType =  'Trade' | 'Money Movement' | 'Receive Deliver';
export type Strategies = 'BUTTERFLY' | 'STRANGLE' | 'STRADDLE' | 'IRON_CONDOR' | 'VERTICAL_SPREAD' | 'NAKED' | 'CUSTOM';
export type InstrumentType = 'Equity Option';
export type CallOrPut = 'CALL' | 'PUT';
export type tradeStatus = 'open' | 'closed';

export interface Literal {
    type: "literal";
    value: number;
}

export type BinaryOperators = "+" | "-" | "*" | "/";
export interface BinaryOperation {
    type: "binary";
    operator: BinaryOperators;
    left: Expression;
    right: Expression;
}

export type Expression = Literal | BinaryOperation;
