import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const favouritesApi = createApi({
    reducerPath: "favouriteApi",
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001',
    }),
    //Tag is a String used to cache data
    tagTypes: ['Favourite'],
    endpoints: (builder) => ({
        getFavourites: builder.query({
            //query must be a function returning a URL
            query: () => '/favourites',
            providesTags: ['Favourite'],
        }),
        getFavouriteByName: builder.query({
            query: (name) => `/favourites?name=${name}`,
        }),
        addFavourite: builder.mutation({
            query: (name) => ({
                url: "/favourites",
                method: 'POST',
                body: { name },
            }),
            invalidatesTags: ['Favourite'],
        }),

        removeFavourite: builder.mutation({
            query: (id) => ({
                url: `/favourites/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Favourite'],
        }),

    })
})

export const {
    useGetFavouritesQuery,
    useGetFavouriteByNameQuery,
    useAddFavouriteMutation,
    useRemoveFavouriteMutation,
} = favouritesApi;


//Tags must match as exact strings. tagTypes, providesTags, and invalidatesTags are just referencing the same label across different places.
// If you write 'Favourite' in tagTypes but then typo 'Favorite' (American spelling) in providesTags, RTK Query won't throw an error — it'll just silently
// treat them as two unrelated tags, and your invalidation simply won't work. No warning, just a UI that mysteriously doesn't refresh.
// This is a common silent bug, so exact string matching matters a lot here.