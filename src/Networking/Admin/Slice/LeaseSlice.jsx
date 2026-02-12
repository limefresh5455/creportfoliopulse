import { createSlice } from '@reduxjs/toolkit';
import { ListLeaseSubmit } from '../APIs/LeaseApi';

const LeaseSlice = createSlice({
    name: 'LeaseSlice',
    initialState: {
        loading: false,
        Office: "",
        data: [],
        leases: [],
        buildingAddress: "",
        Building_id: "",
        message: "",
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(ListLeaseSubmit.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(ListLeaseSubmit.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.buildingAddress = state.data;

            state.leases = state.data.leases;
            state.message = state.data.message;
            state.Building_id = state.data.building_id;
        })
        builder.addCase(ListLeaseSubmit.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export default LeaseSlice.reducer;
