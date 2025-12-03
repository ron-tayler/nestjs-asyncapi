import { Type } from '@nestjs/common';
import { DECORATORS } from '../asyncapi.constants';
import { AsyncapiChannelOptions } from '../interface/asyncapi-channel-options.interface';

export function asyncapiChannelExplorer(
  metatype: Type<unknown>,
): [AsyncapiChannelOptions] | undefined {
  return Reflect.getMetadata(DECORATORS.AsyncApiChannel, metatype);
}
