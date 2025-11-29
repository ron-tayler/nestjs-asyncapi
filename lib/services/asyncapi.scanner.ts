import { INestApplicationContext, Type } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { Injectable, InjectionToken } from '@nestjs/common/interfaces';
import { NestContainer } from '@nestjs/core/injector/container';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { stripLastSlash } from '@nestjs/swagger/dist/utils/strip-last-slash.util';
import { flatten, isEmpty } from 'lodash';
import {
  AsyncApiDocument,
  AsyncApiDocumentOptions,
  DenormalizedDoc,
} from '../interface';
import { AsyncApiExplorer } from './asyncapi.explorer';
import { AsyncapiTransformer } from './asyncapi.transformer';

export class AsyncapiScanner {
  private readonly transformer = new AsyncapiTransformer();
  private readonly explorer = new AsyncApiExplorer();
  private readonly modelPropertiesAccessor = new ModelPropertiesAccessor();
  private readonly swaggerTypesMapper = new SwaggerTypesMapper();
  private readonly schemaObjectFactory = new SchemaObjectFactory(
    this.modelPropertiesAccessor,
    this.swaggerTypesMapper,
  );

  public scanApplication(
    app: INestApplicationContext,
    options: AsyncApiDocumentOptions,
  ): Pick<AsyncApiDocument, 'channels' | 'operations' | 'components'> {
    const {
      deepScanRoutes,
      include: includedModules = [],
      extraModels = [],
      operationIdFactory,
    } = options;

    const container: NestContainer = (app as any).container;
    const modules: Module[] = this.getModules(
      container.getModules(),
      includedModules,
    );

    const providers = modules
      .map((module) =>
        this.getModuleProviders(container, module, deepScanRoutes),
      )
      .map((providers) => [...providers.values()])
      .flat();

    const denormalizedChannels = this.scanModuleProviders(
      providers,
      operationIdFactory,
    );

    const schemas = this.explorer.getSchemas();
    this.addExtraModels(schemas, extraModels);
    const { channels: normalizedChannels } =
      this.transformer.normalizeChannels(denormalizedChannels);
    return {
      channels: normalizedChannels,
      components: {
        schemas,
      },
    };
  }

  private getModuleProviders(
    container: NestContainer,
    { providers, controllers, imports }: Module,
    deepScanRoutes: boolean = false,
  ): Map<InjectionToken, InstanceWrapper<unknown>> {
    let allProviders = new Map([...providers, ...controllers]);

    if (deepScanRoutes) {
      // only load submodules routes if asked
      const isGlobal = (module: Type) => !container.isGlobalModule(module);

      Array.from(imports.values())
        .filter(isGlobal as any)
        .map(
          ({
            providers: relatedProviders,
            controllers: relatedControllers,
          }) => ({
            relatedProviders,
            relatedControllers,
          }),
        )
        .forEach(({ relatedProviders, relatedControllers }) => {
          allProviders = new Map([
            ...allProviders,
            ...relatedProviders,
            ...relatedControllers,
          ]);
        });
    }

    return allProviders;
  }

  private scanModuleProviders(
    providers: InstanceWrapper<Injectable>[],
    operationIdFactory?: (controllerKey: string, methodKey: string) => string,
  ): DenormalizedDoc[] {
    const denormalizedArray = providers.reduce<DenormalizedDoc[]>(
      (denormalized, provider) => {
        const object = this.explorer.explorerAsyncapiServices(
          provider,
          operationIdFactory,
        );
        return [...denormalized, ...object];
      },
      [],
    );

    return flatten(denormalizedArray);
  }

  private getModules(
    modulesContainer: Map<string, Module>,
    include: Function[],
  ): Module[] {
    if (!include || isEmpty(include)) {
      return [...modulesContainer.values()];
    }
    return [...modulesContainer.values()].filter(({ metatype }) =>
      include.some((item) => item === metatype),
    );
  }

  private getGlobalPrefix(app: INestApplicationContext): string {
    const internalConfigRef = (app as any).config;
    return internalConfigRef?.getGlobalPrefix() || '';
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
