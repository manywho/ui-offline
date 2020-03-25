/**
 * @description This is the main reducer for handling the overall state
 * for a flow whilst it is offline.
 *
 * cachingProgress: Determines the percentage of objectData requests
 * to be made so that all required service data is stored in indexDb
 * when the flow has initilzed for the first time.
 *
 * isReplaying: A boolean to determine when requests are being replayed.
 *
 * hasNetwork: A boolean to determine as to whether there is any network connectivity.
 *
 * isOffline: A boolean to determine whether the flow has any cached requests
 * ready to be replayed and whether engine responses should continue to be
 * simulated.
 */

interface IOfflineState {
    cachingProgress: number;
    isReplaying: boolean;
    hasNetwork: boolean;
    isOffline: boolean;
}

const offlineState = (state: IOfflineState = { cachingProgress: 0, isReplaying: false, hasNetwork: true, isOffline: false }, action) => {
    switch (action.type) {
    case 'HAS_NETWORK':
        return {
            ...state,
            hasNetwork: true,
        };

    case 'HAS_NO_NETWORK':
        return {
            ...state,
            hasNetwork: false,
            isOffline: true,
        };

    case 'IS_OFFLINE':
        return {
            ...state,
            isOffline: true,
            hasNetwork: action.payload,
        };

    case 'IS_ONLINE':
        return {
            ...state,
            isOffline: false,
            hasNetwork: true,
        };

    case 'IS_REPLAYING':
        return {
            ...state,
            isReplaying: action.payload,
        };

    case 'CACHE_PROGRESS':
        return {
            ...state,
            cachingProgress: action.payload,
        };

    default:
        return state;
    }
};

export default offlineState;
