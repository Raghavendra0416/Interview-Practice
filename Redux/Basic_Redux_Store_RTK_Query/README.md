# Pokémon Squad Builder

A practice project built with **React + Vite** to learn and apply **Redux Toolkit** concepts including plain slices, async thunks, and RTK Query. Uses the free [PokéAPI](https://pokeapi.co) for read data and a local **json-server** mock backend for write operations (mutations) — no real backend or auth required.

---

## Purpose

This project was built phase by phase to practice four distinct Redux/RTK Query patterns in one connected app:

1. Plain `createSlice` with **array** state
2. Plain `createSlice` with **object** state
3. RTK Query (`createApi`) for async **read** data (queries)
4. RTK Query (`createApi`) for async **write** data (mutations) against a mock REST backend

---

## Tech Stack

- React 18
- Vite
- Redux Toolkit (`@reduxjs/toolkit`)
- React Redux (`react-redux`)
- PokéAPI (public, read-only)
- json-server (local mock REST backend, for mutation practice)

---

## Project Structure

```
src/
├── app/
│   └── store.js                  # configureStore — registers all slices + both RTK Query APIs
├── features/
│   ├── favourites/
│   │   ├── favouritesSlice.js    # Plain slice — array state (kept as dormant reference, not wired into store)
│   │   └── favouritesApi.js      # RTK Query — createApi with mutations, backed by json-server
│   ├── ui/
│   │   └── uiSlice.js            # Plain slice — object state
│   └── pokemon/
│       └── pokemonApi.js         # RTK Query — createApi (read-only, PokéAPI)
├── Component/
│   ├── Pokemon.jsx               # Active component — favourites (via favouritesApi) + filter controls
│   ├── Pokemon_slice.jsx         # Dormant reference — original dispatch/favouritesSlice version, kept for revision
│   └── FetchedPokemons.jsx       # RTK Query component — list + detail + filters
├── db.json                       # json-server mock database (favourites collection)
└── App.jsx
```

---

## What Was Practiced

### Phase 1 — Store Setup
- `configureStore` from `@reduxjs/toolkit`
- Wrapping the app with `<Provider store={store}>`
- Verifying store in Redux DevTools

### Phase 2 — `favouritesSlice` (Array State)
- `createSlice` with `initialState: []` (bare array, not object)
- Immer mutation patterns learned:
  - `state.push()` — mutates in place, no return
  - `return state.filter(...)` — returns new array, no mutation
  - `return []` — replaces state entirely
- **Key rule**: never mix mutation + return in the same reducer — Immer throws

```js
// Mutation (no return)
addFavourite: (state, action) => {
    if (!action.payload || state.includes(action.payload)) return;
    state.push(action.payload);
}

// Return new value (no mutation)
removeFavourite: (state, action) => {
    return state.filter((ele) => ele !== action.payload);
}
```

### Phase 3 — `uiSlice` (Object State)
- `createSlice` with `initialState: { searchTerm: '', selectedType: '' }`
- Direct property mutation works cleanly with object state (unlike bare array)
- `resetFilters` resets multiple fields at once
- Controlled `<select>` bound directly to Redux state (no local `useState` needed)

```js
// Direct mutation — safe with object state
setSearchTerm: (state, action) => {
    state.searchTerm = action.payload;
}
```

### Phase 4 — RTK Query (`pokemonApi`)
- `createApi` with `fetchBaseQuery`
- `reducerPath` — unique key for the API slice in the store
- Middleware — required for caching, refetching, and auto-invalidation
- `transformResponse` — reshapes raw API response at the API layer so components get clean data

```js
// Without transformResponse: data.results.map(...)
// With transformResponse:    data.map(...)
transformResponse: (response) => response.results
```

- Auto-generated hooks: `useGetPokemonListQuery`, `useGetPokemonByNameQuery`, `useGetPokemonByTypeQuery`
- Loading/error states: `isLoading`, `error`

### Phase 5 — Filter Wiring
- Combined RTK Query data (`data`) with Redux state (`searchTerm`) to produce a filtered list
- `filteredPokemon` is a derived value — computed during render, not stored in Redux

```js
const filteredPokemon = data
    ? data.filter((pokemon) => {
        const matchesSearch = pokemon.name.includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || (typeData === undefined ? true : typeData.includes(pokemon.name));
        return matchesSearch && matchesType;
    })
    : [];
```

### Phase 6 — `getPokemonByType` Endpoint
- Third RTK Query endpoint: `type/${type}` (different PokeAPI endpoint)
- PokéAPI type response is deeply nested: `response.pokemon[i].pokemon.name`
- `transformResponse` flattens it to a simple array of names
- `skip` prevents the API call until a type is selected

```js
transformResponse: (response) => response.pokemon.map((p) => p.pokemon.name)
```

### Phase 7 — RTK Query Mutations (`favouritesApi`)
Since PokéAPI is read-only, a local **json-server** mock backend was introduced specifically to practice mutations (`POST`/`DELETE`) — something the Posts Manager project had covered before, now re-practiced in this codebase for revision purposes.

- **`json-server`** installed as a dev dependency, run separately via `npm run server`, serving `db.json` on `http://localhost:3001`
- New API slice: `favouritesApi.js`, sitting alongside `favouritesSlice.js` (which was intentionally left disconnected from the store — see "Two Favourites Implementations" below)
- `builder.mutation` for `addFavourite` (POST) and `removeFavourite` (DELETE)
- `tagTypes`, `providesTags`, `invalidatesTags` — cache invalidation, so the favourites list automatically refetches after any mutation, with no manual `refetch()` call needed

```js
tagTypes: ['Favourite'],
endpoints: (builder) => ({
    getFavourites: builder.query({
        query: () => '/favourites',
        providesTags: ['Favourite'],
    }),
    getFavouriteByName: builder.query({
        query: (name) => `/favourites?name=${name}`,
    }),
    addFavourite: builder.mutation({
        query: (name) => ({ url: '/favourites', method: 'POST', body: { name } }),
        invalidatesTags: ['Favourite'],
    }),
    removeFavourite: builder.mutation({
        query: (id) => ({ url: `/favourites/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Favourite'],
    }),
})
```

- Mutation hooks return a **trigger function**, not data directly — different shape from query hooks:

```js
const [addFavourite, { isLoading: isAdding }] = useAddFavouriteMutation();
// called later, e.g. on a button click:
addFavourite('pikachu');
```

- **DELETE requires an `id`, not a `name`** — since json-server identifies resources by `/favourites/:id`, `removeFavourite` needed a lookup step (`.find()` on the cached list) to resolve a typed name into its matching `id` before calling the mutation.
- **Controlled input bug found and fixed**: the search `<input>` had `onChange` but no `value` prop, making it an *uncontrolled* component — so `setValue('')` after a mutation updated React state but not the visible input text. Adding `value={value}` made it a proper controlled component, keeping the DOM in sync with state.

---

## Two Favourites Implementations (Intentional)

This codebase deliberately keeps **two parallel favourites implementations** side by side, as a personal revision reference:

| File | Status | Purpose |
|---|---|---|
| `favouritesSlice.js` + `Pokemon_slice.jsx` | Dormant, disconnected from store | Reference for local-state Redux patterns (`createSlice`, Immer, `dispatch`) |
| `favouritesApi.js` + `Pokemon.jsx` | Active, wired into store | Real source of truth — RTK Query mutations against json-server |

`Pokemon_slice.jsx` is not imported anywhere in `App.jsx` — it exists purely to be opened directly when revisiting Redux fundamentals later.

---

## Key Concepts Learned

### `skip` in RTK Query
- Prevents a hook from firing until a condition is met
- Used when the query argument might be `null`/empty at mount time
- Without it: `pokemon/null` → 404 error

```js
// Only fetches when selectedPokemon is not null
useGetPokemonByNameQuery(selectedPokemon, { skip: !selectedPokemon })
```

| `selectedPokemon` | `!selectedPokemon` | Result |
|---|---|---|
| `null` | `true` | Skips — no API call |
| `"pikachu"` | `false` | Fetches `pokemon/pikachu` |

### `providesTags` / `invalidatesTags`
- A **tag** is a label attached to cached data, identifying what category it belongs to
- `providesTags` (on a query) — "this data is of type X"
- `invalidatesTags` (on a mutation) — "after I run, anything tagged X is stale, refetch it"
- Tag names must match **exactly** as strings between `tagTypes`, `providesTags`, and `invalidatesTags` — a typo silently breaks invalidation with no error
- Scoped precisely: a mutation only refetches endpoints that `provide` the same tag it `invalidates` — unrelated cached data (e.g. `pokemonApi`'s cache) is untouched

| Concept | Used on | Meaning |
|---|---|---|
| `tagTypes` | top-level `createApi` config | Declares valid tag names |
| `providesTags` | query | "I supply data of type X" |
| `invalidatesTags` | mutation | "I make data of type X stale" |

### Query vs Mutation Hook Shape
| | Query hook | Mutation hook |
|---|---|---|
| Fires | Automatically on mount (unless `skip`) | Only when trigger function is called |
| Returns | `{ data, isLoading, error }` | `[triggerFn, { isLoading, error }]` |
| Example | `useGetFavouritesQuery()` | `const [addFavourite] = useAddFavouriteMutation()` |

### Controlled vs Uncontrolled Inputs
| | Controlled | Uncontrolled |
|---|---|---|
| Value source | React state (`value={value}`) | DOM itself |
| Update mechanism | `onChange` → `setState` | Browser handles it natively |
| Access value | Directly from state variable | Via `ref.current.value` |
| Gotcha | Must set `value` prop, not just `onChange` | Fine for simple/uncontrolled forms |

### Immer Mutation Rules

| Pattern | Valid? | When to use |
|---|---|---|
| `state.push(x)` | ✅ | Adding to array |
| `return state.filter(...)` | ✅ | Removing from array |
| `state.push(x); return state` | ❌ | Never — Immer throws |
| `state = []` | ❌ | Never — reassignment does nothing |
| `return []` | ✅ | Clearing array |

### Inline vs Named Functions
- **Named function** — when there are multiple steps (e.g. `handleRemove` looks up an `id` by name, then calls the mutation, then clears input)
- **Inline** — when it's a single dispatch/mutation call

```jsx
// Named — justified (multiple steps)
function handleRemove() {
    const match = favPokemonNames?.find((fav) => fav.name === value);
    if (match) removeFavourite(match.id);
    setValue('');
}

