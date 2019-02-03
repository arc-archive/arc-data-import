'use strict';
/* global BaseTransformer */
/* jshint -W098 */
/**
 * Transforms the first ARC data object to curent schema.
 */
class ArcLegacyTransformer extends BaseTransformer {
  /**
   * Transforms legacy ARC export object into current export data model.
   *
   * @param {Object} data Exported data object from the file.
   * @return {Object} New data model object.
   */
  transform() {
    let projects;
    let requests;
    if (this._isSingleRequest(this._data)) {
      projects = [];
      requests = [this._transformRequest(this._data)];
    } else {
      projects = this._transformProjects(this._data.projects);
      requests = this._transformRequests(this._data.requests, projects);
    }
    projects = projects.map((item) => {
      delete item._oldId;
      return item;
    });

    const result = {
      createdAt: new Date().toISOString(),
      version: 'unknown',
      kind: 'ARC#Import',
      requests: requests,
      projects: projects
    };

    return Promise.resolve(result);
  }

  /**
   * Tests if the data import is a single request export.
   *
   * @param {Object} data Imported data
   * @return {Boolean} True if `data` represents single request
   */
  _isSingleRequest(data) {
    if ('requests' in data || 'projects' in data) {
      return false;
    }
    return true;
  }

  /**
   * Returns a list of projects from a legacy export file.
   *
   * Each project will have nevely generated ID to not make conflicts with
   * existing projects. Old project id is moved to `_oldId` property.
   *
   * @param {Array} projects List of legacy project objects
   * @return {Array} List of project object in current data model. It can be
   * empty array.
   */
  _transformProjects(projects) {
    if (!projects || !(projects instanceof Array) || !projects.length) {
      return [];
    }
    return projects.map((item) => {
      let created = Number(item.created);
      if (created !== created) {
        created = Date.now();
      }
      return {
        _id: this.uuid(),
        created: created,
        name: item.name || 'unnamed',
        order: 0,
        updated: Date.now(),
        _oldId: item.id
      };
    });
  }
  /**
   * Transform the list of requests into new data model.
   *
   * @param {Array<Object>} requests
   * @param {Array<Object>} projects
   * @return {Array<Object>}
   */
  _transformRequests(requests, projects) {
    if (!requests || !(requests instanceof Array) || !requests.length) {
      return [];
    }
    return requests.map((item) => this._transformRequest(item, projects));
  }
  /**
   * Transforms a single request object into current data model.
   *
   * Note that required properties will be default to the following:
   * -   `name` - "unnamed"
   * -   `url` - "http://"
   * -   `method` - "GET"
   *
   * @param {Object} item Legacy request definition
   * @param {?Array} projects List of projects in the import file.
   * @return {Object} Current model of the request object.
   */
  _transformRequest(item, projects) {
    item.name = item.name || 'unnamed';
    item.url = item.url || 'http://';
    item.method = item.method || 'GET';

    const project = projects ? this._findProject(item.project, projects) : undefined;
    const projectId = project ? project._id : undefined;
    const id = this.generateRequestId(item, projectId);
    let created = Number(item.time);
    if (created !== created) {
      created = Date.now();
    }
    const result = {
      _id: id,
      created: created,
      updated: Date.now(),
      headers: item.headers || '',
      method: item.method,
      name: item.name,
      payload: item.payload || '',
      type: 'saved',
      url: item.url,
      queryModel: [],
      headersModel: []
    };
    if (projectId) {
      result.projects = [projectId];
      this.addRequestReference(project, id);
    }
    if (item.driveId) {
      result.driveId = item.driveId;
    }
    return result;
  }

  /**
   * Finds a project in the list of projects.
   *
   * @param {String} projectId A project ID to search for
   * @param {Array} projects List of project to look into. It compares the
   * `_oldId` property of the list items.
   * @return {Object} A project object or undefined if not found.
   */
  _findProject(projectId, projects) {
    if (!projectId) {
      return;
    }
    if (!projects || !projects.length) {
      return;
    }
    for (let i = 0, len = projects.length; i < len; i++) {
      const p = projects[i];
      if (p._oldId === projectId) {
        return p;
      }
    }
  }
}
