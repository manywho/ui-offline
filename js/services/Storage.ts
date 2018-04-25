declare const manywho;
declare const localforage: any;

localforage.setDriver(['asyncStorage', 'webSQLStorage']);

/**
 * @param id 
 * @param flowId 
 * @param flowVersionId 
 */
export const getOfflineData = (id: string, flowId: string = null, flowVersionId: string = null) => {
    return localforage.getItem(`manywho:offline-${id}`)
        .then((value) => {
            if (value) {
                return value;
            }

            return localforage.iterate((value, key) => {
                if (value.id.id === flowId && value.id.versionId === flowVersionId) {
                    return value;
                }
            })
            .then((flow) => {
                if (flow) {
                    return removeOfflineData(flow.state.id)
                        .then(() => {
                            flow.state.id = id;
                            return setOfflineData(flow);
                        });
                }
            });
        });
};

/**
 * @param flow 
 */
export const setOfflineData = (flow: any) => {
    return localforage.setItem(`manywho:offline-${flow.state.id}`, flow);
};

/**
 * @param id
 */
export const removeOfflineData = (id: string) => {
    return localforage.removeItem(`manywho:offline-${id}`);
};
