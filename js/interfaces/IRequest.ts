export interface IRequestState {
    isCollapsed: boolean;
    isReplaying: boolean;
    response: any;
    progress: number;
}

export interface IRequestProps {
    flowKey: string;
    cachedRequest: any;
    tenantId: string;
    authenticationToken: string;
    onReplayDone: Function;
    onDelete: Function;
    replayNow: boolean;
    isDisabled: boolean;
    cancelReplay: Function;
    replayError: any;
}
