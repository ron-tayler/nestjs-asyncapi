import { createMixedDecorator } from '@nestjs/swagger/dist/decorators/helpers';
import { DECORATORS } from '../asyncapi.constants';
import { AsyncapiChannelOptions } from '../interface/asyncapi-channel-options.interface';

/**
 * Mark class that has to be scanned for AsyncApi operations
 */
export function AsyncApiChannel(name: string | AsyncapiChannelOptions) {
  const options: AsyncapiChannelOptions =
    typeof name == 'string' ? { name } : name;

  return createMixedDecorator(DECORATORS.AsyncApiChannel, options);
}
