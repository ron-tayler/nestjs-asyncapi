import { AsyncapiChannelOptions } from './asyncapi-channel-options.interface';
import { AsyncApiSpecificMessageOptions } from './asyncapi-message-options.interface';

export interface DenormalizedDoc {
  channels: AsyncapiChannelOptions[];
  messages: AsyncApiSpecificMessageOptions[];
}
