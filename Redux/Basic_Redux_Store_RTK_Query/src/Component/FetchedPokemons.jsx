import { useState } from 'react';

import { useGetPokemonListQuery, useGetPokemonByNameQuery } from '../features/pokemon/pokemonApi';

function FetcedPokemons() {

    //RTK Query
    //Fetching all Pokemons
    const { data, isLoading, error } = useGetPokemonListQuery();
    console.log('isLoading:', isLoading);
    console.log('data:', data);
    console.log('error:', error);

    //Fetch pokemon by name
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const { data: pokemonDetail, isLoading: detailLoading } = useGetPokemonByNameQuery(
        selectedPokemon,
        { skip: !selectedPokemon }
    );

    return (
        <>
            {/* Pokemon List from RTK Query */}
            <div>
                <h2>Pokemon List:</h2>
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {data && (
                    <ul>
                        {data.map((pokemon) => (
                            <li key={pokemon.name}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedPokemon(pokemon.name)}>
                                {pokemon.name}</li>
                        ))}
                    </ul>
                )}
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