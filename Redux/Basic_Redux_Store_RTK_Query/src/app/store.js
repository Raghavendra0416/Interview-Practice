import { configureStore } from "@reduxjs/toolkit";
import favSlice from "../features/favourites/favouritesSlice";
import uiSlice from "../features/ui/uiSlice";

const store = configureStore({
    reducer: {
        //Empty for now
        favourites: favSlice,
        ui: uiSlice,
    }
})

export default store;