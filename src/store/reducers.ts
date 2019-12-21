import * as fromActions from './actions';

export const initialState = {
  loaded: false,
  loading: false,
  data: [{ label: 'Eat pizza', complete: false }],
  portfolio: {},
  selectedFilter: '',
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

    case fromActions.SELECT_FILTER: {
      return {
        ...state,
        selectedFilter: action.payload,
      }
    }
  }

  return state;
}