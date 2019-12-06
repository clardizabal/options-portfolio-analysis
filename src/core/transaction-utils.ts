import { TransactionDTO, transactionsMap } from './index';
export const openingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        return sum
            && option.action === 'BUY_TO_OPEN'
            || option.action === 'SELL_TO_OPEN';
    }, true);
}
export const adjustmentTrade = (queue: TransactionDTO[]): boolean => {
    const tradeAction = queue.map((option) => option.action);
    return tradeAction.indexOf('BUY_TO_CLOSE') >= 0 
        || tradeAction.indexOf('SELL_TO_CLOSE') >= 0
        && tradeAction.indexOf('BUY_TO_OPEN') >= 0
        || tradeAction.indexOf('SELL_TO_OPEN') >= 0;
}
export const closingTrade = (queue: TransactionDTO[]): boolean => {
    return queue.reduce((sum: boolean, option: TransactionDTO) => {
        return (option.action === 'BUY_TO_CLOSE'
            || option.action === 'SELL_TO_CLOSE')
            && sum;
    }, true);
}

export const optionsToClose = (legs: transactionsMap): string[] => {
    return Object.keys(legs).filter((key) => {
        return legs[key].action === 'SELL_TO_CLOSE'
            || legs[key].action === 'BUY_TO_CLOSE';
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
        sum[`${leg.strike}${leg.callOrPut}${leg.expirationDate}`] = leg;
        return sum;
    }, _legs);

}