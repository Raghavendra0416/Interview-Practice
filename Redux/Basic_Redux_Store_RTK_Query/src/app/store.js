import { configureStore } from "@reduxjs/toolkit";
import favSlice from "../features/favourites/favouritesSlice";
import uiSlice from "../features/ui/uiSlice";
import { pokemonApi } from "../features/pokemon/pokemonApi";

const store = configureStore({
    reducer: {
        //Empty for now
        favourites: favSlice,
        ui: uiSlice,

        //RTK Query
        [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    //RTK Query Middleware -> Handles caching, refetching, and auto-invalidation.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
})

export default store;