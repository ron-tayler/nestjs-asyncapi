import { createMixedDecorator } from '@nestjs/swagger/dist/decorators/helpers';
import { DECORATORS } from '../asyncapi.constants';
import { AsyncApiSpecificMessageOptions } from '../interface';

export function AsyncApiMessage(options: AsyncApiSpecificMessageOptions) {
  return createMixedDecorator(DECORATORS.AsyncApiMessage, [options]);
}
