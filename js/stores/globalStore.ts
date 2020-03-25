
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxThunk from 'redux-thunk';
import offlineState from '../reducers/offlineState';
import flowState from '../reducers/flowState';

const reduxMiddleware = [
    reduxThunk,
];

const enhancers = composeWithDevTools(
    applyMiddleware(...reduxMiddleware),
);

export default function globalStore() {
    return createStore(
        combineReducers<any>({
            offlineState,
            flowState,
        }),
        enhancers,
    );
}
