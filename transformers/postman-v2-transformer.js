import { PostmanTransformer } from './postman-transformer.js';
/**
 * Transforms Postamn v2 collections to ARC import object.
 */
export class PostmanV2Transformer extends PostmanTransformer {
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
      const project = this._readProjectInfo(requests);
      const result = {
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
   * @param {Array<Object>} requests list of read requests
   * @return {Object} Arc project data model.
   */
  _readProjectInfo(requests) {
    const info = this._data.info;
    const time = Date.now();
    const result = {
      _id: info._postman_id,
      name: info.name,
      description: info.description,
      created: time,
      updated: time,
      order: 0
    };
    if (requests && requests.length) {
      result.requests = requests.map((item) => item._id);
    }
    return result;
  }
  /**
   * Iterates over collection requests array and transforms objects
   * to ARC requests.
   *
   * @return {Promise} Promise resolved to list of ARC request objects.
   */
  _readRequestsData() {
    const data = this._data.item;
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
      return this._extractRequestsV2(item.item, result)
      .then(() => this._extractRequestsV2(data, result));
    }
    const arcRequest = this._computeArcRequest(item);
    result.push(arcRequest);
    if (this._currentItem === this.chounkSize) {
      return new Promise((resolve) => {
        this._currentItem = 0;
        this.deffer(resolve);
      })
      .then(() => this._extractRequestsV2(data, result));
    }
    this._currentItem++;
    return this._extractRequestsV2(data, result);
  }
  /**
   * Computes ARC request out of Postman v2 item.
   *
   * @param {Object} item Postamn v2 item.
   * @return {Object} ARC request object.
   */
  _computeArcRequest(item) {
    const request = item.request;
    const name = item.name || 'unnamed';
    let url;
    if (typeof request.url === 'string') {
      url = request.url;
    } else if (request.url && request.url.raw) {
      url = request.url.raw;
    } else {
      url = 'http://';
    }
    url = this.ensureVariablesSyntax(url);
    let method = request.method || 'GET';
    method = this.ensureVariablesSyntax(method);
    const header = this.ensureVarsRecursevily(request.header);
    const time = Date.now();
    const result = {
      name: name,
      url: url,
      method: method,
      created: time,
      updated: time,
      type: 'saved',
      headers: this._computeHeaders(header)
    };
    const projectId = this._data.info._postman_id;
    result._id = this.generateRequestId(result, projectId);
    result.payload = this._computePayload(request.body, result);
    this.addProjectReference(result, projectId);
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
    const tmp = headers.filter((h) => !h.disabled);
    result = tmp.map((item) => item.key + ': ' + item.value).join('\n');
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
    const def = body[body.mode];
    if (!def) {
      return;
    }
    switch (body.mode) {
      case 'raw': return this.ensureVariablesSyntax(body.raw);
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
    items = this.ensureVarsRecursevily(items);
    item.multipart = items.map((_item) => {
      const obj = {
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
    const result = [];
    const model = [];
    items = this.ensureVarsRecursevily(items);
    items.forEach((item) => {
      const name = this._paramValue(item.key);
      const value = this._paramValue(item.value);
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
