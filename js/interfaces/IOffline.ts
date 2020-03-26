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
    toggleIsOffline: Function;
    toggleIsReplaying: Function;
    toggleIsOnline: Function;
    foo: Function;
}
