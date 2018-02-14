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
 * So, the problem is that I've made this code sometime ago
 * based on some Chrome version export and I have no idea what it is.
 * I will just keep it here as a legacy code but apparently it doesn't support
 * v1, v2 or v2.1
 *
 * Postman authors, what is this?
 * Reference data: test/postman/postam-data.json
 * @extends BaseTransformer
 */
class _PostmanV1Transformer extends PostmanTransformer {
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
    const project = this._readProjectInfo();
    const requests = this._readRequestsData();

    var result = {
      createdAt: new Date().toISOString(),
      version: 'postman-collection-v1',
      kind: 'ARC#Import',
      requests: requests,
      projects: [project]
    };
    return Promise.resolve(result);
  }
  /**
   * Creates the project model baqsed on Postman collections
   *
   * @return {Object} Arc project data model.
   */
  _readProjectInfo() {
    let time = Number(this._data.timestamp);
    if (time !== time) {
      time = Date.now();
    }
    const result = {
      _id: this._data.id,
      name: this._data.name,
      description: this._data.description,
      created: time,
      updated: time,
      order: 0
    };
    return result;
  }
  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @return {Array} List of ARC request objects.
   */
  _readRequestsData() {
    var result = [];
    if (!this._data.requests || !this._data.requests.length) {
      return result;
    }
    const requests = this._computeRequestsInOrder();
    result = requests.map((postmanRequest) => this._postmanRequestToArc(postmanRequest));
    return result;
  }
  /**
   * Creates ordered list of requests as defined in collection order property.
   * This creates a flat structure of requests and order assumes ARC's flat
   * structure.
   *
   * @return {Object} List of ordered Postman requests
   */
  _computeRequestsInOrder() {
    var ordered = [];
    if (this._data.order && this._data.order.length) {
      ordered = ordered.concat(this._data.order);
    }
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var folders = this._computeOrderedFolders(this._data.folders, this._data.folders_order);
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (folders) {
      folders.forEach((folder) => {
        if (folder.order && folder.order.length) {
          ordered = ordered.concat(folder.order);
        }
      });
    }
    var requests = this._data.requests;
    var result = ordered.map((id) => {
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
    var result = orderIds.map((id) => {
      return folders.find((folder) => folder.id === id);
    });
    result = result.filter((item) => !!item);
    return result;
  }
  /**
   * Transforms postman request to ARC request
   * @param {Object} item Postman request object
   * @return {Object} ARC request object
   */
  _postmanRequestToArc(item) {
    item.name = item.name || 'unnamed';
    item.url = item.url || 'http://';
    item.method = item.method || 'GET';
    var body = this.computeBodyOld(item);
    var headersModel = this.computeSimpleModel(item.headerData);
    var queryModel = this.computeSimpleModel(item.queryParams);
    var id = this.generateRequestId(item, this._data.id);
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
      projectOrder: 0,
      queryModel: queryModel,
      headersModel: headersModel
    };
    result.legacyProject = this._data.id;
    if (item.description) {
      result.description = item.description;
    }
    return result;
  }
}
if (isNode) {
  exports.PostmanV1Transformer = _PostmanV1Transformer;
} else {
  (window || self).PostmanV1Transformer = _PostmanV1Transformer;
}
