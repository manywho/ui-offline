/**
 * Some useful utility functions to be
 * used when writing Jest tests.
 */

export const t = () => true;
export const f = () => false;
export const obj = () => ({});
export const arr = () => [];
export const noop = () => {};

export const bool = () => Math.round(Math.random()) > 0;

export const str = (length = 5) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

export const int = (min = 1, max = 1000) => Math.ceil(Math.random() * (max - min) + min);

export const guid = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};
