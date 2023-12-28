import { contextSrv } from 'app/core/services/context_srv';

export function evaluateAccess(actions: string[]) {
  return () => {
    return contextSrv.evaluatePermission(actions);
  };
}
