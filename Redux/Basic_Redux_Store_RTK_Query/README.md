# Pokémon Squad Builder

A practice project built with **React + Vite** to learn and apply **Redux Toolkit** concepts including plain slices, async thunks, and RTK Query. Uses the free [PokéAPI](https://pokeapi.co) for read data and a local **json-server** mock backend for write operations (mutations) — no real backend or auth required.

---

## Purpose

This project was built phase by phase to practice Redux/RTK Query patterns in one connected app, deliberately covering both fundamentals and interview-relevant advanced patterns:

1. Plain `createSlice` with **array** state
2. Plain `createSlice` with **object** state
3. RTK Query (`createApi`) for async **read** data (queries)
4. RTK Query (`createApi`) for async **write** data (mutations) against a mock REST backend
5. Optimistic updates with rollback
6. Normalized state via `createEntityAdapter`
7. Custom Redux middleware
8. Testing a reducer in isolation

---

## Tech Stack

- React 18
- Vite
- Redux Toolkit (`@reduxjs/toolkit`)
- React Redux (`react-redux`)
- PokéAPI (public, read-only)
- json-server (local mock REST backend, for mutation practice)
- Vitest (unit testing)

---

## Project Structure

```
src/
├── app/
│   ├── store.js                  # configureStore — registers all slices, both RTK Query APIs, and loggerMiddleware
│   └── loggerMiddleware.js       # Custom middleware — logs state before/after every dispatched action
├── features/
│   ├── favourites/
│   │   ├── favouritesSlice.js       # Plain slice — array state (kept as dormant reference, not wired into store)
│   │   ├── favouritesSlice.test.js  # Vitest unit tests for favouritesSlice reducer
│   │   └── favouritesApi.js         # RTK Query — createApi with mutations, optimistic updates, and createEntityAdapter
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
Since PokéAPI is read-only, a local **json-server** mock backend was introduced specifically to practice mutations (`POST`/`DELETE`).

- **`json-server`** installed as a dev dependency, run separately via `npm run server`, serving `db.json` on `http://localhost:3001`
- New API slice: `favouritesApi.js`, sitting alongside `favouritesSlice.js` (intentionally left disconnected from the store — see "Two Favourites Implementations" below)
- `builder.mutation` for `addFavourite` (POST) and `removeFavourite` (DELETE)
- `tagTypes`, `providesTags`, `invalidatesTags` — cache invalidation, so the favourites list automatically refetches after any mutation, with no manual `refetch()` call needed

```js
tagTypes: ['Favourite'],
endpoints: (builder) => ({
    getFavourites: builder.query({
        query: () => '/favourites',
        providesTags: ['Favourite'],
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

- Mutation hooks return a **trigger function**, not data directly:
```js
const [addFavourite, { isLoading: isAdding }] = useAddFavouriteMutation();
addFavourite('pikachu'); // called later, e.g. on a button click
```

- **DELETE requires an `id`, not a `name`** — required a lookup step to resolve a typed name into its matching `id` before calling the mutation.
- **Controlled input bug found and fixed**: the search `<input>` had `onChange` but no `value` prop, making it *uncontrolled* — `setValue('')` after a mutation updated React state but not the visible input text. Adding `value={value}` fixed it.

### Phase 8 — Optimistic Updates, Normalized State, Middleware, Testing

**Optimistic updates with rollback (`onQueryStarted`)**
- RTK Query's `onQueryStarted` lifecycle hook runs the moment a mutation starts, before the server responds
- Used `dispatch(favouritesApi.util.updateQueryData(...))` to update the cache **immediately** — before the network request resolves — so the UI reflects the change instantly
- Captured the returned `patchResult`, which has an `.undo()` method — called inside a `catch` block if `queryFulfilled` rejects, cleanly reverting the optimistic change
- Temporary optimistic entries used a disposable id (`temp-${Date.now()}`) since the real server-assigned id isn't known yet; this is safe because the entry is fully replaced once `invalidatesTags` triggers a real refetch on success

```js
addFavourite: builder.mutation({
    query: (name) => ({ url: "/favourites", method: 'POST', body: { name } }),
    invalidatesTags: ['Favourite'],
    async onQueryStarted(name, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
            favouritesApi.util.updateQueryData('getFavourites', undefined, (draft) => {
                favouritesAdapter.addOne(draft, { id: `temp-${Date.now()}`, name });
            })
        );
        try {
            await queryFulfilled;
        } catch {
            patchResult.undo(); // rollback on failure
        }
    },
}),
```

- **Tested by simulating failure**: stopped `json-server` mid-test to force the mutation to fail, confirmed the optimistically-added item appeared instantly, then disappeared again once the request failed — proving rollback worked end-to-end.

**Normalized state with `createEntityAdapter`**
- Replaced the plain array cache shape (`[{id, name}, ...]`) with a normalized shape: `{ ids: [...], entities: { [id]: {...} } }`
- `entities[id]` gives O(1) lookup by id, versus `array.find()`/`findIndex()` which is O(n) — a meaningful difference at scale
- `favouritesAdapter.setAll(getInitialState(), response)` used in `transformResponse` to normalize the raw json-server array on the way into the cache
- `favouritesAdapter.addOne(draft, entity)` / `favouritesAdapter.removeOne(draft, id)` replaced manual `draft.push(...)` / `draft.findIndex()` + `draft.splice()` inside the optimistic update logic — Immer-safe and adapter-aware
- Rendering the list required switching from `.map()` on a flat array to `ids.map(id => entities[id])`, since `entities` is an object, not an array
- **Tradeoff discussed**: normalization only optimizes lookup by the keyed field (`id`). Looking up "by name" (as `removeFavourite`'s UI flow needs) still requires `Object.values(entities).find(...)` — a full scan. For a small list this is fine; a larger app might maintain a secondary `nameToId` index.

**Custom middleware**
- Wrote `loggerMiddleware.js` from scratch to understand Redux's three-stage curried middleware signature: `(store) => (next) => (action) => {...}`
- Reasoned through *why* it's curried rather than one function with three parameters: `store` and `next` are resolved once at store-setup time (once per app), while only `(action) => {...}` needs to run on every single dispatch — separating one-time wiring cost from repeated per-dispatch cost
- Logs state before the action, the action itself, then state after — critically, calls `next(action)` and returns its result, since skipping `next(action)` would silently break the entire app (the action would never reach the reducer)
- Wired into `store.js` via `.concat(pokemonApi.middleware, favouritesApi.middleware, loggerMiddleware)` — placed **last** in the chain, so "state after" reflects the true final state once all other middleware has run

```js
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('State before:', store.getState());
    console.log('Action:', action);
    const result = next(action);
    console.log('State after:', store.getState());
    return result;
};
```

**Testing a reducer (Vitest)**
- Installed Vitest, tested `favouritesSlice.js` (the plain reducer) in isolation — no React, no store, no mocking needed, since reducers are pure functions
- Covered: initial state, adding a favourite, duplicate prevention, empty-payload guard, removing an item (present and absent), clearing all, and an explicit immutability check (`.not.toBe(initialState)`) confirming the reducer never mutates the original state reference
- **Note**: tests target `favouritesSlice.js`, the dormant reference file, not the active `favouritesApi.js`. Testing RTK Query mutations directly would require mocking network calls (e.g. via MSW) — a heavier lift considered lower priority for this round of practice.

---

## A Real Bug Worth Remembering: Case-Sensitivity in Import Paths

During Phase 8, `Pokemon.jsx` stopped receiving normalized data from `favouritesApi`, even though Network tab requests succeeded with correct data (200 status, correct payload).

**Root cause**: `store.js` imported the API slice as `favouritesAPI` (capital `API`), while the actual file on disk was `favouritesApi.js` (lowercase `pi`), and `Pokemon.jsx` imported it correctly as `favouritesApi`. On Windows' case-insensitive filesystem, both import paths resolved to the same physical file without erroring — but the bundler's module resolution treated the two differently-cased import specifiers as **separate module identities**. This meant `store.js` and `Pokemon.jsx` were effectively holding two different instances of the same API slice — so the real Redux store (wired via `store.js`'s import) never received the `transformResponse`/`createEntityAdapter` logic that `Pokemon.jsx`'s instance expected.

**Fix**: made both imports use the exact same casing, matching the real filename.

**Why this is worth remembering**: this exact bug would throw an outright "module not found" error on a case-sensitive filesystem (Linux, most CI/deployment environments) instead of silently corrupting behavior like it did locally on Windows — a good example of a bug that "works on my machine" but wouldn't survive deployment.

---

## Two Favourites Implementations (Intentional)

This codebase deliberately keeps **two parallel favourites implementations** side by side, as a personal revision reference:

| File | Status | Purpose |
|---|---|---|
| `favouritesSlice.js` + `Pokemon_slice.jsx` | Dormant, disconnected from store | Reference for local-state Redux patterns (`createSlice`, Immer, `dispatch`); also the target of the Vitest reducer tests |
| `favouritesApi.js` + `Pokemon.jsx` | Active, wired into store | Real source of truth — RTK Query mutations, optimistic updates, normalized state via `createEntityAdapter` |

`Pokemon_slice.jsx` is not imported anywhere in `App.jsx` — it exists purely to be opened directly when revisiting Redux fundamentals later.

---

## Key Concepts Learned

### `skip` in RTK Query
- Prevents a hook from firing until a condition is met
- Without it: `pokemon/null` → 404 error

```js
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
- Tag names must match **exactly** as strings — a typo silently breaks invalidation with no error
- Scoped precisely: a mutation only refetches endpoints that `provide` the same tag it `invalidates`

