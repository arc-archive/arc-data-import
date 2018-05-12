/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/arc-legacy-transformer.js
 *   transformers/arc-legacy-transformer.js
 */

/**
 * Transforms the first ARC data object to curent schema.
 */
declare class ArcLegacyTransformer {

  /**
   * Transforms legacy ARC export object into current export data model.
   *
   * @returns New data model object.
   */
  transform(): object|null;

  /**
   * Tests if the data import is a single request export.
   *
   * @param data Imported data
   * @returns True if `data` represents single request
   */
  _isSingleRequest(data: object|null): Boolean|null;

  /**
   * Returns a list of projects from a legacy export file.
   *
   * Each project will have nevely generated ID to not make conflicts with
   * existing projects. Old project id is moved to `_oldId` property.
   *
   * @param projects List of legacy project objects
   * @returns List of project object in current data model. It can be
   * empty array.
   */
  _transformProjects(projects: any[]|null): any[]|null;

  /**
   * Transform the list of requests into new data model.
   */
  _transformRequests(requests: any, projects: any): any;

  /**
   * Transforms a single request object into current data model.
   *
   * Note that required properties will be default to the following:
   * -   `name` - "unnamed"
   * -   `url` - "http://"
   * -   `method` - "GET"
   *
   * @param item Legacy request definition
   * @param projects List of projects in the import file.
   * @returns Current model of the request object.
   */
  _transformRequest(item: object|null, projects: any[]|null): object|null;

  /**
   * Finds a project in the list of projects.
   *
   * @param projectId A project ID to search for
   * @param projects List of project to look into. It compares the
   * `_oldId` property of the list items.
   * @returns A project object or undefined if not found.
   */
  _findProject(projectId: String|null, projects: any[]|null): object|null;
}

/**
 * Transforms the first ARC data object to curent schema.
 */
declare class ArcLegacyTransformer {

  /**
   * Transforms legacy ARC export object into current export data model.
   *
   * @returns New data model object.
   */
  transform(): object|null;

  /**
   * Tests if the data import is a single request export.
   *
   * @param data Imported data
   * @returns True if `data` represents single request
   */
  _isSingleRequest(data: object|null): Boolean|null;

  /**
   * Returns a list of projects from a legacy export file.
   *
   * Each project will have nevely generated ID to not make conflicts with
   * existing projects. Old project id is moved to `_oldId` property.
   *
   * @param projects List of legacy project objects
   * @returns List of project object in current data model. It can be
   * empty array.
   */
  _transformProjects(projects: any[]|null): any[]|null;

  /**
   * Transform the list of requests into new data model.
   */
  _transformRequests(requests: any, projects: any): any;

  /**
   * Transforms a single request object into current data model.
   *
   * Note that required properties will be default to the following:
   * -   `name` - "unnamed"
   * -   `url` - "http://"
   * -   `method` - "GET"
   *
   * @param item Legacy request definition
   * @param projects List of projects in the import file.
   * @returns Current model of the request object.
   */
  _transformRequest(item: object|null, projects: any[]|null): object|null;

  /**
   * Finds a project in the list of projects.
   *
   * @param projectId A project ID to search for
   * @param projects List of project to look into. It compares the
   * `_oldId` property of the list items.
   * @returns A project object or undefined if not found.
   */
  _findProject(projectId: String|null, projects: any[]|null): object|null;
}
