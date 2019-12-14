// action constants
export const ADD_TODO = '[Todo] Add Todo';
export const REMOVE_TODO = '[Todo] Remove Todo';

// const mock = (payload: any) => {
//     return payload;
// }

// action creators
export class AddTodo {
  readonly type = ADD_TODO;
  constructor(payload: any) {
    //   mock(payload);
  }
}

export class RemoveTodo {
  readonly type = REMOVE_TODO;
  constructor(payload: any) {
    //   payload;
    //   mock(payload);
  }
}