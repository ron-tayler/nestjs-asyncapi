import {
  AsyncAPIObject,
  ChannelObject,
  SchemaObject,
} from '@asyncapi/parser/esm/spec-types/v3';
import { SchemaObject as SwaggerSchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { getSchemaPath } from '@nestjs/swagger/dist/utils';
import { AsyncMessagePayload, DenormalizedDoc } from '../interface';

export class AsyncApiObjectFactory {
  private readonly modelPropertiesAccessor = new ModelPropertiesAccessor();
  private readonly swaggerTypesMapper = new SwaggerTypesMapper();
  private readonly schemaObjectFactory = new SchemaObjectFactory(
    this.modelPropertiesAccessor,
    this.swaggerTypesMapper,
  );

  private readonly asyncApiObject: Pick<
    AsyncAPIObject,
    'channels' | 'operations' | 'components'
  > = {};
  private readonly channels: Map<string, ChannelObject> = new Map();
  private readonly schemas: Record<string, SchemaObject> = {};

  processingExtraModels(models: AsyncMessagePayload[]) {
    models.forEach((model) => {
      this.exploreModelSchema(model);
    });
  }

  processingDenormalizeDocs(docs: DenormalizedDoc[]) {
    docs.forEach((doc) => {
      doc.messages.forEach(
        ({ channel: channelName, name, payload, ...message_opt }) => {
          const payload_name = this.exploreModelSchema(payload);

          const channelObj = this.channels.get(channelName) ?? {};
          this.channels.set(channelName, channelObj);
          const messages = (channelObj.messages = channelObj.messages ?? {});
          messages[name ?? payload_name] = {
            ...message_opt,
            payload: { $ref: getSchemaPath(payload_name) },
          };
        },
      );

      doc.channels.forEach(({ name, ...channelOpt }) => {
        if (!this.asyncApiObject.channels) this.asyncApiObject.channels = {};
        const channelObj = this.channels.get(name) ?? {};
        this.asyncApiObject.channels[name] = {
          ...channelOpt,
          ...channelObj,
        };
      });
    });
  }

  getAsyncApiObject(): Readonly<
    Pick<AsyncAPIObject, 'channels' | 'operations' | 'components'>
  > {
    return Object.freeze({
      ...this.asyncApiObject,
      components: {
        schemas: this.schemas,
      },
    });
  }

  private exploreModelSchema(payload: AsyncMessagePayload): string {
    return this.schemaObjectFactory.exploreModelSchema(
      payload,
      this.schemas as Record<string, SwaggerSchemaObject>,
    );
  }
}
