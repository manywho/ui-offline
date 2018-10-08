import * as React from 'react';
import { hasNetwork } from '../services/Connection';
import OfflineCore from '../services/OfflineCore';
import { setOfflineData } from '../services/Storage';
import { IOfflineProps, IOfflineState } from '../interfaces/IOffline';
import { connect } from 'react-redux';
import { isOffline, isReplaying } from '../actions';

import GoOnline from './GoOnline';
import NoNetwork from './NoNetwork';

declare const metaData: any;

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2,
}

const mapStateToProps = (state) => {
    return state;
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleIsOffline: (bool) => {
            dispatch(isOffline(bool));
        },
        toggleIsReplaying: (bool) => {
            dispatch(isReplaying(bool));
        },
    };
};

class Offline extends React.Component<IOfflineProps, IOfflineState> {

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
        this.props.toggleIsOffline(false);
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
                this.props.toggleIsOffline(true);
                this.props.toggleIsReplaying(false);
                this.setState({ view: null });
            });
    }

    onCloseNoNetwork: () => void = () => {
        this.setState({ view: null });
    }

    render() {
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
            </div>;
        }

        return null;
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Offline);
