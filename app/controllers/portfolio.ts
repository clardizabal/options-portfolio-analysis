import { Transaction, Portfolio } from "..";
import { readUploadedCsvFile, Strategies } from "../core";

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
    console.log(req.file);
    const filename = `uploads/${req.file.filename}`;
    const transactions = await readUploadedCsvFile(filename) as Transaction[];
    const portfolio = new Portfolio();
    portfolio.parseTransactions(transactions);
    const summary = portfolio.getPortfolioValues();
    const tickers = portfolio.getMetricsByTicker();
    const tradesByTicker: any = {};
    Object.keys(tickers).forEach((ticker) => {
      tradesByTicker[ticker] = portfolio.getTradesByTicker(ticker);
    });
    const strategies = portfolio.getMetricsByStrategy();
    const tradesByStrategy: any = {};
    Object.keys(strategies).forEach((strategy) => {
      if (strategy as Strategies === 'VERTICAL_SPREAD') {
        tradesByStrategy[strategy] = [
          ...portfolio.getTradesByStrategy(strategy as Strategies, 'credit'),
          ...portfolio.getTradesByStrategy(strategy as Strategies, 'debit'),
        ];
      } else {
        tradesByStrategy[strategy] = portfolio.getTradesByStrategy(strategy as Strategies);
      }
    });
    return res.status(SUCCESS_CODE).send({
      summary,
      tickers,
      strategies,
      tradesByTicker,
      tradesByStrategy,
    });
  },
}

export default PortfolioController;
