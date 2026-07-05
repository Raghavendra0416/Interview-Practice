import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { useGetFavouritesQuery, useGetFavouriteByNameQuery, useAddFavouriteMutation, useRemoveFavouriteMutation } from '../features/favourites/favouritesApi'
import { setSearchTerm, setSelectedType, resetFilters } from '../features/ui/uiSlice';

// import store from '../app/store'; -> not using store, just for understanding
import FetchedPokemons from './FetchedPokemons';
import styles from './Pokemon.module.css';

//Using Internal API i.e db.json

function Pokemon() {
    // useEffect(() => {
    //     const unsubscribe = store.subscribe(() => console.log(store.getState()));
    //     return unsubscribe;
    // }, [])

    const [value, setValue] = useState('');
    const { selectedType } = useSelector(state => state.ui);
    const dispatch = useDispatch();


    // To rename it while destructuring, you use the `oldName: newName` syntax
    const { data: favPokemonNames, isLoading, error } = useGetFavouritesQuery();
    const { data: favPokeName, isLoading: isLoad, error: err } = useGetFavouriteByNameQuery(
        value,
        { skip: !value }
    );
    const [addFavourite, { isLoading: isAdding }] = useAddFavouriteMutation();
    const [removeFavourite, { isLoading: isRemoving }] = useRemoveFavouriteMutation();



    function handleChange(e) {
        setValue(e.target.value);
    }

    // so we can extract its `id` before calling removeFavourite (which needs id, not name)
    function handleRemove() {
        // const match = favPokemonNames?.find((fav) => fav.name === value);

        // entities is keyed by id, not name — so to find by name we still need to search,
        // but now we search Object.values(entities) instead of the old flat array
        const match = favPokemonNames
            ? Object.values(favPokemonNames.entities).find((fav) => fav.name === value)
            : undefined;

        if (match) {
            removeFavourite(match.id);
        }
        setValue('');
    }

    console.log('favPokemonNames:', favPokemonNames);

    return (
        <>
            <h1 className={styles.heading}>Welcome to Pokémon Squad Builder</h1>
            <label className={styles.label} htmlFor="name">Enter Name: </label>
            <input className={styles.input} type="text" id="name" name="name" placeholder="Enter Name..."
                value={value}
                onChange={handleChange} />
            <span className={styles.valueDisplay}> {value} </span>

            {/* Favourite Slice */}
            <div className={styles.actionRow}>
                <button className={styles.button} type="button" onClick={() => {
                    addFavourite(value);
                    setValue('');
                }}>Add Favourite Pokemon</button>
                {/* Disabled - this button doesn't need an onClick at all — useGetFavouriteByNameQuery
                    already fires automatically once `value` is set (via skip logic above).
                    Keeping a button here is optional; if you want it purely to make the search
                    explicit/manual, we'd need a different approach (lazy query). For now, removed
                    the broken empty onClick so the file compiles.  */}
                {/* <button className={styles.button} type="button" >Search Pokemon By Name</button> */}
                <button className={styles.button} type="button" onClick={handleRemove}>Remove Pokemon</button>
            </div>

            {/* UI Slice - Filters */}
            <div className={styles.filterRow}>
                <select
                    className={styles.select}
                    value={selectedType}
                    onChange={(e) => dispatch(setSelectedType(e.target.value))}
                >
                    <option value="">Select Type</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="grass">Grass</option>
                </select>
                <button className={styles.button} type="button" onClick={() => dispatch(setSearchTerm(value))}>Search Favourite Pokemon</button>
                <button className={styles.button} type="button" onClick={() => {
                    dispatch(resetFilters());
                    setValue('');
                }}>Reset Filter</button>
            </div>

            {/* <p>Search: {searchTerm} | Type: {selectedType}</p> */}

            <div className={styles.favouritesBox}>
                <h2 className={styles.favouritesHeading}>Favourite Pokemons:</h2>

                {isLoading && <p>Loading favourites...</p>}
                {error && <p>Error loading favourites.</p>}


                <ul className={styles.favouritesList}>
                    {/* optional chaining — if favPokemonNames is undefined (query not resolved yet),
                        this whole expression short-circuits to undefined instead of throwing */}
                    {/* ids holds the array of keys in insertion order — loop through ids, then look up each one directly in entities (O(1) lookup, no searching) */}
                    {favPokemonNames?.ids?.map((id) => {
                        const fav = favPokemonNames.entities[id];
                        return <li key={fav.id}>{fav.name}</li>;
                    })}
                </ul>
            </div>

            {/* RTK Query Fetched Pokemons */}
            <FetchedPokemons />
        </>
    )
}

export default Pokemon;