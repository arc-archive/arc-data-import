/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/postman-backup-transformer.js
 *   transformers/postman-backup-transformer.js
 */

/**
 * Transformer for Postamn backup file.
 */
declare class PostmanBackupTransformer {

  /**
   * Transforms `_data` into ARC data model.
   *
   * @returns Promise resolved when data are transformed.
   */
  transform(): Promise<any>|null;

  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @returns List of ARC request objects.
   */
  _readRequestsData(data: Array<object|null>|null): any[]|null;

  /**
   * Reads collections data.
   *
   * @returns Map of projects and requests.
   */
  _readCollectionData(collection: object|null, index: Number|null): object|null;

  /**
   * Creates ordered list of requests as defined in collection order property.
   * This creates a flat structure of requests and order assumes ARC's flat
   * structure.
   *
   * @returns List of ordered Postman requests
   */
  _computeRequestsOrder(collection: object|null): object|null;

  /**
   * Computes list of folders including sub-folders .
   *
   * @param folders Collection folders definition
   * @param orderIds Collection order info array
   * @returns Ordered list of folders.
   */
  _computeOrderedFolders(folders: Array<object|null>|null, orderIds: Array<String|null>|null): Array<object|null>|null;

  /**
   * Transforms postman request to ARC request
   *
   * @param item Postman request object
   * @param projectId Id of the project of the request
   * @param projectIndex Order index of the request in the project
   * @returns ARC request object
   */
  _createRequestObject(item: object|null, projectId: String|null, projectIndex: Number|null): object|null;

  /**
   * Updates `created` and `updated` fileds of the object.
   *
   * @param item Request object
   * @param stamp Timestamp
   * @returns Request object
   */
  _updateItemTimings(item: object|null, stamp: Number|null): object|null;

  /**
   * Comnputes list of ARC's headers sets from Postam data.
   */
  _computeHeadersSets(sets: any[]|null): any[]|null;

  /**
   * Computes headers set object from postman data.
   *
   * @param item Postman header set definition.
   * @returns ARC's header set object
   */
  _computeSetObject(item: object|null): object|null;

  /**
   * Computes list of variables to import.
   *
   * @param data Postman import object
   * @returns List of variables or undefined if no variables
   * found.
   */
  _computeVariables(data: object|null): any[]|null|undefined;

  /**
   * Creates a variable object item.
   *
   * @param item Postman's variable definition.
   * @param environment Environment name
   * @returns ARC's variable definition.
   */
  _computeVariableObject(item: object|null, environment: String|null): object|null;
}

/**
 * Transformer for Postamn backup file.
 */
declare class PostmanBackupTransformer {

  /**
   * Transforms `_data` into ARC data model.
   *
   * @returns Promise resolved when data are transformed.
   */
  transform(): Promise<any>|null;

  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @returns List of ARC request objects.
   */
  _readRequestsData(data: Array<object|null>|null): any[]|null;

  /**
   * Reads collections data.
   *
   * @returns Map of projects and requests.
   */
  _readCollectionData(collection: object|null, index: Number|null): object|null;

  /**
   * Creates ordered list of requests as defined in collection order property.
   * This creates a flat structure of requests and order assumes ARC's flat
   * structure.
   *
   * @returns List of ordered Postman requests
   */
  _computeRequestsOrder(collection: object|null): object|null;

  /**
   * Computes list of folders including sub-folders .
   *
   * @param folders Collection folders definition
   * @param orderIds Collection order info array
   * @returns Ordered list of folders.
   */
  _computeOrderedFolders(folders: Array<object|null>|null, orderIds: Array<String|null>|null): Array<object|null>|null;

  /**
   * Transforms postman request to ARC request
   *
   * @param item Postman request object
   * @param projectId Id of the project of the request
   * @param projectIndex Order index of the request in the project
   * @returns ARC request object
   */
  _createRequestObject(item: object|null, projectId: String|null, projectIndex: Number|null): object|null;

  /**
   * Updates `created` and `updated` fileds of the object.
   *
   * @param item Request object
   * @param stamp Timestamp
   * @returns Request object
   */
  _updateItemTimings(item: object|null, stamp: Number|null): object|null;

  /**
   * Comnputes list of ARC's headers sets from Postam data.
   */
  _computeHeadersSets(sets: any[]|null): any[]|null;

  /**
   * Computes headers set object from postman data.
   *
   * @param item Postman header set definition.
   * @returns ARC's header set object
   */
  _computeSetObject(item: object|null): object|null;

  /**
   * Computes list of variables to import.
   *
   * @param data Postman import object
   * @returns List of variables or undefined if no variables
   * found.
   */
  _computeVariables(data: object|null): any[]|null|undefined;

  /**
   * Creates a variable object item.
   *
   * @param item Postman's variable definition.
   * @param environment Environment name
   * @returns ARC's variable definition.
   */
  _computeVariableObject(item: object|null, environment: String|null): object|null;
}
