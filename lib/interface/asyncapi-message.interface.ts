import { AsyncMessageObject } from './asyncapi-common.interfaces';
import { AsyncApiOperationHeaders } from './asyncapi-operation-headers.interface';
import { AsyncOperationPayload } from './asyncapi-operation-payload.interface';

export interface OneAsyncApiMessage {
  name?: string;
  payload: AsyncOperationPayload;
  headers?: AsyncApiOperationHeaders;
}

export interface OneOfMessageType {
  oneOf: AsyncMessageObject[];
}
