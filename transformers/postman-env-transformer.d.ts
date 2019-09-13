/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/postman-env-transformer.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {PostmanTransformer} from './postman-transformer.js';

export {PostmanEnvTransformer};

/**
 * Transforms environment export from postman to ARC variables.
 */
declare class PostmanEnvTransformer extends PostmanTransformer {

  /**
   * @param data Import data object
   */
  constructor(data: object|null);

  /**
   * Transforms `_data` into ARC data model.
   *
   * @returns Promise resolved when data are transformed.
   */
  transform(): Promise<any>|null;

  /**
   * Transforms the list of variables in a environment to ARC variables.
   *
   * @param vars List of Postman's variables
   * @param envName Environment name. Default to `default`.
   * @returns List of ARC variables.
   */
  _transformVariables(vars: Array<object|null>|null, envName: String|null): Array<object|null>|null;

  /**
   * Generates an _id to store the same data.
   *
   * @param item ARC variable model
   * @returns Variable ID
   */
  _genId(item: object|null): String|null;
}
