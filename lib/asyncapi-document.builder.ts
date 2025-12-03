import {
  AsyncAPIObject,
  ExternalDocumentationObject,
  ServerObject,
} from '@asyncapi/parser/esm/spec-types/v3';

export class AsyncApiDocumentBuilder {
  private readonly buildDocumentBase = (): AsyncAPIObject =>
    ({
      asyncapi: '3.0.0',
      info: {
        title: '',
        description: '',
        version: '1.0.0',
        contact: {},
        tags: [],
      },
      servers: {},
      components: {},
    }) satisfies AsyncAPIObject;

  private readonly document = this.buildDocumentBase();

  public setTitle(title: string): this {
    this.document.info.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.document.info.description = description;
    return this;
  }

  public setVersion(version: string): this {
    this.document.info.version = version;
    return this;
  }

  public setTermsOfService(termsOfService: string): this {
    this.document.info.termsOfService = termsOfService;
    return this;
  }

  public setContact(name: string, url: string, email: string): this {
    this.document.info.contact = { name, url, email };
    return this;
  }

  public setLicense(name: string, url: string): this {
    this.document.info.license = { name, url };
    return this;
  }

  public addServer(name: string, server: ServerObject): this {
    this.document.servers![name] = server;
    return this;
  }

  public addServers(servers: { name: string; server: ServerObject }[]): this {
    for (const { name, server } of servers) {
      this.addServer(name, server);
    }

    return this;
  }

  public setExternalDoc(description: string, url: string): this {
    this.document.info.externalDocs = { description, url };
    return this;
  }

  public setDefaultContentType(contentType: string) {
    this.document.defaultContentType = contentType;
    return this;
  }

  public addTag(
    name: string,
    description = '',
    externalDocs?: ExternalDocumentationObject,
  ): this {
    this.document.info.tags = this.document.info.tags!.concat({
      name,
      description,
      externalDocs,
    });
    return this;
  }

  public build(): Omit<AsyncAPIObject, 'components' | 'channels'> {
    return this.document;
  }
}
