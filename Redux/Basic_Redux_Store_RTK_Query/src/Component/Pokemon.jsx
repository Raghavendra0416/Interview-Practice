import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { addFavourite, removeFavourite, clearFavourites } from '../features/favourites/favouritesSlice'
import { setSearchTerm, setSelectedType, resetFilters } from '../features/ui/uiSlice';

// import store from '../app/store';
import FetchedPokemons from './FetchedPokemons';
import styles from './Pokemon.module.css';

function Pokemon() {
    // useEffect(() => {
    //     const unsubscribe = store.subscribe(() => console.log(store.getState()));
    //     return unsubscribe;
    // }, [])

    const { selectedType } = useSelector(state => state.ui);
    const [value, setValue] = useState(''); 
    const Favourites = useSelector(state => state.favourites);
    const dispatch = useDispatch();

    function handleChange(e) {
        setValue(e.target.value);
    }

    return (
        <>
            <h1 className={styles.heading}>Welcome</h1>
            <label className={styles.label} htmlFor="name">Enter Name: </label>
            <input className={styles.input} type="text" id="name" name="name" placeholder="Enter Name..."
                onChange={handleChange} />
            <span className={styles.valueDisplay}> {value} </span>

            {/* Favourite Slice */}
            <div className={styles.actionRow}>
                <button className={styles.button} type="button" onClick={() => dispatch(addFavourite(value))}>Add Favourite Pokemon</button>
                <button className={styles.button} type="button" onClick={() => dispatch(removeFavourite(value))}>Remove Pokemon</button>
                <button className={styles.button} type="button" onClick={() => dispatch(clearFavourites())}>Remove All Pokemons</button>
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
                <ul className={styles.favouritesList}>
                    {Favourites.map((fav) => <li key={fav}>{fav}</li>)}
                </ul>
            </div>

            {/* RTK Query Fetched Pokemons */}
            <FetchedPokemons />
        </>
    )
}

export default Pokemon;