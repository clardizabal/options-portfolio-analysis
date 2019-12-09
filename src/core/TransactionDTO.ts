import { Action, InstrumentType, Transaction, CallOrPut } from './index';
import { TransactionType } from './types';

const toNumber = (n: string): number => {
    return Number(n.replace(',',''));
}
export class TransactionDTO {
    action: Action;
    instrumentType: InstrumentType;
    value: number;
    quantity: number;
    commissions: number;
    fees: number;
    ticker: string;
    date: string;
    expirationDate: string;
    strike: string;
    callOrPut: CallOrPut;
    description: string;
    multiplier: number;
    type: TransactionType;

    constructor(dto: Transaction) {
        this.action = dto['Action'] ? dto['Action'] : 'REMOVE';
        this.instrumentType = dto['Instrument Type'];
        this.value = toNumber(dto['Value']);
        this.quantity = toNumber(dto['Quantity']);
        this.commissions = toNumber(dto['Commissions']);
        this.fees = toNumber(dto['Fees']);
        this.ticker = dto['Underlying Symbol'];
        this.date = dto['Date'];
        this.expirationDate = dto['Expiration Date'];
        this.strike = dto['Strike Price'];
        this.callOrPut = dto['Call or Put'] as CallOrPut;
        this.description = dto['Description'];
        this.multiplier = toNumber(dto['Multiplier']);
        this.type = dto['Type'] as TransactionType;
    }
}