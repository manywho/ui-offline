import { StateInit } from './State';
import { IFlow } from '../interfaces/IModels';

declare var manywho: any;

let authenticationToken = null;
let id = null;
let objectData = null;
let requests = null;
let state = null;
let tenantId = null;

/**
 * Returns an object referencing the current flow.
 * @param flow
 */

export const FlowInit = (flow: IFlow) => {
    authenticationToken = flow.authenticationToken;
    id = flow.id;
    objectData = flow.objectData || {};
    requests = flow.requests || [];
    tenantId = flow.tenantId;
    state = StateInit(flow.state);

    return {
        authenticationToken,
        id,
        objectData,
        requests,
        tenantId,
        state,
    };
};

/**
 * @param request
 * @param snapshot
 */
export const addRequest = (request: any, snapshot: any) => {
    request.key = requests.length;
    request.currentMapElementDeveloperName = snapshot.metadata.mapElements.find(
        element => element.id === request.currentMapElementId,
    ).developerName;
    requests.push(request);
};

/**
 * @param request
 */
export const removeRequest = (request: any) => {
    const index = requests.indexOf(request);
    requests.splice(index, 1);
};

/**
 * Empty array of request objects
 */
export const removeRequests = () => {
    requests = [];
};

/**
 * @param typeElementId
 */
export const getObjectData = (typeElementId: string) => {
    return objectData[typeElementId];
};

/**
 * @param objectData
 * @param typeElementId
 */
export const cacheObjectData = (data: any, typeElementId: string) => {
    if (objectData[typeElementId]) {
        objectData[typeElementId] = objectData[typeElementId].concat(objectData);
    } else {
        objectData[typeElementId] = data;
    }
};