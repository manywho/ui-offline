import * as React from 'react';
import { IRequestFaultProps } from '../interfaces/IRequestFault';

declare const manywho: any;

class RequestFault extends React.Component<IRequestFaultProps, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        const rootFaults = this.props.response.mapElementInvokeResponses[0].rootFaults || [];

        return <div className="request-fault">
            <h4>Faults</h4>
            <button className="btn btn-sm btn-primary">Join and fix</button>
            <ul>
                {rootFaults.map(fault => <li className="text-danger">{fault}</li>)}
            </ul>
        </div>;
    }
}

export default RequestFault;