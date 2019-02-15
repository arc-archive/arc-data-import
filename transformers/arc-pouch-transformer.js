'use strict';
/* global BaseTransformer */
/* jshint -W098 */
/**
 * Transforms Dexie system (legacy system) into current data model.
 */
class ArcPouchTransformer extends BaseTransformer {
  /**
   * Transforms PouchDB ARC export object based into current export data model.
   *
   * @return {Object} New data model object.
   */
  transform() {
    const data = this._data;
    if (data.projects && data.projects.length) {
      data.projects = this._transformProjects(data.projects);
    }
    if (data.requests && data.requests.length) {
      data.requests = this._transformRequests(data.requests, data.projects);
    }
    if (data.history && data.history.length) {
      data.history = this._transformHistory(data.history);
    }
    const socketUrls = data['websocket-url-history'];
    if (socketUrls && socketUrls.length) {
      data['websocket-url-history'] = this._tranformSimpleObject(socketUrls);
    }
    const urls = data['url-history'];
    if (urls && urls.length) {
      data['url-history'] = this._tranformSimpleObject(urls);
    }
    if (data.variables && data.variables.length) {
      data.variables = this._tranformSimpleObject(data.variables);
    }
    const headersSets = data['headers-sets'];
    if (headersSets && headersSets.length) {
      data['headers-sets'] = this._tranformHeadersSets(headersSets);
    }
    const authData = data['auth-data'];
    if (authData && authData.length) {
      data['auth-data'] = this._tranformSimpleObject(authData);
    }
    if (data.cookies && data.cookies.length) {
      data.cookies = this._tranformSimpleObject(data.cookies);
    }
    const hostRules = data['host-rules'];
    if (hostRules && hostRules.length) {
      data['host-rules'] = this._tranformSimpleObject(hostRules);
    }
    if (!data.loadToWorkspace) {
      data.kind = 'ARC#Import';
    }
    return Promise.resolve(data);
  }

  _updateItemTimings(item) {
    if (!item.updated || isNaN(item.updated)) {
      item.updated = Date.now();
    }
    if (!item.created) {
      item.created = item.updated;
    }
    return item;
  }

  // Replaces `_referenceId` with `_id`
  _transformProjects(projects) {
    return projects.map((project) => {
      if (project._referenceId) {
        project._id = project._referenceId;
        delete project._referenceId;
      } else if (project.key) {
        project._id = project.key;
        delete project.key;
      }
      project = this._updateItemTimings(project);
      delete project.kind;
      return project;
    });
  }

  _transformRequests(requests, projects) {
    projects = projects || [];
    return requests.map((request) => {
      if (request.key) {
        request._id = request.key;
        delete request.key;
      }
      const refId = request._referenceLegacyProject || request.legacyProject;
      // This is not the latest id structure but will avoid duplicates
      if (!request._id) {
        request._id = this.generateRequestId(request, refId);
      }
      if (refId) {
        delete request._referenceLegacyProject;
        const project = projects.find((item) => item._id === refId);
        if (project) {
          this.addProjectReference(request, project._id);
          this.addRequestReference(project, request._id);
        }
      }
      delete request.kind;
      request.name = request.name || 'unnamed';
      request.url = request.url || 'http://';
      request.method = request.method || 'GET';
      request.headers = request.headers || '';
      request.payload = request.payload || '';
      request = this._updateItemTimings(request);
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
