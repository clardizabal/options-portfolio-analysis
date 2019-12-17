// action constants
export const CREATE_PORTFOLIO = 'Create Portfolio';

// action creators
export class CreatePortfolio {
  readonly type = CREATE_PORTFOLIO;
  constructor(public payload: any) {}
}