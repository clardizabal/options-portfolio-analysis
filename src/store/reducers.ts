import * as fromActions from './actions';

export const initialState = {
  loaded: false,
  loading: false,
  data: [{ label: 'Eat pizza', complete: false }],
  portfolio: {},
};

export function reducer(
  state = initialState,
  action: { type: string; payload: any }
) {
  switch (action.type) {
    case fromActions.CREATE_PORTFOLIO: {
      const portfolio = action.payload;
      return {
        ...state,
        portfolio,
      };
    }
  }

  return state;
}