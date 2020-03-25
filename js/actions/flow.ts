import OfflineCore from '../services/OfflineCore';

import { getOfflineData, removeOfflineData } from '../services/Storage';
import { isReplaying, isOnline } from '../actions';

export const setFlow = result => ({
    type: 'SET_FLOW',
    payload: result,
});

export const setFlowFromCache = (stateId, id, flowKey) => {
    return (dispatch) => {
        getOfflineData(stateId, id, null)
            .then((flow) => {

                if (flow) {
                    dispatch(setFlow(flow));

                    if (flow.requests || flow.requests.length === 0) {

                        // The data stored inside indexdb contains no requests,
                        // so just rejoin the flow
                        removeOfflineData(stateId)
                            .then(() => {
                                dispatch(isOnline());
                                dispatch(isReplaying(false));

                                OfflineCore.rejoin(flowKey);
                            });
                    } else {

                        // The entry in indexDB needs to be wiped
                        // otherwise as requests are made to sync with thengine
                        // the offline middleware will still assume we are in offline mode
                        removeOfflineData(stateId)
                            .then(() => {
                                dispatch(isReplaying(true));
                            });
                    }
                } else {

                    // At this point if there is no data stored in indexdb
                    // then that would mean that the user has probably been
                    // paginating through objectdata cached in state or performed
                    // some other action whereby requests back to the engine have not been required
                    // Therefore, there are no requests to replay and we can safely rejoin the flow
                    dispatch(isOnline());
                }
            });
    };
};
