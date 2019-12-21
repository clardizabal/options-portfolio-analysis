// action constants
export const CREATE_PORTFOLIO = 'Create Portfolio';
export const SELECT_FILTER = 'Select Filter';

// action creators
export class CreatePortfolio {
  readonly type = CREATE_PORTFOLIO;
  constructor(public payload: any) {}
}

export class SelectFilter {
  readonly type = SELECT_FILTER;
  constructor(public payload: any) {}
}