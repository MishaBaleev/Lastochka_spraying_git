import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mapboxgl from 'mapbox-gl';

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        modal_message:{
            active:"",
            heading:"",
            message:"",
            aftermath:""
        },
    },
    reducers: {
        update_modal_message: (state, action) => {
            console.log(action)
            state.modal_message = {
                ...(state.modal_message),
                active:action.payload.active,
                heading:action.payload.heading,
                message:action.payload.message,
                aftermath:action.payload.aftermath?action.payload.aftermath:"",
                actions:action.payload.actions?action.payload.actions:false,
                dataForUpload:action.payload.dataForUpload?action.payload.dataForUpload:""
            }
        },
    }
})
export const {update_modal_message} = appSlice.actions
  
export default appSlice.reducer