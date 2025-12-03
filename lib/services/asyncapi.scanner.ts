import { AsyncAPIObject } from '@asyncapi/parser/esm/spec-types/v3';
import { INestApplicationContext, Type } from '@nestjs/common';
import { Injectable } from '@nestjs/common/interfaces';
import { MetadataScanner } from '@nestjs/core';
import { NestContainer } from '@nestjs/core/injector/container';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { isEmpty } from 'lodash';
import { asyncApiClassAnnotationLabels } from '../explorers';
import { asyncapiChannelExplorer } from '../explorers/asyncapi-channel.explorer';
import { exploreAsyncApiOperationMetadata } from '../explorers/asyncapi-message.explorer';
import { AsyncApiObjectFactory } from '../factory/asyncapi-object.factory';
import {
  AsyncApiDocumentOptions,
  AsyncApiSpecificMessageOptions,
  DenormalizedDoc,
} from '../interface';

type NotNullable<T> = T extends undefined ? never : T;

export class AsyncapiScanner {
  private readonly modelPropertiesAccessor = new ModelPropertiesAccessor();
  private readonly swaggerTypesMapper = new SwaggerTypesMapper();
  private readonly metadataScanner = new MetadataScanner();

  private readonly schemaObjectFactory = new SchemaObjectFactory(
    this.modelPropertiesAccessor,
    this.swaggerTypesMapper,
  );

  public scanApplication(
    app: INestApplicationContext,
    options: AsyncApiDocumentOptions,
  ): Pick<AsyncAPIObject, 'channels' | 'operations' | 'components'> {
    const {
      deepScanRoutes,
      include: includedModules = [],
      extraModels = [],
    } = options;

    const container: NestContainer = (app as any).container;
    const modules = this.getModules(container, includedModules);

    const providers = modules
      .map((module) => this.getModuleProviders(module, deepScanRoutes))
      .flat();

    const denormalizedDocs = this.scanProviders(providers);

    const builder = new AsyncApiObjectFactory();

    builder.processingExtraModels(extraModels);
    builder.processingDenormalizeDocs(denormalizedDocs);

    return builder.getAsyncApiObject();
  }

  private getModules(container: NestContainer, include: Function[]): Module[] {
    const modules = [...container.getModules().values()];

    if (isEmpty(include)) return modules;

    return modules.filter(({ metatype }) =>
      include.some((item) => item === metatype),
    );
  }

  private getModuleProviders(
    { providers, controllers, imports }: Module,
    deepScanRoutes: boolean = false,
  ): ReadonlyArray<InstanceWrapper<unknown>> {
    const allProviders = new Set([
      ...providers.values(),
      ...controllers.values(),
    ]);

    if (deepScanRoutes) {
      Array.from(imports.values())
        .filter((module) => !module.isGlobal)
        .map(({ providers, controllers }) => [
          ...providers.values(),
          ...controllers.values(),
        ])
        .flat()
        .forEach((provider) => allProviders.add(provider));
    }

    return [...allProviders.values()];
  }

  private scanProviders(
    providers: InstanceWrapper<Injectable>[],
  ): DenormalizedDoc[] {
    return providers
      .map((provider) => this.scanProvider(provider))
      .filter((d): d is NotNullable<typeof d> => !!d);
  }

  private scanProvider(
    provider: InstanceWrapper<unknown>,
  ): DenormalizedDoc | undefined {
    const { instance, metatype } = provider;

    if (!instance) return void 0;
    if (!metatype) return void 0;
    if (!this.providerHasApiMeta(metatype)) return void 0;

    const channels = asyncapiChannelExplorer(metatype as Type) ?? [];

    const prototype = Object.getPrototypeOf(instance);
    const methodsNames = this.metadataScanner.getAllMethodNames(prototype);

    const allMessages: AsyncApiSpecificMessageOptions[] = [];

    methodsNames
      .map((name) => prototype[name])
      .forEach((method) => {
        const messages = exploreAsyncApiOperationMetadata(method);
        allMessages.push(...messages);
      });

    return {
      channels: channels,
      messages: allMessages,
    };
  }

  private providerHasApiMeta(metatype: Object): boolean {
    return Reflect.getMetadataKeys(metatype).some((label) =>
      asyncApiClassAnnotationLabels.includes(label),
    );
  }

  private addExtraModels(
    schemas: Record<string, SchemaObject>,
    extraModels: Function[],
  ) {
    extraModels.forEach((item) => {
      this.schemaObjectFactory.exploreModelSchema(item, schemas);
    });
  }
}
