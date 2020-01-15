import { OverviewMetrics, MetricsWithAverages } from '../app/core/Portfolio'
const portfolio = document.querySelector('#portfolio') as HTMLElement;
const tickers = document.querySelector('#tickers') as HTMLElement;
const strategies = document.querySelector('#strategies') as HTMLElement;
const trades = document.querySelector('#trade-view') as HTMLElement;
import * as fromStore from './store';
import { store } from './store';
import { Trade } from '../app';

export const strategyMappings: {[key: string]: string} = {
  CUSTOM: 'Custom',
  NAKED: 'Naked',
  VERTICAL_SPREAD: 'Vertical',
  IRON_CONDOR: 'Iron Condor',
  STRANGLE: 'Strangle',
  CALENDAR: 'Calendar',
  DIAGONAL: 'Diagonal',
  STRADDLE: 'Straddle',
}

const renderSummary = (collection: MetricsWithAverages) => {
  /**
   *       <tr>
        <th>Commisions and fees % of profit</th>
        <td>${(collection.feesAndCommissionPercentageOfProfit * 100 || 0).toFixed(2)}%</td>
      </tr>
<tr>
        <th>Total Credit</th>
        <td>${collection.totalExt || 0}</td>
      </tr>
      <tr>
        <th>% return from Premium collected</th>
        <td>${(collection.returnPercentageOfExt * 100 || 0).toFixed(2)}%</td>
      </tr>
   */
  let summary = (`
      <tr>
        <th>Total Number of Trades</th>
        <td>${collection.numberOfTrades || 0}</td>
      </tr>
      <tr>
        <th>Realized Gross Profit</th>
        <td class=${collection.grossProfit > 0 ? 'positive' : 'negative'}>$${collection.grossProfit || 0}</td>
      </tr>
      <tr>
        <th>Realized Net Profit</th>
        <td class=${collection.netProfit > 0 ? 'positive' : 'negative'}>$${collection.netProfit || 0}</td>
      </tr>
      <tr>
        <th>Winning %</th>
        <td class=${collection.winningPercentage > 0.5 ? 'positive' : 'negative'}>${(collection.winningPercentage * 100 || 0).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Total Fees</th>
        <td>$${collection.totalFees || 0}</td>
      </tr>
      <tr>
        <th>Total Commissions</th>
        <td>$${collection.totalCommission || 0}</td>
      </tr>
      <tr>
        <th>Commisions and fees % of profit</th>
        <td>${(collection.feesAndCommissionPercentageOfProfit * 100 || 0).toFixed(2)}%</td>
      </tr>
      <tr>
        <th>Trades Open</th>
        <td>${collection.openTrades || 0}</td>
      </tr>
  `);
  summary = collection.numberOfTransactions ?(summary + `<tr><th>Number of Transactions</th><td>${collection.numberOfTransactions}</td><tr>`) : summary; 
  summary = collection.amountDeposited > 0 ? (summary + `<tr><th>Total Amount Invested</th><td>$${collection.amountDeposited}</td><tr>`) : summary;
  summary = collection.averageGrossProfit ? (summary + `<tr><th>Avg. Gross P/L</th><td>$${collection.averageGrossProfit}</td><tr>`) : summary;
  summary = collection.averageNetProfit ? (summary + `<tr><th>Avg. Net P/L</th><td>$${collection.averageNetProfit}</td><tr>`) : summary;
  summary = collection.avgNumberOfDaysInTrade ? (summary + `<tr><th>Avg. Number of Days in Trade</th><td>${collection.avgNumberOfDaysInTrade}</td><tr>`) : summary;
  summary = collection.averageDTE ? (summary + `<tr><th>Avg. DTE</th><td>${collection.averageDTE}</td><tr>`) : summary;
  return (`
    <table>
      ${summary}
    </table>
  `);
}

function toggleSummary(collection: MetricsWithAverages, id: string) {
  const tiles = document.getElementsByClassName('tile');
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].classList.remove('selected');
  }
  const selected = document.getElementById(id);
  if (selected) {
    selected.classList.add('selected');
  }
  const summary = document.getElementById('summary-view');
  if (summary) {
    summary.innerHTML = '';
    summary.innerHTML = renderSummary(collection)
  }
  store.dispatch(new fromStore.SelectFilter(id));
}

export const renderPortfolioSummary = (collection: OverviewMetrics) => {
  portfolio.innerHTML = '';
  portfolio.innerHTML = renderSummary(collection as MetricsWithAverages);
}

export const renderTickers = (
  collection: {[key: string]: MetricsWithAverages}, selectedFilter: string) => {
  tickers.innerHTML = '';
  Object.keys(collection).sort().forEach((underlying: string) => {
    let shade = collection[underlying].grossProfit > 0 ? 'positive' : 'negative';
    const selected = selectedFilter === underlying ? 'selected' : '';
    const names = classNames('ticker-label', 'tile', shade, selected);
    tickers.innerHTML += (`
      <div class="${names}" id="${underlying}">
        <div>${underlying}</div>
        <div>${collection[underlying].netProfit}</div>
      </div>
    `);
  });
  const links = $('#tickers').getElementsByClassName('ticker-label');
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    link.onclick = toggleSummary.bind(null, collection[link.id], link.id);
  }
}

const classNames = (...names: string[]): string => {
  return names.reduce((sum, item) => {
    return sum += ` ${item}`;
  }, '');
}

export const renderStrategies = (
  collection: {[key: string]: MetricsWithAverages},
  selectedFilter: string) => {
  strategies.innerHTML = '';
  Object.keys(collection).forEach((strategy) => {
    let shade = collection[strategy].grossProfit > 0 ? 'positive' : 'negative';
    const selected = selectedFilter === strategy ? 'selected' : '';
    const names = classNames('strategy-label', 'tile', shade, selected);
    strategies.innerHTML += (`
      <div class="${names}" id="${strategy}">
        ${strategyMappings[strategy]}
      </div>
    `);
  });
  const links = $('#strategies').getElementsByClassName('strategy-label');
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    link.onclick = toggleSummary.bind(null, collection[link.id], link.id);
  }
}

export const renderTrades = (collection: Trade[]) => {
  console.log(collection);
  trades.innerHTML = '';
  let rows = '';
  collection.forEach((trade) => {
    rows += (`
      <tr>
        <th>${trade.ticker}</th>
        <td>${strategyMappings[trade.strategy]}</td>
        <td class=${trade.profitLoss > 0 ? 'positive' : 'negative'}>${trade.profitLoss}</td>
        <td>${trade.daysToExpiration}</td>
        <td>${trade.daysTradeOpen}</td>
        <td>${(new Date(trade.date)).toLocaleString()}</td>
        <td>${(new Date(trade.closeDate as string)).toLocaleString()}</td>
        <td>${trade.daysToExpiration - trade.daysTradeOpen >= 21 ? 'Yes' : 'No'}</td>
        <td>${trade.rolls}</td>
      </tr>
    `);
  });
  trades.innerHTML = (`
    <table>
      <tr>
        <th>Ticker</th>
        <th>Strategy</th>
        <th>P/L</th>
        <th>DTE</th>
        <th>Days</th>
        <th>Date Opened</th>
        <th>Date Closed</th>
        <th>Closed - 21DTE</th>
        <th>Rolls</th>
      </tr>
      ${rows}
    </table>
  `);
}

const $ = function (selector: any) {
  return document.querySelector(selector);
};