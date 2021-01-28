import { map } from 'rxjs/operators';

import { DataTransformerInfo, FieldMatcher } from '../../types';
import { DataTransformerID } from './ids';
import { outerJoinDataFrames } from './joinDataFrames';
import { fieldMatchers } from '../matchers';
import { FieldMatcherID } from '../matchers/ids';

export interface SeriesToColumnsOptions {
  byField?: string; // empty will pick the field automatically
}

export const seriesToColumnsTransformer: DataTransformerInfo<SeriesToColumnsOptions> = {
  id: DataTransformerID.seriesToColumns,
  name: 'Series as columns', // Called 'Outer join' in the UI!
  description: 'Groups series by field and returns values as columns',
  defaultOptions: {
    byField: undefined, // DEFAULT_KEY_FIELD,
  },
  operator: (options) => (source) =>
    source.pipe(
      map((data) => {
        if (data.length > 1) {
          let joinBy: FieldMatcher | undefined = undefined;
          if (options.byField) {
            joinBy = fieldMatchers.get(FieldMatcherID.byName).get(options.byField);
          }
          const joined = outerJoinDataFrames({ frames: data, joinBy });
          if (joined) {
            return [joined];
          }
        }
        return data;
      })
    ),
};
