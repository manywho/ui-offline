/// <reference path="../../typings/index.d.ts" />

declare var manywho: any;

manywho.offline.components = manywho.offline.components || {};

manywho.offline.components.offline = class Offline extends React.Component<any, any> {

    displayName = 'Offline';

    constructor(props: any) {
        super(props);
        this.state = {
            isOnline: true
        };
    }

    onOffline = () => {
        this.setState({ isOnline: false });
    }

    onOnline = () => {
        this.setState({ isOnline: true });
    }

    render() {
        return this.state.isOnline ?
            <manywho.GoOffline onOffline={this.onOffline} flowKey={this.props.flowKey} /> :
            <manywho.GoOnline onOnline={this.onOnline} flowKey={this.props.flowKey} />;
    }
};

manywho.settings.initialize({
    components: {
        static: [
            manywho.offline.components.offline
        ]
    }
});