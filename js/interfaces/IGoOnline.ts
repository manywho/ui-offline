export interface IGoOnlineState {
    isReplayAll: boolean;
}

export interface IGoOnlineProps {
    flowKey: string;
    flowState: any;
    onClose: Function;
    onOnline: Function;
    toggleIsReplaying: Function;
    setFlowFromCache: Function;
}
