export type Action = 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' | 'BUY_TO_OPEN' | 'REMOVE';
export type TransactionType =  'Trade' | 'Money Movement' | 'Receive Deliver';
export type Strategies = 'BUTTERFLY'
    | 'STRANGLE'
    | 'STRADDLE'
    | 'IRON_CONDOR'
    | 'VERTICAL_SPREAD'
    | 'NAKED'
    | 'CUSTOM'
    | 'CALENDAR'
    | 'DIAGONAL'
    | 'EXERCISE_OR_ASSIGNMENT';
export type InstrumentType = 'Equity Option';
export type CallOrPut = 'CALL' | 'PUT';
export type tradeStatus = 'open'
    | 'closed'
    | 'expired';
