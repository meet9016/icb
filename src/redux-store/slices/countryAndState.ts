
import { Country, State } from "@/views/interface/countryAndState";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CountryAndStateState {
    countries: Country[];
    states: State[];
}

const initialState: CountryAndStateState = {
    countries: [],
    states: []
};

const countryAndState = createSlice({
    name: 'countryAndState',
    initialState,
    reducers: {
        setCountries(state: CountryAndStateState, action: PayloadAction<Country[]>) {
            state.countries = action.payload;
        },
        setStates(state: CountryAndStateState, action: PayloadAction<State[]>) { // Adjust payload type if necessary
            state.states = action.payload;
        },
        resetCountryAndState(state: CountryAndStateState) {
            state.countries = [];
            state.states = [];
        }
    }
});


export const { setCountries, setStates, resetCountryAndState } = countryAndState.actions;
export default countryAndState.reducer;
