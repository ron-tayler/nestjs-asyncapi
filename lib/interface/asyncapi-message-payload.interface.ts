import { Type } from '@nestjs/common';

export type AsyncMessagePayload = Type<unknown> | Function;
