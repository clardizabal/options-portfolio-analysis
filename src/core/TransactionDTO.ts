import { Action, InstrumentType, Transaction, CallOrPut } from './index';
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
    strike: number;
    callOrPut: CallOrPut;

    constructor(dto: Transaction) {
        this.action = dto.action;
        this.instrumentType = dto.instrumentType;
        this.value = dto.value;
        this.quantity = dto.quantity;
        this.commissions = dto.commissions;
        this.fees = dto.fees;
        this.ticker = dto.ticker;
        this.date = dto.date;
        this.expirationDate = dto.expirationDate;
        this.strike = dto.strike;
        this.callOrPut = dto.callOrPut;
    }
}