import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetPokemonListQuery, useGetPokemonByNameQuery, useGetPokemonByTypeQuery } from '../features/pokemon/pokemonApi';


function FetcedPokemons() {

    //RTK Query
    const { searchTerm, selectedType } = useSelector(state => state.ui);

    //Fetching all Pokemons
    const { data, isLoading, error } = useGetPokemonListQuery();
    console.log('isLoading:', isLoading);
    console.log('data:', data);
    console.log('error:', error);

    //Fetch pokemon by name
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const { data: pokemonDetail, isLoading: detailLoading } = useGetPokemonByNameQuery(
        selectedPokemon,
        //The data might not exist so the API call should wait until user selected something,
        // So Skip will make sure that api call is not being made until user selected something
        { skip: !selectedPokemon } //Use it only when the query depends on a value that might not exist yet
    );

    const { data: typeData } = useGetPokemonByTypeQuery(
        selectedType,
        //The data might not exist so the API call should wait until user selected something,
        // So Skip will make sure that api call is not being made until user selected something
        { skip: !selectedType } //Use it only when the query depends on a value that might not exist yet
    );
    console.log('typeData:', typeData);

    //Filtering Pokemons
    const filteredPokemon = data
        ? data.filter((pokemon) => {
            const matchesSearch = pokemon.name.includes(searchTerm.toLowerCase());
            const matchesType = !selectedType || (typeData === undefined ? true : typeData.includes(pokemon.name));
            return matchesSearch && matchesType;
        })
        : [];

    useEffect(() => {
        const exactMatch = filteredPokemon.find(p => p.name === searchTerm.toLowerCase());
        if (exactMatch) {
            setSelectedPokemon(exactMatch.name);
        }
    }, [searchTerm, filteredPokemon]);

    return (
        <>

            <p>Search Term: {searchTerm} | Type: {selectedType}</p>

            {/* Pokemon List from RTK Query */}
            <div>
                <h2>Pokemon List:</h2>
                {isLoading && <p>Loading...</p>}
                {selectedType && !typeData && <p>Loading type filter...</p>}
                {error && <p>Error: {error.message}</p>}
                <ul>
                    {filteredPokemon.map((pokemon) => (
                        <li key={pokemon.name}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedPokemon(pokemon.name)}>
                            {pokemon.name}</li>
                    ))}
                </ul>
            </div>

            {/* Pokemon Detail */}
            <div>
                <h2>Pokemon Detail:</h2>
                {detailLoading && <p>Loading detail...</p>}
                {pokemonDetail && (
                    <div>
                        <p>Name: {pokemonDetail.name}</p>
                        <p>Height: {pokemonDetail.height}</p>
                        <p>Weight: {pokemonDetail.weight}</p>
                        <img src={pokemonDetail.sprites.front_default} alt={pokemonDetail.name} />
                    </div>
                )}
            </div>
        </>
    )
}

export default FetcedPokemons;