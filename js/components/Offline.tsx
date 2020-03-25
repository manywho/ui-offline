import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { connect } from 'react-redux';
import { isOffline, isOnline, isReplaying } from '../actions';
import Banner from './Banner';

import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const metaData: any;

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

    onOnlineClick = () => {

        // Requests can only be replayed if there is network
        hasNetwork()
            .then((response) => {
                response ?
                this.setState({ view: OfflineView.replay }) :
                this.setState({ view: OfflineView.noNetwork });
            });
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
                this.props.toggleIsOffline({ hasNetwork: false });
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
