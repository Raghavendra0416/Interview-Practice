const loggerMiddleware = (store) => (next) => (action) => {
    // Step 1: log something using store.getState() — state BEFORE

    //store.getState() gives you the entire current Redux state tree — this runs before anything happens to the action.
    console.log('State before:', store.getState());
    //This just shows you what was dispatched — its type and payload.
    console.log('Action:', action);

    // Step 2: call next(action) — this actually lets the action proceed
    // (to the next middleware, or to the reducer if this is the last one)
    // Save its return value — dispatch() should still return whatever next(action) returns

    //next(action) passes the action forward — either to the next middleware in the chain, or to the reducer if this is the last one. You must call this, and capture its return value.
    const result = next(action);

    // Step 3: log something using store.getState() again — state AFTER

    //Since next(action) already ran by this point, the reducer has already processed the action — so getState() now gives you the updated state.
    console.log('State after:', store.getState());

    // Step 4: return the result from Step 2

    //dispatch(...) is expected to return whatever next(action) returned — skipping this breaks anything in your app that relies on dispatch(...)'s return value.
    return result;
};

export default loggerMiddleware;