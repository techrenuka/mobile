import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";
import chatBotReducer from "./features/chatBot-slice";

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
    chatBotReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