// Inline — cleaner for a single call
<button onClick={() => { addFavourite(value); setValue(''); }}>Add</button>
```

---

## What Is Pending / Could Be Improved

### Known Limitations
- **`selectedType` filter only covers 3 types** (fire, water, grass) — PokéAPI has 18 types. The full list (`/type` endpoint) could populate the dropdown dynamically instead of hardcoding.
- **Pokémon list limited to 50** — the `?limit=50` param can be increased, or pagination added with `next`/`previous` from the API response.
- **Type filter only works against the fetched 50** — if a fire-type pokémon isn't in the first 50, it won't appear even after selecting Fire.
- **`getFavouriteByName` endpoint built but not fully wired into UI** — currently unused/disabled button in `Pokemon.jsx`; would need a lazy-query pattern (`useLazyGetFavouriteByNameQuery`) for a proper manual "search" button rather than auto-firing on every keystroke.
- **`removeFavourite` relies on exact name match via `.find()`** — case sensitivity and partial matches aren't handled.

### Code Cleanup Pending
- `console.log` statements still in `FetchedPokemons.jsx` — remove before production
- Commented-out `useEffect` (store.subscribe) in `Pokemon.jsx` / `Pokemon_slice.jsx` — remove
- `<span>{value}</span>` debug display — remove

### Features Not Yet Built
- **LocalStorage persistence** — n/a for `favouritesApi` (already persisted via json-server/`db.json`), but still relevant for `favouritesSlice` reference version
- **Pagination** — next/previous buttons using the `next` URL from PokéAPI
- **Dynamic type dropdown** — fetch all 18 types from `/type` endpoint instead of hardcoding 3
- **Favourites filter by type** — `selectedType` currently only filters the main pokémon list, not the favourites list
- **Error boundary** — no graceful UI for API failures beyond `<p>Error...</p>`
- **`useEffect` dependency optimisation** — `filteredPokemon` in the dependency array creates a new reference every render; replacing it with `data` would be more stable
- **Optimistic updates** — `onQueryStarted` + manual cache patching for instant UI feedback on add/remove, with rollback on failure (natural next step for the favourites mutations)
- **Bulk clear** — `clearFavourites` has no equivalent in `favouritesApi` yet; would need either a loop of DELETE calls or a dedicated json-server route

### RTK Query Concepts Still Not Practiced
- `refetch` — manual refetch trigger
- `pollingInterval` — auto-refetch on a timer
- `selectFromResult` — selecting a subset of query data to avoid unnecessary re-renders
- Optimistic updates via `onQueryStarted`
- Tags with IDs (`{ type: 'Favourite', id }`) for granular per-item invalidation instead of invalidating the whole list

---

## Running the Project

```bash
# Terminal 1 — start the mock backend (favourites mutations)
npm run server

# Terminal 2 — start the Vite dev server
npm run dev
```

---

## API Reference

| Endpoint | Source | Used for |
|---|---|---|
| `GET /pokemon?limit=50` | PokéAPI | Fetch pokémon list |
| `GET /pokemon/{name}` | PokéAPI | Fetch single pokémon detail |
| `GET /type/{type}` | PokéAPI | Fetch all pokémon of a given type |
| `GET /favourites` | json-server | Fetch favourites list |
| `GET /favourites?name={name}` | json-server | Fetch favourite(s) by name |
| `POST /favourites` | json-server | Add a favourite |
| `DELETE /favourites/{id}` | json-server | Remove a favourite by id |