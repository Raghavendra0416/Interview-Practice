import { configureStore } from "@reduxjs/toolkit";
// import favSlice from "../features/favourites/favouritesSlice"; -> array
import uiSlice from "../features/ui/uiSlice";
import { pokemonApi } from "../features/pokemon/pokemonApi";
import { favouritesApi } from "../features/favourites/favouritesApi"; //-> internal json server
import loggerMiddleware from "./loggerMiddleware" //-> Custom Middleware that logs the state and actions

const store = configureStore({
    reducer: {
        // favourites: favSlice, -> removed this because favouritesApi is used.
        ui: uiSlice,

        [favouritesApi.reducerPath]: favouritesApi.reducer,

        //RTK Query
        [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    //RTK Query Middleware -> Handles caching, refetching, and auto-invalidation.
    //Add All API's in a single middleware, if multiple is used then, the middleware which is used at the end will only be used.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware, favouritesApi.middleware, loggerMiddleware),
})

export default store;


//logger Middleware:
// RTK Query's own middleware does not synchronously update the reducer state within a single next(action) call
// for async operations — it dispatches additional actions later (like pending/fulfilled) as the network request progresses.
// So even placing your logger last only shows you the state change from that one specific action passing through — not the full
// async lifecycle of a query/mutation, which unfolds as multiple separate dispatched actions over time (each of which would
// trigger your logger again, since it runs on every dispatch).


// LoggerMiddlware: placing it last is actually the more common/sensible choice for a logger — it means "State after" reflects
// the state truly after the reducers have processed this action, having passed through all prior middleware first. If you placed
// it first, "State after" would reflect state right as the action exits the reducer but before it's fully wired through any other
// middleware transformations later in the chain (in your case, that's less relevant since your two API middlewares don't transform
// outgoing actions much, but conceptually, last-position is the standard convention for loggers specifically because you want to
// see the true final state).