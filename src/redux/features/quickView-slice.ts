import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  product: Product | null;
};

const initialState: InitialState = {
  product: {
    id: 0,
    brand_name: "",
    specs_score: 0,
    title: "",
    price: 0,
    imgs: { thumbnails: [], previews: [] },
    has_5g: false,
    has_nfc: false,
    has_ir_blaster: false,
    processor_brand: "",
    num_cores: 0,
    processor_speed: 0,
    battery_capacity: 0,
    fast_charging_available: 0,
    fast_charging: 0,
    ram_capacity: 0,
    internal_memory: 0,
    screen_size: 0,
    refresh_rate: 0,
    resolution: "",
    num_rear_cameras: 0,
    num_front_cameras: 0,
    os: "",
    primary_camera_rear: 0,
    primary_camera_front: 0,
    extended_memory_available: 0,
    extended_upto: null,
  },
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },

    resetQuickView: (state) => {
      state.product = initialState.product;
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;
