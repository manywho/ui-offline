import reducers from '../js/reducers';

const initialState = {
    flowInformation: {
        tenantId: null,
        stateId: null,
        token: null,
    },
    isPollingValues: false,
    cachingProgress: 0,
    isReplaying: false,
    hasNetwork: true,
    isOffline: false,
};

describe('Offline reducer behaviour', () => {

    test('When there is network', () => {
        const action = { type: 'HAS_NETWORK' };
        const state = reducers(initialState, action);
        expect(state.hasNetwork).toBeTruthy();
    });

    test('When there is no network', () => {
        const action = { type: 'HAS_NO_NETWORK' };
        const state = reducers(initialState, action);
        expect(state.hasNetwork).toBeFalsy();
        expect(state.isOffline).toBeTruthy();
    });

    test('When going into offline mode', () => {
        const action = { type: 'IS_OFFLINE', payload: false };
        const state = reducers(initialState, action);
        expect(state.isOffline).toBeTruthy();
    });

    test('When coming out of offline mode', () => {
        const action = { type: 'IS_ONLINE' };
        const state = reducers(initialState, action);
        expect(state.isOffline).toBeFalsy();
        expect(state.hasNetwork).toBeTruthy();
    });

    test('When going into offline mode with network available', () => {
        const action = { type: 'IS_OFFLINE', payload: true };
        const state = reducers(initialState, action);
        expect(state.isOffline).toBeTruthy();
        expect(state.hasNetwork).toBeTruthy();
    });

    test('When the flow is replaying requests', () => {
        const action = { type: 'IS_REPLAYING', payload: true };
        const state = reducers(initialState, action);
        expect(state.isReplaying).toBeTruthy();
    });

    test('When the flow is incrementing caching progress', () => {
        const action = { type: 'CACHE_PROGRESS', payload: 1 };
        const state = reducers(initialState, action);
        expect(state.cachingProgress).toEqual(1);
    });

    test('When saving flow information in the store', () => {
        const flowInformation = { tenantId: 'test_tenant', stateId: 'test_state', token: 'test_token' };
        const action = { type: 'FLOW_INFORMATION', payload: flowInformation };
        const state = reducers(initialState, action);
        expect(state.flowInformation).toEqual(flowInformation);
    });

    test('When ac flow information in the store', () => {
        const action = { type: 'POLLING_VALUES', payload: true };
        const state = reducers(initialState, action);
        expect(state.isPollingValues).toEqual(true);
    });
});
