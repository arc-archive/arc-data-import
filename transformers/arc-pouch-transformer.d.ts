/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/arc-pouch-transformer.js
 *   transformers/arc-pouch-transformer.js
 */

/**
 * Transforms Dexie system (legacy system) into current data model.
 */
declare class ArcPouchTransformer {

  /**
   * Transforms PouchDB ARC export object based into current export data model.
   *
   * @returns New data model object.
   */
  transform(): object|null;
  _updateItemTimings(item: any): any;

  /**
   * Replaces `_referenceId` with `_id`
   */
  _transformProjects(projects: any): any;
  _transformRequests(requests: any, projects: any): any;
  _transformHistory(history: any): any;
  _tranformSimpleObject(items: any): any;
  _tranformHeadersSets(items: any): any;
}

/**
 * Transforms Dexie system (legacy system) into current data model.
 */
declare class ArcPouchTransformer {

  /**
   * Transforms PouchDB ARC export object based into current export data model.
   *
   * @returns New data model object.
   */
  transform(): object|null;
  _updateItemTimings(item: any): any;

  /**
   * Replaces `_referenceId` with `_id`
   */
  _transformProjects(projects: any): any;
  _transformRequests(requests: any, projects: any): any;
  _transformHistory(history: any): any;
  _tranformSimpleObject(items: any): any;
  _tranformHeadersSets(items: any): any;
}