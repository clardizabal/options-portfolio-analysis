import { Option } from "./Option";
import { TransactionType, Action, InstrumentType } from './types';
export interface Transaction extends Option {
    type: TransactionType;
    action: Action;
    instrumentType: InstrumentType;
    commissions: number;
    fees: number;
}