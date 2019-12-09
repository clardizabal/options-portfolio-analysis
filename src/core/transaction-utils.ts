import { TransactionDTO, transactionsMap } from './index';
export const openingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        return sum
            && (option.action === 'BUY_TO_OPEN'
            || option.action === 'SELL_TO_OPEN');
    }, true);
}
export const adjustmentTrade = (queue: TransactionDTO[]): boolean => {
    const tradeAction = queue.map((option) => option.action);
    return (tradeAction.indexOf('BUY_TO_CLOSE') >= 0 
        || tradeAction.indexOf('SELL_TO_CLOSE') >= 0
        && tradeAction.indexOf('BUY_TO_OPEN') >= 0
        || tradeAction.indexOf('SELL_TO_OPEN') >= 0)
        && (queue[0].type !== 'Receive Deliver'); // TODO: forced to check first index
}
export const closingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        const keyword = option.description;
        return (keyword.match('Removal') !== null && keyword.match('due to expiration') !== null)
            || (option.action === 'BUY_TO_CLOSE' || option.action === 'SELL_TO_CLOSE')
            && sum;
    }, true);
}

export const handleExerciesOrAssignment = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        const keyword = option.description;
        return ((keyword.match('Removal') !== null && keyword.match('due to exercise') !== null)
            || (keyword.match('Removal') !== null && keyword.match('due to assignment') !== null)
            || (keyword.match('Removal') !== null && keyword.match('due to expiration') !== null)
            || (keyword.match('Buy to Close') !== null)
            || (keyword.match('Sell to Open') !== null)
            || (keyword.match('Buy to Open') !== null)
            || (keyword.match('Sell to Close') !== null))
            && sum;
    }, true);
}

export const optionsToClose = (legs: transactionsMap): string[] => {
    return Object.keys(legs).filter((key) => {
        return (legs[key].ticker && legs[key].strike)
            && (legs[key].action === 'SELL_TO_CLOSE'
            || legs[key].action === 'BUY_TO_CLOSE'
            || legs[key].action === 'REMOVE');
    })
}

export const optionsToOpen = (legs: transactionsMap): string[] => {
    return Object.keys(legs).filter((key) => {
        return legs[key].action === 'SELL_TO_OPEN'
            || legs[key].action === 'BUY_TO_OPEN';
    })
}

export const parseLegs = (legs: TransactionDTO[]): transactionsMap => {
    const _legs: transactionsMap = {};
    return legs.reduce((sum, leg: TransactionDTO) => {
        if (leg.strike && leg.callOrPut && leg.expirationDate) {
            sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = leg;
        } else {
            sum[`${leg.description}`] = leg;
        }
        return sum;
    }, _legs);

}