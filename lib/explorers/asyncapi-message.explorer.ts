import { DECORATORS } from '../asyncapi.constants';
import { AsyncApiSpecificMessageOptions } from '../interface';

export const exploreAsyncApiOperationMetadata = (method: object) => {
  const metadataMessages: AsyncApiSpecificMessageOptions[] =
    Reflect.getMetadata(DECORATORS.AsyncApiMessage, method);

  return metadataMessages.map((option) => {
    return {
      ...option,
    } satisfies AsyncApiSpecificMessageOptions;
  });
};
