import { createMixedDecorator } from '@nestjs/swagger/dist/decorators/helpers';
import { DECORATORS } from '../asyncapi.constants';
import { AsyncApiSpecificOperationOptions } from '../interface';

/**
 * @deprecated Не завершён и работает не корректно
 * @todo
 * */
export function AsyncApiOperation(
  options: AsyncApiSpecificOperationOptions,
): MethodDecorator {
  return (target, propertyKey: string | symbol, descriptor) => {
    return createMixedDecorator(DECORATORS.AsyncApiOperation, [options])(
      target,
      propertyKey,
      descriptor,
    );
  };
}
