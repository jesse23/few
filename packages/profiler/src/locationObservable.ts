import { override } from '@/utils';

/**
 * XHR API
 */
const _historyPushState = history.pushState;
const _historyReplaceState = history.replaceState;

const enabled = (): boolean => true;

const _observers: any[] = [];

export const install = (): void => {
    history.pushState = override( history, _historyPushState );
    history.replaceState = override( history, _historyReplaceState );
};

export const uninstall = (): void => {
    history.pushState = _historyPushState;
    history.replaceState = _historyReplaceState;
};
