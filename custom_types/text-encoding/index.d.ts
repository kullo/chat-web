// Rewrite of the broken
// https://www.npmjs.com/package/@types/text-encoding

// Type definitions for text-encoding
// Project: https://github.com/inexorabletash/text-encoding
// Definitions by: MIZUNE Pine <https://github.com/pine613>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "text-encoding" {
  interface TextEncoderOptions {
      NONSTANDARD_allowLegacyEncoding?: boolean;
  }

  interface TextEncodeOptions {
      stream?: boolean;
  }

  interface TextDecoderOptions {
      fatal?: boolean;
      ignoreBOM?: boolean;
  }

  interface TextDecodeOptions {
      stream?: boolean;
  }

  interface TextEncoderInterface {
      encoding: string;
      encode(input?: string, options?: TextEncodeOptions): Uint8Array;
      (utfLabel?: string, options?: TextEncoderOptions): TextEncoderInterface;
      new (utfLabel?: string, options?: TextEncoderOptions): TextEncoderInterface;
  }

  interface TextDecoderInterface {
      encoding: string;
      fatal: boolean;
      ignoreBOM: boolean;
      decode(input?: ArrayBuffer | ArrayBufferView, options?: TextDecodeOptions): string;
      (label?: string, options?: TextDecoderOptions): TextDecoderInterface;
      new (label?: string, options?: TextDecoderOptions): TextDecoderInterface;
  }

  var TextEncoder: TextEncoderInterface;
  var TextDecoder: TextDecoderInterface;
}
