import { PostmanTransformer } from './postman-transformer.js';
/**
 * Transforms Postamn v1 collections to ARC import object.
 */
export class PostmanV1Transformer extends PostmanTransformer {
  /**
   * Transforms `_data` into ARC data model.
   * @return {Promise} Promise resolved when data are transformed.
   */
  transform() {
    const project = this._readProjectInfo();
    const requests = this._readRequestsData(project);

    const result = {
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
   * @param {Object} project Project object
   * @return {Array} List of ARC request objects.
   */
  _readRequestsData(project) {
    let result = [];
    if (!this._data.requests || !this._data.requests.length) {
      return result;
    }
    const requests = this._computeRequestsInOrder();
    result = requests.map((postmanRequest) =>
      this._postmanRequestToArc(postmanRequest, project));
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
    let ordered = [];
    if (this._data.order && this._data.order.length) {
      ordered = ordered.concat(this._data.order);
    }
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    const folders = this._computeOrderedFolders(this._data.folders,
      this._data.folders_order);
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (folders) {
      folders.forEach((folder) => {
        if (folder.order && folder.order.length) {
          ordered = ordered.concat(folder.order);
        }
      });
    }
    const requests = this._data.requests;
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
    const result = [];
    for (let i = 0, iLen = orderIds.length; i < iLen; i++) {
      const id = orderIds[i];
      for (let j = 0, jLen = folders.length; j < jLen; j++) {
        if (folders[j].id === id) {
          result[result.length] = folders[j];
        }
      }
    }
    return result;
  }
  /**
   * Transforms postman request to ARC request
   * @param {Object} item Postman request object
   * @param {Object} project Project object
   * @return {Object} ARC request object
   */
  _postmanRequestToArc(item, project) {
    item.name = item.name || 'unnamed';
    let url = item.url || 'http://';
    url = this.ensureVariablesSyntax(url);
    let method = item.method || 'GET';
    method = this.ensureVariablesSyntax(method);
    let headers = item.headers || '';
    headers = this.ensureVariablesSyntax(headers);
    const body = this.computeBodyOld(item);
    const id = this.generateRequestId(item, this._data.id);
    let created = Number(item.time);
    if (created !== created) {
      created = Date.now();
    }
    const result = {
      _id: id,
      created: created,
      updated: Date.now(),
      headers: headers || '',
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
}
