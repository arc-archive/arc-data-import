import { PostmanTransformer } from './postman-transformer.js';
/**
 * Transformer for Postamn backup file.
 */
export class PostmanBackupTransformer extends PostmanTransformer {
  /**
   * Transforms `_data` into ARC data model.
   * @return {Promise} Promise resolved when data are transformed.
   */
  transform() {
    const data = this._data;
    const collections = this._readRequestsData(data.collections);
    const result = {
      createdAt: new Date().toISOString(),
      version: 'postman-backup',
      kind: 'ARC#Import',
      requests: collections.requests,
      projects: collections.projects
    };
    if (data.headerPresets && data.headerPresets.length) {
      result['headers-sets'] = this._computeHeadersSets(data.headerPresets);
    }
    const variables = this._computeVariables(data);
    if (variables && variables.length) {
      result.variables = variables;
    }
    return Promise.resolve(result);
  }
  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @param {Array<Object>} data
   * @return {Array} List of ARC request objects.
   */
  _readRequestsData(data) {
    const result = {
      projects: [],
      requests: []
    };
    if (!data || !data.length) {
      return result;
    }
    const parts = data.map((item, index) =>
      this._readCollectionData(item, index));
    parts.forEach((data) => {
      result.projects.push(data.project);
      result.requests = result.requests.concat(data.requests);
    });
    return result;
  }
  /**
   * Reads collections data.
   *
   * @param {Object} collection
   * @param {Number} index
   * @return {Object} Map of projects and requests.
   */
  _readCollectionData(collection, index) {
    const result = {
      project: {},
      requests: []
    };
    result.project._id = collection.id;
    result.project.name = collection.name;
    result.project.description = collection.description;
    result.project.order = index;
    result.project.created = collection.createdAt;
    result.project.updated = collection.updatedAt;
    const requests = this._computeRequestsOrder(collection);
    result.requests = requests.map((item, index) =>
      this._createRequestObject(item, result.project, index));
    return result;
  }
  /**
   * Creates ordered list of requests as defined in collection order property.
   * This creates a flat structure of requests and order assumes ARC's flat
   * structure.
   *
   * @param {Object} collection
   * @return {Object} List of ordered Postman requests
   */
  _computeRequestsOrder(collection) {
    let ordered = [];
    if (collection.order && collection.order.length) {
      ordered = ordered.concat(collection.order);
    }
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    const folders = this._computeOrderedFolders(collection.folders,
      collection.folders_order);
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (folders) {
      folders.forEach((folder) => {
        if (folder.order && folder.order.length) {
          ordered = ordered.concat(folder.order);
        }
      });
    }
    const requests = collection.requests;
    let result = ordered.map((id) => {
      return requests.find((request) => request.id === id);
    });
    result = result.filter((item) => !!item);
    return result;
  }
  /**
   * Computes list of folders including sub-folders .
   *
   * @param {Array<Object>} folders Collection folders definition
   * @param {Array<String>} orderIds Collection order info array
   * @return {Array<Object>} Ordered list of folders.
   */
  _computeOrderedFolders(folders, orderIds) {
    if (!folders || !folders.length) {
      return;
    }
    if (!orderIds || !orderIds.length) {
      return folders;
    }
    let result = orderIds.map((id) => {
      return folders.find((folder) => folder.id === id);
    });
    result = result.filter((item) => !!item);
    return result;
  }
  /**
   * Transforms postman request to ARC request
   * @param {Object} item Postman request object
   * @param {Object} project Project object
   * @param {Number} projectIndex Order index of the request in the project
   * @return {Object} ARC request object
   */
  _createRequestObject(item, project, projectIndex) {
    item.name = item.name || 'unnamed';
    let url = item.url || 'http://';
    url = this.ensureVariablesSyntax(url);
    let method = item.method || 'GET';
    method = this.ensureVariablesSyntax(method);
    let headers = item.headers || '';
    headers = this.ensureVariablesSyntax(headers);
    const body = this.computeBodyOld(item);
    const id = this.generateRequestId(item, project && project._id);
    let created = Number(item.time);
    if (created !== created) {
      created = Date.now();
    }
    const result = {
      _id: id,
      created: created,
      updated: Date.now(),
      headers: headers,
      method: method,
      name: item.name,
      payload: body,
      type: 'saved',
      url: url
    };
    if (project) {
      this.addProjectReference(result, project._id);
      this.addRequestReference(project, id);
    }
    if (item.description) {
      result.description = item.description;
    }
    if (item.multipart) {
      result.multipart = item.multipart;
    }
    return result;
  }
  /**
   * Updates `created` and `updated` fileds of the object.
   *
   * @param {Object} item Request object
   * @param {Number} stamp Timestamp
   * @return {Object} Request object
   */
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
  /**
   * Comnputes list of ARC's headers sets from Postam data.
   *
   * @param {Array} sets
   * @return {Array}
   */
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
    let value = '';
    item.headers.forEach((header) => {
      if (value) {
        value += '\n';
      }
      value += header.key + ': ' + header.value;
    });
    const result = {
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
    const result = [];
    if (data.globals && data.globals.length) {
      data.globals.forEach((item) => {
        const obj = this._computeVariableObject(item, 'default');
        result.push(obj);
      });
    }

    if (data.environments && data.environments.length) {
      data.environments.forEach((env) => {
        if (!env.values || !env.values.length) {
          return;
        }
        const name = env.name || 'Unnamed';
        env.values.forEach((item) => {
          const obj = this._computeVariableObject(item, name);
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
    const result = {
      _id: this.uuid(),
      enabled: item.enabled || true,
      environment: environment,
      value: this.ensureVariablesSyntax(item.value),
      variable: item.key
    };
    return result;
  }
}
