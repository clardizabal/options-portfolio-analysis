import { OverviewMetrics } from '../app/core/Portfolio'
const portfolio = document.querySelector('#portfolio') as HTMLElement;

export const renderPortfolio = (collection: OverviewMetrics) => {
  portfolio.innerHTML = '';
  portfolio.innerHTML = (`
    <div>Overall Statistics</div>
    <div>Total Number of Trades: ${collection.numberOfTrades || 0}</div>
    <div>Realized Gross Profit: $${collection.grossProfit || 0}</div>
    <div>Realized Net Profit: $${collection.netProfit || 0}</div>
    <div>Winning Percentage: ${(collection.winningPercentage * 100 || 0).toFixed(2)}%</div>
    <div>Percentage of commissions and fees from profit: ${(collection.feesAndCommissionPercentageOfProfit * 100 || 0).toFixed(2)}%</div>
    <div>Total Fees: $${collection.totalFees || 0}</div>
    <div>Total Commissions: $${collection.totalCommission || 0}</div>
    <div>Percentage return from Ext collected: ${(collection.returnPercentageOfExt * 100 || 0).toFixed(2)}%</div>
    <div>Number of Transactions: ${collection.numberOfTransactions || 0}</div>
    <div>Total Amount Invested: $${collection.amountDeposited | 0}</div>
  `)
}