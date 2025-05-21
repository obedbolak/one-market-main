import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Match this interface to your backend Service model
export interface Service {
    _id: string;
    name: string;
    description: string;
    location: string;
    locationCity: string;
    contactInfo: string;
    email: string;
    images: { public_id: string; url: string; _id: string }[];
    status: "active" | "inactive";
    createdAt: string;
    __v: number;
}

interface ServiceState {
    services: Service[];
    loading: boolean;
    error: string | null;
}

const initialState: ServiceState = {
    services: [],
    loading: false,
    error: null,
};

// Async thunk to fetch all services
export const fetchServices = createAsyncThunk<Service[]>(
    'services/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            // Use your actual API endpoint here:
            const response = await axios.get<{ services: Service[] }>(
                'https://onemarketapi.xyz/api/v1/service/services'
            );
            return response.data.services;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default serviceSlice.reducer;