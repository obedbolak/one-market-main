// store/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductImage {
  public_id: string;
  url: string;
}

interface Product {
  _id: string; // Unique product ID
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[]; // Array of images
  quantity: number; // Quantity for this product in the cart
}

interface CartState {
  items: Product[];
}

const initialState: CartState = {
  items: [],
};

// Create the cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add product to cart
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingProduct = state.items.find(
        (item) => item._id === action.payload._id
      );
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity; // Increase quantity if product already in cart
      } else {
        state.items.push(action.payload); // Add new product to cart
      }
    },
    // Update quantity of a product in the cart
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const product = state.items.find(
        (item) => item._id === action.payload.id
      );
      if (product) {
        product.quantity = action.payload.quantity;
      }
    },
    // Remove product from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    // Clear all items in the cart
    clearCart: (state) => {
      state.items = [];
    },
  },
});

// Export actions
export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
