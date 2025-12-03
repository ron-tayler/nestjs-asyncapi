import Generator from '@asyncapi/generator';
import { AsyncAPIObject } from '@asyncapi/parser/esm/spec-types/v3';
import jsyaml from 'js-yaml';
import os from 'os';
import { AsyncApiTemplateOptions, GeneratorOptions } from '../interface';

export class AsyncapiGenerator {
  private readonly generator: GeneratorOptions;

  constructor(readonly templateOptions?: AsyncApiTemplateOptions) {
    this.generator = new Generator('@asyncapi/html-template', os.tmpdir(), {
      forceWrite: true,
      entrypoint: 'index.html',
      output: 'string',
      templateParams: {
        singleFile: true,
        ...templateOptions,
      },
    });
  }

  public async generate(contract: AsyncAPIObject): Promise<string> {
    const yaml = jsyaml.dump(contract);
    return this.generator.generateFromString(yaml, {
      resolve: {
        file: false,
      },
    });
  }
}
