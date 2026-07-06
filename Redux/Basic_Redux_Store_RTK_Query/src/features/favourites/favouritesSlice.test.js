import { describe, it, expect } from 'vitest';
import favouritesReducer, { addFavourite, removeFavourite, clearFavourites } from './favouritesSlice';

//This is just reference file, this file tests the favouritesSlice.js but we are not using that file.
//We have done testig on that file because it is easy to understand than FavouritesApi.


// describe() groups related tests together — here, everything about favouritesSlice
describe('favouritesSlice', () => {

    // Test 1: initial state
    it('should return the initial state (empty array) when no action matches', () => {
        // Passing `undefined` as state and an unrelated action type
        // simulates the very first time the reducer runs — Redux does this internally on store creation
        const state = favouritesReducer(undefined, { type: 'unknown' });
        expect(state).toEqual([]);
    });

    // Test 2: addFavourite — normal case
    it('should add a new favourite to the array', () => {
        const initialState = [];
        const newState = favouritesReducer(initialState, addFavourite('pikachu'));
        expect(newState).toEqual(['pikachu']);
    });

    // Test 3: addFavourite — duplicate prevention
    // This tests the specific guard clause you wrote:
    // if (!action.payload || state.includes(action.payload)) return;
    it('should NOT add a duplicate favourite', () => {
        const initialState = ['pikachu'];
        const newState = favouritesReducer(initialState, addFavourite('pikachu'));
        expect(newState).toEqual(['pikachu']); // still just one entry, no duplicate
    });

    // Test 4: addFavourite — empty payload guard
    it('should NOT add an empty/falsy favourite', () => {
        const initialState = ['pikachu'];
        const newState = favouritesReducer(initialState, addFavourite(''));
        expect(newState).toEqual(['pikachu']); // unchanged
    });

    // Test 5: removeFavourite
    it('should remove a favourite by name', () => {
        const initialState = ['pikachu', 'charizard'];
        const newState = favouritesReducer(initialState, removeFavourite('pikachu'));
        expect(newState).toEqual(['charizard']);
    });

    // Test 6: removeFavourite — item not in list
    it('should return the same list if the item to remove does not exist', () => {
        const initialState = ['pikachu'];
        const newState = favouritesReducer(initialState, removeFavourite('bulbasaur'));
        expect(newState).toEqual(['pikachu']); // nothing changes
    });

    // Test 7: clearFavourites
    it('should clear all favourites', () => {
        const initialState = ['pikachu', 'charizard'];
        const newState = favouritesReducer(initialState, clearFavourites());
        expect(newState).toEqual([]);
    });

    // Test 8: immutability check — a common interview question
    // Confirms the reducer never mutates the ORIGINAL state object directly,
    // which is the core Redux rule (even though Immer makes it look like direct mutation)
    it('should not mutate the original state object', () => {
        const initialState = ['pikachu'];
        const newState = favouritesReducer(initialState, addFavourite('charizard'));
        expect(newState).not.toBe(initialState); // different reference
        expect(initialState).toEqual(['pikachu']); // original untouched
    });

});