'use strict';
/* global self */
var isNode = true;
if (typeof window !== 'undefined' || (typeof self !== 'undefined' && self.importScripts)) {
  isNode = false;
}
if (isNode) {
  var {PostmanTransformer} = require('./postman-transformer');
}
/**
 * Transformer for Postamn backup file.
 *
 * @extends BaseTransformer
 */
class _PostmanBackupTransformer extends PostmanTransformer {
  /**
   * @constructor
   * @param {Object} data Import data object
   */
  constructor(data) {
    super(data);
  }
  /**
   * Transforms `_data` into ARC data model.
   * @return {Promise} Promise resolved when data are transformed.
   */
  transform() {
    return this._readPostmanData(this._data);
  }

  _readPostmanData(data) {
    var collections = this._readRequestsData(data.collections);
    var result = {
      createdAt: new Date().toISOString(),
      version: 'postman-backup',
      kind: 'ARC#Import',
      requests: collections.requests,
      projects: collections.projects
    };
    if (data.headerPresets && data.headerPresets.length) {
      result['headers-sets'] = this._computeHeadersSets(data.headerPresets);
    }
    var variables = this._computeVariables(data);
    if (variables && variables.length) {
      result.variables = variables;
    }
    return Promise.resolve(result);
  }

  _readRequestsData(data) {
    var result = {
      projects: [],
      requests: []
    };
    if (!data || !data.length) {
      return result;
    }
    var parts = data.map((item, index) => this._readCollectionData(item, index));
    parts.forEach((data) => {
      result.projects.push(data.project);
      result.requests = result.requests.concat(data.requests);
    });
    return result;
  }

  _readCollectionData(collection, index) {
    var result = {
      project: {},
      requests: []
    };
    result.project._id = collection.id;
    result.project.name = collection.name;
    result.project.description = collection.description;
    result.project.order = index;
    result.project.created = collection.createdAt;
    result.project.updated = collection.updatedAt;
    var requests = this._computeRequestsOrder(collection);
    result.requests = requests.map((item, index) =>
      this._createRequestObject(item, collection.id, index));
    return result;
  }

  _computeRequestsOrder(collection) {
    var ordered = [];
    if (collection.order && collection.order.length) {
      ordered = ordered.concat(collection.order);
    }
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var folders = this._computeOrderedFolders(collection.folders, collection.folders_order);
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (folders) {
      folders.forEach((folder) => {
        if (folder.order && folder.order.length) {
          ordered = ordered.concat(folder.order);
        }
      });
    }
    var requests = collection.requests;
    var result = ordered.map((id) => {
      return requests.find((request) => request.id === id);
    });
    result = result.filter((item) => !!item);
    return result;
  }

  _computeOrderedFolders(folders, orderIds) {
    if (!folders || !folders.length) {
      return;
    }
    if (!orderIds || !orderIds.length) {
      return folders;
    }
    var result = orderIds.map((id) => {
      return folders.find((folder) => folder.id === id);
    });
    result = result.filter((item) => !!item);
    return result;
  }

  _createRequestObject(item, projectId, projectIndex) {
    item.name = item.name || 'unnamed';
    item.url = item.url || 'http://';
    item.method = item.method || 'GET';
    var body = this.computeBodyOld(item);
    var headersModel = this.computeSimpleModel(item.headerData);
    var queryModel = this.computeSimpleModel(item.queryParams);
    var id = this.generateRequestId(item, projectId);
    var created = Number(item.time);
    if (created !== created) {
      created = Date.now();
    }
    var result = {
      _id: id,
      created: created,
      updated: Date.now(),
      headers: item.headers || '',
      method: item.method,
      name: item.name,
      payload: body,
      type: 'saved',
      url: item.url,
      projectOrder: projectIndex,
      queryModel: queryModel,
      headersModel: headersModel
    };
    if (projectId) {
      result.legacyProject = projectId;
    }
    if (item.description) {
      result.description = item.description;
    }
    return result;
  }
  // Updates `created` and `updated` fileds of the object.
  _updateItemTimings(item, stamp) {
    if (!item.created) {
      if (stamp) {
        item.created = stamp;
      } else {
        item.created = Date.now();
      }
    }
    item.updated = Date.now();
    return item;
  }
  // Comnputes list of ARC's headers sets from Postam data.
  _computeHeadersSets(sets) {
    return sets.map((set) => this._computeSetObject(set));
  }
  /**
   * Computes headers set object from postman data.
   *
   * @param {Object} item Postman header set definition.
   * @return {Object} ARC's header set object
   */
  _computeSetObject(item) {
    item = this._updateItemTimings(item, item.timestamp);
    var value = '';
    item.headers.forEach((header) => {
      if (value) {
        value += '\n';
      }
      value += header.key + ': ' + header.value;
    });
    var result = {
      _id: this.uuid(),
      created: item.created,
      updated: item.updated,
      name: item.name || 'Unnamed set',
      headers: value
    };
    return result;
  }
  /**
   * Computes list of variables to import.
   *
   * @param {Object} data Postman import object
   * @return {Array|undefined} List of variables or undefined if no variables
   * found.
   */
  _computeVariables(data) {
    var result = [];
    if (data.globals && data.globals.length) {
      data.globals.forEach((item) => {
        let obj = this._computeVariableObject(item, 'default');
        result.push(obj);
      });
    }

    if (data.environments && data.environments.length) {
      data.environments.forEach((env) => {
        if (!env.values || !env.values.length) {
          return;
        }
        let name = env.name || 'Unnamed';
        env.values.forEach((item) => {
          let obj = this._computeVariableObject(item, name);
          result.push(obj);
        });
      });
    }
    return result.length ? result : undefined;
  }
  /**
   * Creates a variable object item.
   *
   * @param {Object} item Postman's variable definition.
   * @param {String} environment Environment name
   * @return {Object} ARC's variable definition.
   */
  _computeVariableObject(item, environment) {
    var result = {
      _id: this.uuid(),
      enabled: item.enabled || true,
      environment: environment,
      value: item.key,
      variable: item.value
    };
    return result;
  }
}
if (isNode) {
  exports.PostmanBackupTransformer = _PostmanBackupTransformer;
} else {
  (window || self).PostmanBackupTransformer = _PostmanBackupTransformer;
}
