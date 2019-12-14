import { Transaction, Portfolio } from "..";
import { readUploadedCsvFile } from "../core";

// import db from '../db';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt-nodejs';

// HTTP CODES
const SUCCESS_CODE = 200;
// const BAD_REQ_CODE = 400;
// const AUTH_FAILED_CODE = 401;

// CONSTANTS

const PortfolioController = {
  create: async (req: any, res: any) => {
    // console.log(req.body);
    console.log(req.file);
    const filename = `uploads/${req.file.filename}`;
    const transactions = await readUploadedCsvFile(filename) as Transaction[];
    const portfolio = new Portfolio();
    portfolio.parseTransactions(transactions);
    const summary = portfolio.getPortfolioValues();
    
    return res.status(SUCCESS_CODE).send({
      success: true,
      message: 'hello world!',
      summary,
    })
  },
}

export default PortfolioController;
