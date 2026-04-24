// Central mutable container shared by all modules via object reference.
// Every module imports { store } and reads/writes store.state.
export const store = {
  state: null,
};
