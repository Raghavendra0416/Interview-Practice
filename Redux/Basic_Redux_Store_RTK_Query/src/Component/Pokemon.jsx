import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { addFavourite, removeFavourite, clearFavourites } from '../features/favourites/favouritesSlice'
import { setSearchTerm, setSelectedType, resetFilters } from '../features/ui/uiSlice';

import store from '../app/store';
import { useGetPokemonListQuery, useGetPokemonByNameQuery } from '../features/pokemon/pokemonApi';
import FetcedPokemons from './FetchedPokemons';

function Pokemon() {
    useEffect(() => {
        const unsubscribe = store.subscribe(() => console.log(store.getState()));
        return unsubscribe;
    }, [])

    const { searchTerm, selectedType } = useSelector(state => state.ui);
    const [value, setValue] = useState('');
    const Favourites = useSelector(state => state.favourites);
    const dispatch = useDispatch();

    function handleChange(e) {
        setValue(e.target.value);
    }

    return (
        <>
            <h1>Welcome</h1>
            <label htmlFor="name">Enter Name: </label>
            <input type="text" id="name" name="name" placeholder="Enter Name..."
                onChange={handleChange} />
            <span> {value} </span>

            {/* Favourite Slice */}
            <div style={{ margin: '10px', display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => dispatch(addFavourite(value))}>Add Favourite Pokemon</button>
                <button type="button" onClick={() => dispatch(removeFavourite(value))}>Remove Pokemon</button>
                <button type="button" onClick={() => dispatch(clearFavourites())}>Remove All Pokemons</button>
            </div>

            {/* UI Slice - Filters */}
            <div style={{ margin: '10px', display: 'flex', gap: '10px' }}>
                <select
                    value={selectedType}
                    onChange={(e) => dispatch(setSelectedType(e.target.value))}
                >
                    <option value="">Select Type</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="grass">Grass</option>
                </select>
                <button type="button" onClick={() => dispatch(setSearchTerm(value))}>Search Favourite Pokemon</button>
                <button type="button" onClick={() => dispatch(resetFilters())}>Reset Filter</button>
            </div>

            <p>Search: {searchTerm} | Type: {selectedType}</p>

            <div style={{ border: '1px solid black', height: 'auto', width: '500px' }}>
                <h2>Favourite Pokemons:</h2>
                <ul>
                    {Favourites.map((fav) => <li key={fav}>{fav}</li>)}
                </ul>
            </div>

            {/* RTK Query Fetched Pokemons */}
            <FetcedPokemons />
        </>
    )
}

export default Pokemon;