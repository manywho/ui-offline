declare const manywho;

interface IisOffline {
    hasNetwork: boolean;
}

export const isOffline = ({ hasNetwork }: IisOffline) => ({
    type: 'IS_OFFLINE',
    payload: hasNetwork,
});

export const isOnline = () => ({
    type: 'IS_ONLINE',
});

export const hasNetwork = () => ({
    type: 'HAS_NETWORK',
});

export const hasNoNetwork = () => ({
    type: 'HAS_NO_NETWORK',
});

export const isReplaying = result => ({
    type: 'IS_REPLAYING',
    payload: result,
});

export const setCachingProgress = result => ({
    type: 'CACHE_PROGRESS',
    payload: result,
});

export const setReplayError = result => ({
    type: 'REPLAY_ERROR',
    payload: result,
});

export const cachingProgress = (result) => {
    const progress = result.progress;
    const flowKey = result.flowKey;
    return (dispatch) => {
        if (progress === 100 && flowKey) {
            manywho.model.addNotification(flowKey, {
                message: 'Caching is complete. You are ready to go offline',
                position: 'bottom',
                type: 'success',
                dismissible: true,
            });
            dispatch(setCachingProgress(0));
        } else {
            dispatch(setCachingProgress(progress));
        }
    };
};
