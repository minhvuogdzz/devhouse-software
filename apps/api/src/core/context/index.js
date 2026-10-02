import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export const runWithContext = (context, callback) => {
  return asyncLocalStorage.run(context, callback);
};

export const getContext = () => {
  return asyncLocalStorage.getStore() || {};
};

export const getRequestId = () => {
  return getContext().requestId || 'no-request-id';
};

export const getActor = () => {
  return getContext().actor || null;
};