| Concept | Used on | Meaning |
|---|---|---|
| `tagTypes` | top-level `createApi` config | Declares valid tag names |
| `providesTags` | query | "I supply data of type X" |
| `invalidatesTags` | mutation | "I make data of type X stale" |

### Optimistic Updates & Rollback
| Step | What happens |
|---|---|
| 1. User action | UI updates **immediately**, before server responds (optimistic) |
| 2. Request sent | Real mutation fires in the background |
| 3a. Success | Nothing else needed — UI was already correct; `invalidatesTags` refetches to reconcile with real server data |
| 3b. Failure | `patchResult.undo()` reverts the optimistic change exactly — UI returns to its pre-optimistic state |

### Normalized State (`createEntityAdapter`)
| Shape | Lookup by id | Notes |
|---|---|---|
| Plain array `[{id, name}, ...]` | O(n) — `.find()`/`.findIndex()` scans the array | Simple, fine for small lists |
| Normalized `{ids, entities}` | O(1) — `entities[id]` direct access | `adapter.addOne`/`removeOne`/`setAll` manage both `ids` and `entities` safely |

### Custom Middleware — the Three-Stage Curried Signature
```js
const myMiddleware = (store) => (next) => (action) => { /* ... */ };
```
- **Stage 1** (`store`) — resolved once, at store creation
- **Stage 2** (`next`) — resolved once, when Redux wires up the middleware chain (`next` is literally the next middleware in `.concat(...)`, or real `dispatch` if last)
- **Stage 3** (`action`) — resolved on **every** dispatch — the only part that needs to re-run repeatedly
- Currying separates one-time setup cost from repeated per-dispatch cost
- **Critical rule**: must call `next(action)` and return its result, or the action never reaches the reducer and the app breaks silently

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
| Gotcha | Must set `value` prop, not just `onChange` | Fine for simple/uncontrolled forms |

