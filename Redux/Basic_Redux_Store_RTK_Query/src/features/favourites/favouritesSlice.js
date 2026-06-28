import { createSlice } from "@reduxjs/toolkit";

const favSlice = createSlice({
    name: 'favorites',
    initialState: [],
    reducers: {
        addFavourite: (state, action) => {
            if (!action.payload || state.includes(action.payload)) return;
            state.push(action.payload); //updating the existing array

        },
        removeFavourite: (state, action) => {
            if (!action.payload) return;
            return state.filter((ele) => ele != action.payload); //returning new array.
        },
        clearFavourites: (state) => {
            return []; //returning a new array i.e empty
        }
    }
})

export default favSlice.reducer;
export const { addFavourite, removeFavourite, clearFavourites } = favSlice.actions;


//Immer's rule: in a single reducer, you either mutate the draft, or
//return a brand new value — not both. If you mutate AND return something non-undefined,
//Immer throws an error like "An immer producer returned a new value and modified its draft".