import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { EnhancedStore, Reducer, AnyAction, Middleware } from "@reduxjs/toolkit";

/**
 * Creates a test store with a given API slice.
 * This is a utility function for testing RTK Query endpoints.
 */
export function setupApiStore<
  A extends {
    reducerPath: string;
    reducer: Reducer;
    middleware: Middleware;
    util: { resetApiState(): any };
  },
  R extends Record<string, Reducer> = Record<string, Reducer>,
>(api: A, extraReducers?: R, middleware?: Middleware[]) {
  /*
   * Modified version of RTK Query's helper function:
   * https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/query/tests/helpers.tsx
   */
  const getStore = () =>
    configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        ...extraReducers,
      },
      middleware: (gdm) => {
        const middlewareArray = gdm({
          serializableCheck: false,
          immutableCheck: false,
        });

        if (middleware) {
          return middlewareArray.concat(api.middleware, ...middleware);
        }

        return middlewareArray.concat(api.middleware);
      },
    });

  type StoreType = EnhancedStore<
    {
      [K in keyof R]: ReturnType<R[K]>;
    } & Record<A["reducerPath"], ReturnType<A["reducer"]>>,
    AnyAction
  >;

  const store = getStore() as StoreType;
  setupListeners(store.dispatch);

  return {
    store,
    api,
  };
}

describe("setupApiStore", () => {
  it("should be a function", () => {
    expect(typeof setupApiStore).toBe("function");
  });
});
