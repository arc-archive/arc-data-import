/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/postman-v2-transformer.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {PostmanTransformer} from './postman-transformer.js';

export {PostmanV2Transformer};

/**
 * Transforms Postamn v2 collections to ARC import object.
 */
declare class PostmanV2Transformer extends PostmanTransformer {

  /**
   * @param data Import data object
   */
  constructor(data: object|null);

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param items List of `formdata` models.
   * @param item ARC request object.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(items: any[]|null, item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param items List of `urlencoded` models.
   * @param item ARC request object.
   * @returns Body value.
   */
  _computeUrlEncodedBody(items: any[]|null, item: object|null): String|null;

  /**
   * Transforms `_data` into ARC data model.
   *
   * @returns Promise resolved when data are transformed.
   */
  transform(): Promise<any>|null;

  /**
   * Creates the project model based on Postman collection
   *
   * @param requests list of read requests
   * @returns Arc project data model.
   */
  _readProjectInfo(requests: Array<object|null>|null): object|null;

  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @returns Promise resolved to list of ARC request objects.
   */
  _readRequestsData(): Promise<any>|null;

  /**
   * Extracts all requests in order from postman v2 collection.
   * It uses `deffer()` function every `chounkSize` iteration so function can
   * release event loop and not to freze browser.
   *
   * @param data List of Postamn V2 collection `item`.
   * (why it's called item and not items?)
   * @param result Array where to append results.
   * @returns Promise resolved when all objects are computed.
   */
  _extractRequestsV2(data: Array<object|null>|null, result: Array<object|null>|null): Promise<any>|null;

  /**
   * Computes ARC request out of Postman v2 item.
   *
   * @param item Postamn v2 item.
   * @returns ARC request object.
   */
  _computeArcRequest(item: object|null): object|null;

  /**
   * Computes headers string from item's headers.
   *
   * @param headers Postman Request.header model.
   * @returns Computed value of headers.
   */
  _computeHeaders(headers: Array<object|null>|null): String|null;

  /**
   * Computes body value for v2 request.body.
   *
   * @param body v2 request.body
   * @param item ARC request object.
   * @returns Body value as string.
   */
  _computePayload(body: object|null, item: object|null): String|null;
}
