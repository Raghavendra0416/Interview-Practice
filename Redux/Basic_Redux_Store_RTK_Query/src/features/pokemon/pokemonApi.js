import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const pokemonApi = createApi({
    reducerPath: 'pokemonApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://pokeapi.co/api/v2/',
    }),
    endpoints: (builder) => ({
        //Fetch Pokemons Data
        getPokemonList: builder.query({
            query: () => 'pokemon?limit=50',
            //transformResponse fixes that at the API layer — so components just get the array directly.
            //The data we receive is in JSON format and results conatin the pokemon data, 
            //so we are returning data instead of  JSON. and the below helps that. 
            transformResponse: (response) => response.results,
            //If this is not used then we have to access the data like: data.results.map(...),
            //now we can access like: data.map()
        }),

        //Fetch Pokemon by name
        getPokemonByName: builder.query({
            query: (name) => `pokemon/${name}`,
        }),

        getPokemonByType: builder.query({
            query: (type) => `type/${type}`,
            transformResponse: (response) => response.pokemon.map((p) => p.pokemon.name),
        })
    })
});

export const {
    useGetPokemonListQuery,
    useGetPokemonByNameQuery,
    useGetPokemonByTypeQuery,
} = pokemonApi;