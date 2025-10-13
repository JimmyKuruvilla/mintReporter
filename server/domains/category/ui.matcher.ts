import { SvcMatcherCtorArgs } from './svc.matcher';

export type UiMatcher = Omit<SvcMatcherCtorArgs, 'type'> & { markedForDelete: boolean; };
