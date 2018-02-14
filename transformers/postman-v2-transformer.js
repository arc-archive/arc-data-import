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
class _PostmanV2Transformer extends PostmanTransformer {
  /**
   * @constructor
   * @param {Object} data Import data object
   */
  constructor(data) {
    super(data);
    this.chounkSize = 200;
    this._currentItem = 0;
  }
  /**
   * Transforms `_data` into ARC data model.
   * @return {Promise} Promise resolved when data are transformed.
   */
  transform() {
    return this._readRequestsData()
    .then((requests) => {
      const project = this._readProjectInfo();
      let result = {
        createdAt: new Date().toISOString(),
        version: 'postman-collection-v2',
        kind: 'ARC#Import',
        requests: requests,
        projects: [project]
      };
      return result;
    });
  }
  /**
   * Creates the project model based on Postman collection
   *
   * @return {Object} Arc project data model.
   */
  _readProjectInfo() {
    let info = this._data.info;
    let time = Date.now();
    const result = {
      _id: info._postman_id,
      name: info.name,
      description: info.description,
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
   * @return {Promise} Promise resolved to list of ARC request objects.
   */
  _readRequestsData() {
    let data = this._data.item;
    if (!data || !data.length) {
      return Promise.resolve([]);
    }
    return this._extractRequestsV2(data);
  }
  /**
   * Extracts all requests in order from postman v2 collection.
   * It uses `deffer()` function every `chounkSize` iteration so function can
   * release event loop and not to freze browser.
   *
   * @param {Array<Object>} data List of Postamn V2 collection `item`.
   * (why it's called item and not items?)
   * @param {?Array<Object>} result Array where to append results.
   * @return {Promise} Promise resolved when all objects are computed.
   */
  _extractRequestsV2(data, result) {
    result = result || [];
    const item = data.shift();
    if (!item) {
      return Promise.resolve(result);
    }
    if (item.item) {
      // this is a folder
      return this._extractRequestsV2(item, result);
    }
    let arcRequest = this._computeArcRequest(item);
    result.push(arcRequest);
    if (this._currentItem === this.chounkSize) {
      return new Promise((resolve) => {
        this._currentItem = 0;
        this.deffer(resolve);
      })
      .then(() => this._extractRequestsV2(item, result));
    }
    this._currentItem++;
    return this._extractRequestsV2(item, result);
  }
  /**
   * Computes ARC request out of Postman v2 item.
   *
   * @param {Object} item Postamn v2 item.
   * @return {Object} ARC request object.
   */
  _computeArcRequest(item) {
    let request = item.request;
    let name = item.name || 'unnamed';
    let url = request.url.raw || 'http://';
    let method = request.method || 'GET';
    let headersModel = this.computeSimpleModel(request.header);
    let queryModel = this.computeSimpleModel(request.url.query);
    let time = Date.now();
    const result = {
      name: name,
      url: url,
      method: method,
      headersModel: headersModel,
      queryModel: queryModel,
      created: time,
      updated: time,
      type: 'saved',
      projectOrder: this._currentItem,
      legacyProject: this._data.info._postman_id,
      headers: this._computeHeaders(request.header)
    };
    result._id = this.generateRequestId(result, result.legacyProject);
    result.payload = this._computePayload(request.body, result);
    return result;
  }
  /**
   * Computes headers string from item's headers.
   *
   * @param {Array<Object>} headers Postman Request.header model.
   * @return {String} Computed value of headers.
   */
  _computeHeaders(headers) {
    let result = '';
    if (!headers || !headers.length) {
      return result;
    }
    result = headers.map((item) => item.key + ': ' + item.value).join('\n');
    return result;
  }
  /**
   * Computes body value for v2 request.body.
   *
   * @param {Object} body v2 request.body
   * @param {Object} item ARC request object.
   * @return {String} Body value as string.
   */
  _computePayload(body, item) {
    let def = body[body.mode];
    if (!def) {
      return;
    }
    switch (item.mode) {
      case 'raw': return body.raw;
      case 'formdata': return this._computeFormDataBody(def, item);
      case 'urlencoded': return this._computeUrlEncodedBody(def, item);
      default: return '';
    }
  }

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param {Array} items List of `formdata` models.
   * @param {Object} item ARC request object.
   * @return {String} Body value. Always empty string.
   */
  _computeFormDataBody(items, item) {
    if (!items || !items.length) {
      return '';
    }
    item.multipart = items.map((_item) => {
      let obj = {
        enabled: !_item.disabled,
        name: _item.key,
        isFile: _item.type === 'file',
        value: _item.type === 'file' ? '' : _item.value
      };
      return obj;
    });
    return '';
  }

  /**
   * Computes body as a URL encoded data model.
   *
   * @param {Array} items List of `urlencoded` models.
   * @param {Object} item ARC request object.
   * @return {String} Body value.
   */
  _computeUrlEncodedBody(items, item) {
    if (!items || !items.length) {
      return '';
    }
    let result = [];
    let model = [];
    items.forEach((item) => {
      let name = this._paramValue(item.key);
      let value = this._paramValue(item.value);
      model.push({
        name: name,
        value: value,
        enabled: !item.disabled
      });
      if (!item.disabled) {
        result.push(name + '=' + value);
      }
    });
    item.urlEncodedModel = model;
    return result.join('&');
  }
}
if (isNode) {
  exports.PostmanV2Transformer = _PostmanV2Transformer;
} else {
  (window || self).PostmanV2Transformer = _PostmanV2Transformer;
}
