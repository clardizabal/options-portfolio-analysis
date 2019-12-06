import { CallOrPut } from './types';
import { TransactionDTO } from './TransactionDTO';

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