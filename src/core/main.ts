import * as fs from 'fs';
import csv from 'csv-parser';
import { Transaction } from './transaction';

// TODO: create UI to load this, so that we dont push this up to the git repo
const inputFilePath = process.env.TEST_LOCAL_TRANSACTIONS_CSV as string;

const stream = fs.createReadStream(inputFilePath).pipe(csv())

export const readLocalCsvFile = new Promise((resolve, reject) => {
    let allTransactions: Transaction[] = [];
    stream
        .on('data', (data: Transaction) => {
            try {
                // if (data['Underlying Symbol'] === 'QQQ') {
                //     allTransactions = [...allTransactions, data];
                // }
                allTransactions = [...allTransactions, data];
            }
            catch (err) {
                reject(err);
            }
        })
        .on('end', () => {
            resolve(allTransactions.reverse());
        });
});
