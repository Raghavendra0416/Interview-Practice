import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: {
        searchTerm: "",
        selectedType: "",
    },
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setSelectedType: (state, action) => {
            state.selectedType = action.payload;
        },
        resetFilters: (state, action) => {
            state.searchTerm = '';
            state.selectedType = '';
        }
    }
})

export default uiSlice.reducer;
export const { setSearchTerm, setSelectedType, resetFilters } = uiSlice.actions; 