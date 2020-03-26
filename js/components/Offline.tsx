import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';

import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { connect } from 'react-redux';
import { isOffline, isOnline, isReplaying } from '../actions';
import Banner from './Banner';
import { getOfflineData, removeOfflineData, setOfflineData } from '../services/Storage';

import extractExternalId from '../services/extractExternalId';

import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const metaData: any;

declare const manywho: any;

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

const mapStateToProps = (state) => {
    return {
        isOffline: state.offlineState.isOffline,
        hasNetwork: state.offlineState.hasNetwork,
        isReplaying: state.offlineState.isReplaying,
        cachingProgress: state.offlineState.cachingProgress,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleIsOffline: (bool) => {
            dispatch(isOffline(bool));
        },
        toggleIsOnline: () => {
            dispatch(isOnline());
        },
        toggleIsReplaying: (bool) => {
            dispatch(isReplaying(bool));
        },
    };
};

export class Offline extends React.Component<IOfflineProps, IOfflineState> {

    flow = null;
    objectDataCachingTimer = null;

    constructor(props: any) {
        super(props);
        this.state = {
            view: null,
            hasInitialized: false,
        };
    }

    checkReplayResponse = (response, cachedFlow, cachedRequest) => {

        // Unauthorised response
        if (response && response.invokeType === 'NOT_ALLOWED') {
            this.onCloseOnline(cachedFlow);
            OfflineCore.rejoin(this.props.flowKey);

        // Response contains root faults
        } else if (response && response.mapElementInvokeResponses && response.mapElementInvokeResponses[0].rootFaults) {
            // Handle root faults

        // Everything is fine
        } else {
            const index = cachedFlow.requests.indexOf(cachedRequest);

            if (index === cachedFlow.requests.length - 1) {
                this.onOnline();
            }
        }
    }

    onOnlineClick = async () => {
        const isConnected = await hasNetwork();

        if (isConnected) {
            const stateId = manywho.utils.extractStateId(this.props.flowKey);
            const id = manywho.utils.extractFlowId(this.props.flowKey);

            const cachedFlow = await getOfflineData(stateId, id, null);

            if (cachedFlow) {

                if (!cachedFlow.requests || cachedFlow.requests.length === 0) {
                    await removeOfflineData(stateId);
                    this.onOnline();

                } else {
                    await removeOfflineData(stateId);

                    cachedFlow.requests.forEach(async (cachedRequest) => {
                        cachedRequest.request.stateId = cachedFlow.state.id;
                        cachedRequest.request.stateToken = cachedFlow.state.token;

                        const token = manywho.state.getAuthenticationToken(this.props.flowKey);

                        if (cachedRequest.request.type === 'fileData') {

                            try {
                                const fileUploadResponse = await manywho.ajax.uploadFiles(
                                    cachedRequest.request.files,
                                    cachedRequest.request,
                                    cachedFlow.tenantId,
                                    token,
                                    () => {},
                                    cachedRequest.request.stateId,
                                );

                                if (fileUploadResponse) {
                                    this.checkReplayResponse(
                                        fileUploadResponse,
                                        cachedFlow,
                                        cachedRequest,
                                    );
                                }

                            } catch (error) {
                                console.log(error);
                            }
                        }

                        if (cachedRequest.request.type !== 'fileData') {

                            try {
                                const response = await manywho.ajax.invoke(
                                    cachedRequest.request,
                                    cachedFlow.tenantId,
                                    token,
                                );

                                if (response) {
                                    await extractExternalId(
                                        cachedRequest,
                                        cachedFlow.tenantId,
                                        token,
                                        stateId,
                                    );

                                    this.checkReplayResponse(
                                        response,
                                        cachedFlow,
                                        cachedRequest,
                                    );
                                }

                            } catch (error) {
                                console.log(error.responseText);
                            }
                        }
                    });
                }

            } else {
                this.props.toggleIsOnline();
            }

        } else {
            this.setState({ view: OfflineView.noNetwork });
        }
    }

    onOnline = () => {
        this.setState({ view: null });

        // Out of offline mode and rejoining the flow
        this.props.toggleIsOnline();
        this.props.toggleIsReplaying(false);
        OfflineCore.rejoin(this.props.flowKey);
    }

    onCloseOnline = (flow) => {

        // Called when the requests modal is closed
        // at this point the entry for this state
        // has been cleared from indexDB, so we need to reinstate it
        setOfflineData(flow)
            .then(() => {

                // Back into offline mode
                this.props.toggleIsOffline({ hasNetwork: true });
                this.props.toggleIsReplaying(false);
                this.setState({ view: null });
            });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    render() {

        let cachingSpinner = null;

        if (this.props.cachingProgress > 0 && this.props.cachingProgress < 100) {
            cachingSpinner = <div className="caching-spinner">
                <div className="wait-container">
                    <div className="wait-spinner-small wait-spinner"></div>
                    <span className="wait-message">Caching { String(this.props.cachingProgress) }%</span>
                </div>
            </div>;
        }

        const button = this.props.isOffline ?
            <button className="btn btn-success" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-transfer" aria-hidden="true"/>
                Sync Flow
            </button> : null;

        let view = null;

        switch (this.state.view) {

        case OfflineView.replay:
            view = <GoOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
            break;

        case OfflineView.noNetwork:
            view = <NoNetwork onClose={this.onCloseNoNetwork} />;
        }

        if (metaData) {
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
                {cachingSpinner}
                <Banner hasNetwork={this.props.hasNetwork} isOffline={this.props.isOffline} />
            </div>;
        }

        return null;
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Offline);
