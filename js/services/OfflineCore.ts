import { addRequest, FlowInit, getObjectData } from '../models/Flow';
import DataActions from './DataActions';
import ObjectData from './ObjectData';
import { executeOperation, invokeMacroWorker } from './Operation';
import { generatePage } from './Page';
import Rules from './Rules';
import Snapshot from './Snapshot';
import Step from './Step';
import { StateUpdate } from '../models/State';
import { getOfflineData, setOfflineData } from './Storage';
import { IFlow } from '../interfaces/IModels';
import { flatten, guid } from '../services/Utils';

declare const manywho: any;
declare const metaData: any;
declare const localforage: any;
declare const $: any;

enum EventTypes {
    invoke = 'invoke',
    join = 'join',
    navigation = 'navigation',
    initialization = 'initialization',
    objectData = 'objectData',
}

const OfflineCore = {

    isOffline: false,

    /**
     * @param tenantId
     * @param stateId
     * @param stateToken
     * @param authenticationToken
     * @description initialzing a model in state. This occurs when
     * a flow is first initialized and is not yet in offline mode
     */
    initialize(tenantId: string, stateId: string, stateToken: string, authenticationToken: string) {
        if (!metaData) {
            return;
        }

        const flow = {
            authenticationToken,
            tenantId,
            state: {
                id: stateId,
                token: stateToken,
            },
            id: metaData.id,
        };

        return FlowInit(flow);
    },

    /**
     * Invoking the flow once the user has come back online
     * @param flowKey
     */
    rejoin(flowKey: string) {
        const tenantId = manywho.utils.extractTenantId(flowKey);
        const flowId = manywho.utils.extractFlowId(flowKey);
        const flowVersionId = manywho.utils.extractFlowVersionId(flowKey);
        const element = manywho.utils.extractElement(flowKey);
        const stateId = manywho.utils.extractStateId(flowKey);
        const authenticationToken = manywho.state.getAuthenticationToken(flowKey);

        return manywho.engine.join(tenantId, flowId, flowVersionId, element, stateId, authenticationToken, manywho.settings.flow(null, flowKey));
    },

    /**
     * Determine how to handle api request to engine
     * based on the type of event is defined
     * @param context
     * @param event
     * @param urlPart
     * @param request
     * @param tenantId
     * @param stateId
     */
    getResponse(context: any, event: EventTypes, urlPart: string, request: any, tenantId: string, stateId: string) {

        // When running a flow in debug mode, calls to the
        // logging endpoint are being intercepted, this handles that.
        if (manywho.utils.isEqual(event, 'log')) {
            return Promise.resolve();
        }

        let flowStateId = stateId;
        if (request && request.stateId) {
            flowStateId = request.stateId;
        } else if (manywho.utils.isEqual(event, 'join', true)) {
            flowStateId = urlPart.substr(urlPart.lastIndexOf('/') + 1);
        } else if (manywho.utils.isEqual(event, 'initialization', true)) {
            flowStateId = '00000000-0000-0000-0000-000000000000';
        }

        return getOfflineData(flowStateId)
            .then((response) => {
                if (manywho.utils.isEqual(event, 'initialization')) {
                    const flow = FlowInit({
                        tenantId,
                        state: {
                            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
                            id: stateId,
                            token: guid(),
                        },
                    });

                    return setOfflineData(flow)
                        .then(() => flow);
                }
                return FlowInit(response);
            })
            .then((flow) => {
                if (manywho.utils.isEqual(event, 'join', true)) {
                    return this.getMapElementResponse(
                        {
                            invokeType: 'JOIN',
                            currentMapElementId: flow.state.currentMapElementId,
                        },
                        flow,
                        context,
                    );
                }
                if (manywho.utils.isEqual(event, 'initialization', true)) {
                    return this.getInitializationResponse(request, flow, context);
                }
                if (request.mapElementInvokeRequest) {
                    return this.getMapElementResponse(request, flow, context);
                }
                if (request.navigationElementId) {
                    return this.getNavigationResponse(request, flow, context);
                }
                return this.getObjectDataResponse(request, flow, context);
            });
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getInitializationResponse(request: any, flow: IFlow, context: any) {
        const snapshot: any = Snapshot(metaData);

        return {
            currentMapElementId: metaData.mapElements.find(element => element.elementType === 'START').id,
            currentStreamId: null,
            navigationElementReferences : snapshot.getNavigationElementReferences(),
            stateId: flow.state.id,
            stateToken: flow.state.token,
            statusCode: '200',
        };
    },

    /**
     * Handling map element requests by imitating the expected response
     * the UI would get when online.
     * @param request
     * @param flow
     * @param context
     */
    getMapElementResponse(request: any, flow: IFlow, context: any) {
        if (!metaData) {
            return;
        }

        const deferred = $.Deferred();

        const mapElement: any = request.currentMapElementId ?
            metaData.mapElements.find(element => element.id === request.currentMapElementId) :
            metaData.mapElements.find(element => element.elementType === 'START');
        let nextMapElement = null;

        switch (request.invokeType.toUpperCase()) {
        case 'FORWARD':
            let nextMapElementId = null;
            let outcome = null;

            if (request.mapElementInvokeRequest.selectedOutcomeId) {
                outcome = mapElement.outcomes.find(item => item.id === request.mapElementInvokeRequest.selectedOutcomeId);
            } else if (request.selectedMapElementId) {
                nextMapElementId = request.selectedMapElementId;
            } else {
                outcome = mapElement.outcomes[0];
            }

            if (outcome) {
                nextMapElementId = outcome.nextMapElementId;
            }

            nextMapElement = metaData.mapElements.find(element => element.id === nextMapElementId);
            break;

        case 'NAVIGATE':
            const navigation = metaData.navigationElements.find(element => element.id === request.navigationElementId);
            const navigationItem = navigation.navigationItems.find(item => item.id === request.selectedNavigationItemId);
            nextMapElement = metaData.mapElements.find(element => element.id === navigationItem.locationMapElementId);
            break;

        case 'JOIN':
            nextMapElement = mapElement;
            break;

        case 'SYNC':
            nextMapElement = mapElement;
            break;
        }

        const snapshot: any = Snapshot(metaData);

        if (manywho.utils.isEqual(mapElement.elementType, 'input', true) || manywho.utils.isEqual(mapElement.elementType, 'step', true)) {
            addRequest(request, snapshot);
        }

        if (mapElement.elementType === 'input'
            && request.mapElementInvokeRequest
            && request.mapElementInvokeRequest.pageRequest
            && request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses) {
            StateUpdate(request.mapElementInvokeRequest.pageRequest.pageComponentInputResponses, mapElement, snapshot);
        }

        if (nextMapElement.dataActions) {
            nextMapElement.dataActions
                .filter(action => !action.disabled)
                .sort((a, b) => a.order - b.order)
                .forEach((action) => {
                    DataActions.execute(action, flow, snapshot);
                });
        }

        const asyncOperations = [];

        if (nextMapElement.operations) {

            // Execute operations
            nextMapElement.operations
                .filter(operation => !operation.macroElementToExecuteId)
                .sort((a, b) => a.order - b.order)
                .forEach((operation) => {
                    executeOperation(operation, flow.state, snapshot);
                });

            // Execute macros
            nextMapElement.operations
            .filter(operation => operation.macroElementToExecuteId)
                .sort((a, b) => a.order - b.order)
                .forEach((operation) => {
                    asyncOperations.push(
                        invokeMacroWorker(operation, flow.state, snapshot),
                    );
                });

            // Operations that execute macros inside a web worker are asyncronous
            return Promise.all(asyncOperations).then(() => {
                return this.constructResponse(
                    nextMapElement,
                    request,
                    snapshot,
                    flow,
                    context,
                );
            });
        }
        return this.constructResponse(
            nextMapElement,
            request,
            snapshot,
            flow,
            context,
        );
    },

    constructResponse(nextMapElement, request, snapshot, flow, context) {

        let pageResponse = null;
        if (nextMapElement.elementType === 'step') {
            pageResponse = Step.generate(nextMapElement, snapshot);
        } else if (nextMapElement.elementType === 'input') {
            pageResponse = generatePage(
                request,
                nextMapElement,
                flow.state,
                snapshot,
                flow.tenantId,
            );
        } else if (!nextMapElement.outcomes || nextMapElement.outcomes.length === 0) {
            pageResponse = {
                developerName: 'done',
                mapElementId: nextMapElement.id,
            };
        }

        if (nextMapElement.outcomes && !pageResponse) {
            return setOfflineData(flow)
                .then(() => {
                    return OfflineCore.getResponse(
                        context, null, null,
                        {
                            currentMapElementId: nextMapElement.id,
                            mapElementInvokeRequest: {
                                selectedOutcomeId: Rules.getOutcome(nextMapElement.outcomes, flow.state, snapshot).id,
                            },
                            invokeType: 'FORWARD',
                            stateId: request.stateId,
                        },
                        request.tenantId,
                        request.stateId,
                    );
                });
        }

        flow.state.currentMapElementId = nextMapElement.id;
        setOfflineData(flow);

        return {
            currentMapElementId: nextMapElement.id,
            invokeType: nextMapElement.outcomes ? 'FORWARD' : 'DONE',
            mapElementInvokeResponses: [pageResponse],
            navigationElementReferences: snapshot.getNavigationElementReferences(),
            stateId: request.stateId,
            stateToken: request.stateToken,
            statusCode: '200',
        };
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getObjectDataResponse(request: any, flow: IFlow, context: any) {
        return ObjectData.filter(
            getObjectData(request.objectDataType ? request.objectDataType.typeElementId : request.typeElementId),
            request.listFilter,
        );
    },

    /**
     * @param request
     * @param flow
     * @param context
     */
    getNavigationResponse(request: any, flow: IFlow, context: any) {
        if (!metaData) {
            return;
        }

        const navigation = metaData.navigationElements[0];
        return {
            developerName: navigation.developerName,
            isEnabled: true,
            isVisible: true,
            label: navigation.label,
            navigationItemResponses: navigation.navigationItems,
            navigationItemDataResponses: flatten(navigation.navigationItems, null, [], 'navigationItems', null).map((item) => {
                return {
                    navigationItemId: item.id,
                    navigationItemDeveloperName: item.developerName,
                    isActive: false,
                    isCurrent: item.locationMapElementId === flow.state.currentMapElementId,
                    isEnabled: true,
                    isVisible: true,
                    locationMapElementId: item.locationMapElementId,
                };
            }),
        };
    },
};

export default OfflineCore;

manywho.settings.initialize({
    offline: {
        cache: {
            requests: {
                limit: 250,
                pageSize: 10,
            },
        },
    },
});