### Immer Mutation Rules

| Pattern | Valid? | When to use |
|---|---|---|
| `state.push(x)` | ✅ | Adding to array |
| `return state.filter(...)` | ✅ | Removing from array |
| `state.push(x); return state` | ❌ | Never — Immer throws |
| `state = []` | ❌ | Never — reassignment does nothing |
| `return []` | ✅ | Clearing array |

### Testing Reducers
- Reducers are pure functions — testable directly with `reducer(state, action)`, no mocking, no store, no React needed
- Good coverage checklist: initial state, happy path, guard clauses (duplicates, empty input), item-not-found cases, and an explicit immutability check (`expect(newState).not.toBe(oldState)`)

---

## What Is Pending / Could Be Improved

### Known Limitations
- **`selectedType` filter only covers 3 types** (fire, water, grass) — could fetch the full 18 from `/type`.
- **Pokémon list limited to 50** — pagination or a higher `?limit=` could address this.
- **Type filter only works against the fetched 50** — a fire-type outside the first 50 won't appear even if selected.
- **`getFavouriteByName` endpoint built but not fully wired into UI** — would need `useLazyGetFavouriteByNameQuery` for a proper manual search button.
- **Removing by name still requires a full scan** (`Object.values(entities).find(...)`) — normalization only sped up lookup by `id`.

### Code Cleanup Pending
- `console.log` statements in `FetchedPokemons.jsx` and `loggerMiddleware.js` — decide what to keep for revision vs. strip for a "clean" version
- Commented-out `useEffect` (store.subscribe) in `Pokemon.jsx` / `Pokemon_slice.jsx` — remove
- `<span>{value}</span>` debug display — remove

### Features Not Yet Built
- **Pagination** — next/previous buttons using PokéAPI's `next` URL
- **Dynamic type dropdown** — fetch all 18 types from `/type`
- **Favourites filter by type** — `selectedType` currently only filters the main pokémon list
- **Error boundary** — no graceful UI for API failures beyond `<p>Error...</p>`
- **Bulk clear** — no `favouritesApi` equivalent to `clearFavourites` yet
- **Tags with IDs** — `{ type: 'Favourite', id }` for granular per-item invalidation instead of invalidating the whole list

### RTK Query / Redux Concepts Still Not Practiced
- `refetch` — manual refetch trigger
- `pollingInterval` — auto-refetch on a timer
- `selectFromResult` — selecting a subset of query data to avoid unnecessary re-renders
- Redux DevTools time-travel debugging — understood conceptually (action history, state snapshots, scrubbing through past states), but not yet exercised hands-on in this project
- Testing RTK Query mutations directly (would require mocking network calls, e.g. via MSW)

---

## Running the Project

```bash
# Terminal 1 — start the mock backend (favourites mutations)
npm run server

# Terminal 2 — start the Vite dev server
npm run dev

# Run unit tests
npm run test
```

---

## API Reference

| Endpoint | Source | Used for |
|---|---|---|
| `GET /pokemon?limit=50` | PokéAPI | Fetch pokémon list |
| `GET /pokemon/{name}` | PokéAPI | Fetch single pokémon detail |
| `GET /type/{type}` | PokéAPI | Fetch all pokémon of a given type |
| `GET /favourites` | json-server | Fetch favourites list (normalized via `createEntityAdapter`) |
| `GET /favourites?name={name}` | json-server | Fetch favourite(s) by name |
| `POST /favourites` | json-server | Add a favourite (optimistic, with rollback) |
| `DELETE /favourites/{id}` | json-server | Remove a favourite by id (optimistic, with rollback) |