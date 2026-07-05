import { configureStore } from "@reduxjs/toolkit";
import favSlice from "../features/favourites/favouritesSlice";
import uiSlice from "../features/ui/uiSlice";
import { pokemonApi } from "../features/pokemon/pokemonApi";
import { favouritesApi } from "../features/favourites/favouritesApi";

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
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware, favouritesApi.middleware),
})

export default store;