import { MessageTraitObject } from '@asyncapi/parser/esm/spec-types/v3';
import { AsyncOperationPayload } from './asyncapi-operation-payload.interface';

export interface AsyncApiSpecificMessageOptions
  extends Omit<MessageTraitObject, 'payload'> {
  payload: AsyncOperationPayload;
  channel?: string;
}
