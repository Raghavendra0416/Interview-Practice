import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const pokemonApi = createApi({
    reducerPath: 'pokemonApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://pokeapi.co/api/v2/',
    }),
    endpoints: (builder) => ({
        getPokemonList: builder.query({
            query: () => 'pokemon?limit=50',
            //transformResponse fixes that at the API layer — so components just get the array directly.
            transformResponse: (response) => response.results,
        }),
        getPokemonByName: builder.query({
            query: (name) => `pokemon/${name}`,
        })
    })
});

export const {
    useGetPokemonListQuery,
    useGetPokemonByNameQuery,
} = pokemonApi;