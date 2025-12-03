import { MessageTraitObject } from '@asyncapi/parser/esm/spec-types/v3';
import { AsyncMessagePayload } from './asyncapi-message-payload.interface';

export interface AsyncApiSpecificMessageOptions
  extends Omit<MessageTraitObject, 'payload'> {
  payload: AsyncMessagePayload;
  channel: string;
}
