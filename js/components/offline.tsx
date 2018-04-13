import React from 'react';
import {metaData} from '../services/metadata';
import OfflineCore from '../services/offline';
import {getOfflineData, removeOfflineData, setOfflineData} from '../services/storage';
import {clone, flatten, guid} from '../services/utils';

import GoOffline from './go-offline';

declare var manywho: any;

enum OfflineView {
    cache = 0,
    replay = 1,
    noNetwork = 2
}

class Offline extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            view: null
        };
    }

    onOfflineClick = (e) => {
        this.setState({ view: 0 });
    }

    onOffline = () => {
        this.setState({ view: null });
        manywho.offline.isOffline = true;
        this.forceUpdate();
    }

    onOnlineClick = (e) => {
        manywho.connection.hasNetwork()
            .then(response => {
                response ? this.setState({ view: OfflineView.replay }) : this.setState({ view: OfflineView.noNetwork });
            });
    }

    onOnline = (flow) => {
        this.setState({ view: null, requests: null });
        manywho.offline.isOffline = false;

        setOfflineData(flow)
            .then(() => manywho.offline.rejoin(this.props.flowKey))
            .then(() => removeOfflineData(flow.state.id));
    }

    onCloseOnline = () => {
        this.setState({ view: null });
    }

    onCloseNoNetwork = () => {
        this.setState({ view: null });
    }

    componentWillMount() {
        const stateId = manywho.utils.extractStateId(this.props.flowKey);
        const id = manywho.utils.extractFlowId(this.props.flowKey);
        const versionId = manywho.utils.extractFlowVersionId(this.props.flowKey);

        getOfflineData(stateId, id, versionId)
            .then(flow => {
                if (flow)
                    this.onOffline();
            });
    }

    render() {
        let button = OfflineCore.isOffline ?
            <button className="btn btn-info" onClick={this.onOnlineClick}><span className="glyphicon glyphicon-export" aria-hidden="true"/>Go Online</button> :
            <button className="btn btn-primary" onClick={this.onOfflineClick}><span className="glyphicon glyphicon-import" aria-hidden="true"/>Go Offline</button>;

        let view = null;

        switch (this.state.view) {
            case OfflineView.cache:
                view = <GoOffline onOffline={this.onOffline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.replay:
                view = <manywho.offline.components.goOnline onOnline={this.onOnline} onClose={this.onCloseOnline} flowKey={this.props.flowKey} />;
                break;

            case OfflineView.noNetwork:
                view = <manywho.offline.components.noNetwork onClose={this.onCloseNoNetwork} />;
        }

        if (metaData && manywho.settings.global('offline.isEnabled', this.props.flowKey))
            return <div className="offline">
                <div className="offline-options">
                    {button}
                </div>
                {view}
            </div>;

        return null;
    }
};

export default Offline;

manywho.settings.initialize({
    components: {
        static: [
            Offline
        ]
    }
});
