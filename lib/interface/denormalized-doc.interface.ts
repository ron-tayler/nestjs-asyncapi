import {
  AsyncApiDocument,
  AsyncChannelObject,
  AsyncOperationObject,
} from './asyncapi-common.interfaces';

export interface DenormalizedDoc extends Partial<AsyncApiDocument> {
  root?: { name: string } & AsyncChannelObject;
  // v2 structure
  operations?: { pub?: AsyncOperationObject; sub?: AsyncOperationObject };
  // v3 structure
  v3Operations?: Array<{ action: 'send' | 'receive'; operation: AsyncOperationObject; channel: string }>;
}
