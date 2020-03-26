
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
    requests: [],
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

    case 'REMOVE_REQUEST': {
        const index = flow.requests.indexOf(action.payload);
        flow.requests.splice(index, 1);
        return {
            ...flow,
            requests: flow.requests,
        };
    }

    case 'REMOVE_ALL_REQUESTS':
        return {
            ...flow,
            requests: [],
        };

    default:
        return flow;
    }
};

export default flowState;
