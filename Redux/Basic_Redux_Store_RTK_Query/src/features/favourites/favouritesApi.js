import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// createEntityAdapter is used to directly get the data instead of looping over data.
// Just get the specific record in that data and remove that data/fetch that data.
import { createEntityAdapter } from '@reduxjs/toolkit';

const favouritesAdapter = createEntityAdapter();

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
            // json-server returns a flat array like [{id, name}, ...].
            // We convert that into normalized shape {ids: [...], entities: {...}}
            // so lookups by id become instant (O(1)) instead of looping through the array.
            transformResponse: (response) => favouritesAdapter.setAll(favouritesAdapter.getInitialState(), response),
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
            // RTK Query gives you a lifecycle hook on mutations called onQueryStarted. It runs right when the mutation starts (before the server responds), and gives you access to:
            // The cache, so you can manually edit it(dispatch(api.util.updateQueryData(...)))
            // A queryFulfilled promise you can await — if it resolves, the request succeeded; if it throws, it failed
            async onQueryStarted(name, { dispatch, queryFulfilled }) {
                /// Step 1: optimistically update the cache — runs immediately, before the POST request even resolves
                //capturing the return value(patchResult) gives you the .undo() method for later, in case things go wrong.
                const patchResult = dispatch(
                    //immediately edits the cached getFavourites data, pushing your optimistic entry with a disposable temp-${Date.now()} id.
                    //This is synchronous — it happens the instant addFavourite(name) is called, so your UI updates right away.
                    favouritesApi.util.updateQueryData('getFavourites', undefined, (draft) => {
                        // draft.push({ id: `temp-${Date.now()}`, name }); -> for normal array
                        favouritesAdapter.addOne(draft, { id: `temp-${Date.now()}`, name });
                    })
                );

                try {
                    // Step 2: wait for the real server response
                    //this is a promise RTK Query gives you that resolves when the actual POST request completes successfully, or rejects/throws if it fails (network error, server error, etc.).
                    await queryFulfilled;
                    // If we get here, POST succeeded — nothing else to do.
                    // invalidatesTags will trigger a refetch, replacing our temp entry
                    // with the real server data (real id included).
                } catch {
                    // Step 3: POST failed — undo exactly the change we made in Step 1
                    //Reverts the cache exactly back to what it was before your optimistic push — removing the temp entry cleanly.
                    patchResult.undo();
                }
            },
        }),

        removeFavourite: builder.mutation({
            query: (id) => ({
                url: `/favourites/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Favourite'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    favouritesApi.util.updateQueryData('getFavourites', undefined, (draft) => {
                        // const matchIndex = draft.findIndex((fav) => fav.id === id);
                        // if (matchIndex !== -1) {
                        //     draft.splice(matchIndex, 1);
                        // } --> used for array

                        favouritesAdapter.removeOne(draft, id);
                    })
                );
                try {
                    await queryFulfilled;
                } catch (err) {
                    patchResult.undo();
                }
            }
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