import { TransactionType, Action, InstrumentType } from './types';

export interface Transaction {
    Date: string,
    Type: TransactionType,
    Action: Action,
    Symbol: string,
    'Instrument Type': InstrumentType,
    Description: string,
    Value: string,
    Quantity: string,
    'Average Price': string,
    Commissions: string,
    Fees: string,
    Multiplier: string,
    'Underlying Symbol': string,
    'Expiration Date': string,
    'Strike Price': string,
    'Call or Put': string,
}