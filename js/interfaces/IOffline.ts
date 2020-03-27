export interface IOfflineState {
    view?: number;
    status?: string;
    progress?: number;
    isDismissEnabled?: boolean;
    hasInitialized?: boolean;
}

export interface IOfflineProps {
    flowKey: string;
    isOffline: boolean;
    hasNetwork: boolean;
    cachingProgress: number;
    replayError: any;
    toggleIsOffline: Function;
    toggleIsReplaying: Function;
    toggleIsOnline: Function;
    setReplayError: Function;
    removeCachedRequest: Function;
}
