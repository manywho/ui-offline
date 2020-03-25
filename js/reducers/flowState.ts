
import { StateInit } from '../models/State';

interface IFlowState {
    authenticationToken: string;
    id: string;
    objectData: any;
    requests: any;
    tenantId: string;
    state: any;
}

const initialState = {
    authenticationToken: null,
    id: null,
    objectData: null,
    requests: null,
    tenantId: null,
    state: null,
};

const flowState = (flow: IFlowState = initialState, action) => {
    switch (action.type) {
    case 'SET_FLOW':
        return {
            ...action.payload,
            state: StateInit(action.payload.state),
        };

    default:
        return flow;
    }
};

export default flowState;
