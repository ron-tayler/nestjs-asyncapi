import { ChannelObject } from '@asyncapi/parser/esm/spec-types/v3';

type ChannelOmit = 'messages';

export interface AsyncapiChannelOptions
  extends Omit<ChannelObject, ChannelOmit> {
  name: string;
}
