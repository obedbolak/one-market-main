// store/index.ts
// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

// Configure the store
const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>; // Infers the entire state type
export type AppDispatch = typeof store.dispatch; // Infers the dispatch type

export default store;
