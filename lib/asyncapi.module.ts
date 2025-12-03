import { AsyncAPIObject } from '@asyncapi/parser/esm/spec-types/v3';
import {
  INestApplication,
  INestApplicationContext,
  Logger,
} from '@nestjs/common';
import { validatePath } from '@nestjs/swagger/dist/utils/validate-path.util';
import jsyaml from 'js-yaml';
import { AsyncApiDocumentOptions, AsyncApiTemplateOptions } from './interface';
import { AsyncapiGenerator, AsyncapiScanner } from './services';

export class AsyncApiModule {
  private static readonly logger = new Logger(AsyncApiModule.name);

  public static createDocument(
    app: INestApplicationContext,
    config: Omit<AsyncAPIObject, 'channels'>,
    options: AsyncApiDocumentOptions = {},
  ): AsyncAPIObject {
    const asyncapiScanner = new AsyncapiScanner();
    const scannedDocument = asyncapiScanner.scanApplication(app, options);
    const document = {
      ...scannedDocument,
      components: {
        ...(config.components || {}),
        ...scannedDocument.components,
      },
    };

    return {
      ...config,
      ...document,
    };
  }

  static async composeHtml(
    contract: AsyncAPIObject,
    templateOptions?: AsyncApiTemplateOptions,
  ) {
    const generator = new AsyncapiGenerator(templateOptions);
    return generator.generate(contract).catch((err) => {
      this.logger.error(err);
      throw err;
    });
  }

  public static async setup(
    path: string,
    app: INestApplication,
    document: AsyncAPIObject,
    templateOptions?: AsyncApiTemplateOptions,
  ) {
    const httpAdapter = app.getHttpAdapter();
    const finalPath = validatePath(path);

    const html = await this.composeHtml(document, templateOptions);
    const yamlDocument = jsyaml.dump(document);
    const jsonDocument = JSON.stringify(document);

    httpAdapter.get(finalPath, (req, res) => {
      res.type('text/html');
      res.send(html);
    });

    httpAdapter.get(finalPath + '-json', (req, res) => {
      res.type('application/json');
      res.send(jsonDocument);
    });

    httpAdapter.get(finalPath + '-yaml', (req, res) => {
      res.type('text/yaml');
      res.send(yamlDocument);
    });
  }
}
