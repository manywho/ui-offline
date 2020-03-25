import * as React from 'react';
import Request from './Request';
import { removeOfflineData } from '../services/Storage';
import { IGoOnlineProps, IGoOnlineState } from '../interfaces/IGoOnline';
import { connect } from 'react-redux';
import { isReplaying } from '../actions';
import { setFlowFromCache } from '../actions/flow';
import { removeRequest, removeRequests } from '../models/Flow';

declare const manywho: any;

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = {
    setFlowFromCache,
    toggleIsReplaying: isReplaying,
};

export class GoOnline extends React.Component<IGoOnlineProps, IGoOnlineState> {

    constructor(props: any) {
        super(props);
        this.state = {
            isReplayAll: false,
        };
    }

    onDeleteRequest = (request) => {
        removeRequest(request);
        this.forceUpdate();
    }

    onReplayDone = (request) => {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const index = this.props.flowState.requests.indexOf(request);

        if (index === this.props.flowState.requests.length - 1) {
            this.onDeleteRequest(request);
            removeOfflineData(stateId)
                .then(() => this.props.onOnline());
        } else {
            this.onDeleteRequest(request);
        }
    }

    onReplayAll = () => {
        this.setState({ isReplayAll: true });
    }

    onDeleteAll = () => {
        removeRequests();
        this.props.onOnline();
    }

    onClose = () => {
        this.props.onClose(this.props.flowState);
    }

    componentDidMount() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);

        this.props.setFlowFromCache(
            stateId,
            id,
            this.props.flowKey,
        );
    }

    render() {
        let cachedRequests = null;

        // The auth token must always come from state and not from
        // the indexdb cache, this will prevent successful replays
        // occuring inside a flow which has a stale auth token
        const latestAuthenticationToken = manywho.state.getAuthenticationToken(this.props.flowKey);
        if (this.props.flowState.requests) {
            cachedRequests = this.props.flowState.requests.map((cachedRequest, index) => {
                cachedRequest.request.stateId = this.props.flowState.state.id;
                cachedRequest.request.stateToken = this.props.flowState.state.token;

                return <Request cachedRequest={cachedRequest}
                    tenantId={this.props.flowState.tenantId}
                    authenticationToken={latestAuthenticationToken}
                    isDisabled={false}
                    onDelete={this.onDeleteRequest}
                    onReplayDone={this.onReplayDone}
                    replayNow={index === 0 && this.state.isReplayAll}
                    flowKey={this.props.flowKey}
                    cancelReplay={this.onClose}
                    key={cachedRequest.request.key} />;
            });
        }

        return <div className="offline-status">
            <div className="panel panel-default">
                <div className="panel-body sync-pending-requests">
                    <h4>Go Online</h4>
                    <div className="pending-requests">
                        <ul className="list-group">
                            {cachedRequests}
                        </ul>
                    </div>
                </div>
                <div className="panel-footer">
                    <button className="btn btn-danger pull-left" onClick={this.onDeleteAll}>Delete All</button>
                    <button className="btn btn-default pull-right" onClick={this.onClose}>Close</button>
                    <button className="btn btn-primary pull-right pending-requests-replay-all" onClick={this.onReplayAll}>Replay All</button>
                </div>
            </div>
        </div>;
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GoOnline);
