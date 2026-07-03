# Pokémon Squad Builder

A practice project built with **React + Vite** to learn and apply **Redux Toolkit** concepts including plain slices, async thunks, and RTK Query. Uses the free [PokéAPI](https://pokeapi.co) — no backend or auth required.

---

## Purpose

This project was built phase by phase to practice three distinct Redux patterns in one connected app:

1. Plain `createSlice` with **array** state
2. Plain `createSlice` with **object** state
3. RTK Query (`createApi`) for async data fetching

---

## Tech Stack

- React 18
- Vite
- Redux Toolkit (`@reduxjs/toolkit`)
- React Redux (`react-redux`)
- PokéAPI (public, read-only)

---

## Project Structure

```
src/
├── app/
│   └── store.js                  # configureStore — registers all slices + RTK Query
├── features/
│   ├── favourites/
│   │   └── favouritesSlice.js    # Plain slice — array state
│   ├── ui/
│   │   └── uiSlice.js            # Plain slice — object state
│   └── pokemon/
│       └── pokemonApi.js         # RTK Query — createApi
├── Component/
│   ├── Pokemon.jsx               # Main component — favourites + filter controls
│   └── FetchedPokemons.jsx       # RTK Query component — list + detail + filters
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

### Immer Mutation Rules

| Pattern | Valid? | When to use |
|---|---|---|
| `state.push(x)` | ✅ | Adding to array |
| `return state.filter(...)` | ✅ | Removing from array |
| `state.push(x); return state` | ❌ | Never — Immer throws |
| `state = []` | ❌ | Never — reassignment does nothing |
| `return []` | ✅ | Clearing array |

### Inline vs Named Functions
- **Named function** — when there are multiple steps (e.g. `handleSubmit` does `preventDefault` + reads `FormData` + dispatches)
- **Inline** — when it's a single dispatch call

```jsx
// Named — justified (multiple steps)
function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    dispatch(addFavourite(data.get('name')));
}

// Inline — cleaner for single dispatch
<button onClick={() => dispatch(clearFavourites())}>Clear</button>
```

---

## What Is Pending / Could Be Improved

### Known Limitations
- **`selectedType` filter only covers 3 types** (fire, water, grass) — PokéAPI has 18 types. The full list (`/type` endpoint) could populate the dropdown dynamically instead of hardcoding.
- **Pokémon list limited to 50** — the `?limit=50` param can be increased, or pagination added with `next`/`previous` from the API response.
- **Type filter only works against the fetched 50** — if a fire-type pokémon isn't in the first 50, it won't appear even after selecting Fire.

### Code Cleanup Pending
- `console.log` statements still in `FetchedPokemons.jsx` — remove before production
- Commented-out `useEffect` (store.subscribe) in `Pokemon.jsx` — remove
- `<span>{value}</span>` debug display — remove

### Features Not Yet Built
- **LocalStorage persistence** — favourites reset on page refresh
- **Pagination** — next/previous buttons using the `next` URL from PokéAPI
- **Dynamic type dropdown** — fetch all 18 types from `/type` endpoint instead of hardcoding 3
- **Favourites filter by type** — `selectedType` currently only filters the main pokémon list, not the favourites list
- **Error boundary** — no graceful UI for API failures beyond `<p>Error...</p>`
- **`useEffect` dependency optimisation** — `filteredPokemon` in the dependency array creates a new reference every render; replacing it with `data` would be more stable

### RTK Query Concepts Not Yet Practiced
- `providesTags` / `invalidatesTags` — cache invalidation (practiced in Posts Manager project)
- `builder.mutation` — POST/PUT/DELETE (PokéAPI is read-only, practiced in Posts Manager)
- `refetch` — manual refetch trigger
- `pollingInterval` — auto-refetch on a timer
- `selectFromResult` — selecting a subset of query data to avoid unnecessary re-renders

---

## Running the Project

```bash
npm install
npm run dev
```

---

## API Reference

| Endpoint | Used for |
|---|---|
| `GET /pokemon?limit=50` | Fetch pokémon list |
| `GET /pokemon/{name}` | Fetch single pokémon detail |
| `GET /type/{type}` | Fetch all pokémon of a given type |