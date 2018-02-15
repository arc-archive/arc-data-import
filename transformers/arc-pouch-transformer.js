'use strict';
/* global self */
var isNode = true;
if (typeof window !== 'undefined' || (typeof self !== 'undefined' && self.importScripts)) {
  isNode = false;
}
if (isNode) {
  var {BaseTransformer} = require('./base-transformer');
}
/**
 * Transforms Dexie system (legacy system) into current data model.
 * @extends BaseTransformer
 */
class _ArcPouchTransformer extends BaseTransformer {
  /**
   * @constructor
   * @param {Object} data Import data object
   */
  constructor(data) {
    super(data);
  }
  /**
   * Transforms PouchDB ARC export object based into current export data model.
   *
   * @return {Object} New data model object.
   */
  transform() {
    let data = this._data;
    if (data.projects && data.projects.length) {
      data.projects = this._transformProjects(data.projects);
    }
    if (data.requests && data.requests.length) {
      data.requests = this._transformRequests(data.requests, data.projects);
    }
    if (data.history && data.history.length) {
      data.history = this._transformHistory(data.history);
    }
    var socketUrls = data['websocket-url-history'];
    if (socketUrls && socketUrls.length) {
      data['websocket-url-history'] = this._tranformSimpleObject(socketUrls);
    }
    var urls = data['url-history'];
    if (urls && urls.length) {
      data['url-history'] = this._tranformSimpleObject(urls);
    }
    if (data.variables && data.variables.length) {
      data.variables = this._tranformSimpleObject(data.variables);
    }
    var headersSets = data['headers-sets'];
    if (headersSets && headersSets.length) {
      data['headers-sets'] = this._tranformHeadersSets(headersSets);
    }
    var authData = data['auth-data'];
    if (authData && authData.length) {
      data['auth-data'] = this._tranformSimpleObject(authData);
    }
    if (data.cookies && data.cookies.length) {
      data.cookies = this._tranformSimpleObject(data.cookies);
    }
    var hostRules = data['host-rules'];
    if (hostRules && hostRules.length) {
      data['host-rules'] = this._tranformSimpleObject(hostRules);
    }
    data.kind = 'ARC#Import';
    return Promise.resolve(data);
  }

  _updateItemTimings(item) {
    if (!item.created) {
      if (item.updated) {
        item.created = item.updated;
      } else {
        item.created = Date.now();
      }
    }
    item.updated = Date.now();
    return item;
  }

  // Replaces `_referenceId` with `_id`
  _transformProjects(projects) {
    return projects.map((project) => {
      if (project._referenceId) {
        project._id = project._referenceId;
        delete project._referenceId;
      }
      project = this._updateItemTimings(project);
      delete project.kind;
      return project;
    });
  }

  _transformRequests(requests, projects) {
    projects = projects || [];
    return requests.map((request) => {
      let refId = request._referenceLegacyProject;
      if (refId) {
        delete request._referenceLegacyProject;
        let project = projects.find((item) => item._id === refId);
        if (project) {
          request.legacyProject = refId;
        }
      }
      delete request.kind;
      request.name = request.name || 'unnamed';
      request.url = request.url || 'http://';
      request.method = request.method || 'GET';
      request.headers = request.headers || '';
      request.payload = request.payload || '';
      if (!request._id) {
        request._id = this.generateRequestId(request, request.legacyProject);
      }
      request = this._updateItemTimings(request);
      if (!request.queryModel) {
        request.queryModel = [];
      }
      if (!request.headersModel) {
        request.headersModel = [];
      }
      return request;
    });
  }

  _transformHistory(history) {
    return history.map((item) => {
      item = this._updateItemTimings(item);
      item.url = item.url || 'http://';
      item.method = item.method || 'GET';
      item.headers = item.headers || '';
      item.payload = item.payload || '';
      delete item.kind;
      if (!item._id) {
        item._id = this.generateHistoryId(item.created, item);
      }
      return item;
    });
  }

  _tranformSimpleObject(items) {
    return items.map((item) => {
      if (item.key && !item._id) {
        item._id = item.key;
        delete item.key;
      } else if (!item._id) {
        item._id = this.uuid();
      }
      delete item.kind;
      return item;
    });
  }

  _tranformHeadersSets(items) {
    return items.map((item) => {
      item = this._updateItemTimings(item);
      item._id = this.uuid();
      delete item.kind;
      return item;
    });
  }
}
if (isNode) {
  exports.ArcPouchTransformer = _ArcPouchTransformer;
} else {
  (window || self).ArcPouchTransformer = _ArcPouchTransformer;
}
