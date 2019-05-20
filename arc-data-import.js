/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import './import-data-store.js';
import {ArcLegacyTransformer} from './transformers/arc-legacy-transformer.js';
import {ArcDexieTransformer} from './transformers/arc-dexie-transformer.js';
import {ArcPouchTransformer} from './transformers/arc-pouch-transformer.js';
import {PostmanDataTransformer} from './transformers/postman-data-transformer.js';
/**
 * An element that imports data into the ARC datastore.
 *
 * Supported data import types:
 *
 * -   legacy (the first one) ARC data system
 * -   legacy Dexie and HAR based data system
 * -   current ARC export object
 * -   Postman data export
 *
 * To import data it must be first normalized by calling `normalizeImportData`
 * function. It creates datastore objects that are resdy to be inserted into the
 * datastore.
 *
 * Objects that are missing IDs will be assigned a new ID. Because of that data
 * duplication may occur.
 * Request objects will generate the same ID unless the request is assigned to a
 * project and project has new ID generated.
 *
 * Conflicts are resolved by replacing existing data with new one.
 *
 * ### Example
 *
 * ```javascript
 * const importer = document.querySelector('arc-data-import');
 * const data = await getFileContent();
 * data = await importer.normalizeImportData();
 * const errors = await importer.storeData(data);
 * if (errors && errors.length) {
 *    console.log(errors);
 * }
 * ```
 *
 * ## Changes in version 2.x
 * - The component no longer includes PouchDB. Use your own version of the
 * library from Bower, npm, csd etc.
 *
 * @customElement
 * @polymer
 * @memberof LogicElements
 */
export class ArcDataImport extends PolymerElement {
  static get is() {
    return 'arc-data-import';
  }

  constructor() {
    super();
    this._normalizeHandler = this._normalizeHandler.bind(this);
    this._importHandler = this._importHandler.bind(this);
    // A handler for when a file is selected
    this._importFileHandler = this._importFileHandler.bind(this);
    // A case when JSON file is already parsed and is ready to be processed.
    this._importDataHandler = this._importDataHandler.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('import-normalize', this._normalizeHandler);
    window.addEventListener('import-data', this._importHandler);
    window.addEventListener('import-process-file', this._importFileHandler);
    window.addEventListener('import-process-data', this._importDataHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('import-normalize', this._normalizeHandler);
    window.removeEventListener('import-data', this._importHandler);
    window.removeEventListener('import-process-file', this._importFileHandler);
    window.removeEventListener('import-process-data', this._importDataHandler);
  }
  /**
   * Handler for the `import-normalize`cutom event.
   * It sets `result` property on the event's detail object which is the result
   * of calling `normalizeImportData` function call.
   *
   * The event is canceled so it's save to have more than one instance of this
   * element in the DOM.
   *
   * @param {CustomEvent} e
   */
  _normalizeHandler(e) {
    if (!e.detail || e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const data = e.detail.content;
    if (!data) {
      e.detail.result = Promise.reject(new Error('Content property not set'));
      return;
    }
    e.detail.result = this.normalizeImportData(data);
  }
  /**
   * Handler for the `import-data` cutom event.
   * It sets `result` property on the event's detail object which is a result
   * of calling `storeData` function.
   *
   * The event is canceled so it's save to have more than one instance of this
   * element in the DOM.
   *
   * @param {CustomEvent} e
   */
  _importHandler(e) {
    if (!e.detail || e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const data = e.detail.content;
    if (!data) {
      e.detail.result = Promise.reject(new Error('The "content" property not set'));
      return;
    }
    e.detail.result = this.storeData(data);
  }
  /**
   * Handles file import event dispatched by the UI.
   * @param {CustomEvent} e
   */
  _importFileHandler(e) {
    if (!e.detail || e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const data = e.detail.file;
    if (!data) {
      e.detail.result = Promise.reject(new Error('The "file" property not set'));
      return;
    }
    e.detail.result = this._processFileData(data, {
      driveId: e.detail.driveId
    });
  }

  _importDataHandler(e) {
    if (!e.detail || e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const {data} = e.detail;
    if (!data) {
      e.detail.result = Promise.reject(new Error('The "data" property not set'));
      return;
    }
    e.detail.result = this.normalizeImportData(data)
    .then((data) => {
      return this._handleNormalizedFileData(data);
    });
  }

  get _dataStore() {
    if (!this.__dataStoreElement) {
      this.__dataStoreElement = document.createElement('import-data-store');
    }
    return this.__dataStoreElement;
  }
  /**
   * Stores import data in the datastore.
   * It must be normalized by `normalizeImportData` first or it returns an
   * error.
   *
   * @param {Obejct} importObject ARC import data
   * @return {Promise} Resolved promise to list of errors or `undefined`
   * if error were not reported.
   */
  storeData(importObject) {
    if (!importObject) {
      return Promise.reject(new Error('Missing required argument.'));
    }
    if (!importObject.kind || importObject.kind !== 'ARC#Import') {
      return Promise.reject(new Error('Data not normalized for import.'));
    }
    const store = this._dataStore;
    return store.importData(importObject)
    .then((result) => {
      const savedIndexes = store.savedIndexes;
      const historyIndexes = store.historyIndexes;
      setTimeout(() => {
        this._notifyIndexer(savedIndexes, historyIndexes);
        this._notifyDataImported();
      }, 100);
      return result;
    });
  }

  _notifyDataImported() {
    this.dispatchEvent(new CustomEvent('data-imported', {
      bubbles: true,
      composed: true
    }));
  }
  /**
   * Dispatches `url-index-update` event handled by `arc-models/url-indexer`.
   * It will index URL data for search function.
   * @param {?Array<Object>} saved List of saved requests indexes
   * @param {?Array<Object>} history List of history requests indexes
   */
  _notifyIndexer(saved, history) {
    let indexes = [];
    if (saved) {
      indexes = indexes.concat(saved);
    }
    if (history) {
      indexes = indexes.concat(history);
    }
    if (!indexes.length) {
      return;
    }
    this.dispatchEvent(new CustomEvent('url-index-update', {
      bubbles: true,
      composed: true,
      detail: {
        data: indexes
      }
    }));
  }
  /**
   * Transforms any previous ARC export file to current export object.
   *
   * @param {String|Object} data Data from the import file.
   * @return {Promise} Normalized data import object.
   */
  normalizeImportData(data) {
    try {
      data = this._prepareImportObject(data);
    } catch (e) {
      return Promise.reject(new Error('File not recognized. Not a JSON.'));
    }
    if (this._isPostman(data)) {
      return this._normalizePostmap(data);
    }
    if (this._isArcFile(data)) {
      return this._normalizeArc(data);
    }
    return Promise.reject(new Error('File not recognized'));
  }

  /**
   * Parses file data with JSON parser and throws an error if not a JSON.
   * If the passed `data` is JS object it does nothing.
   *
   * @param {String|Object} data File content
   * @return {Object} Parsed data.
   */
  _prepareImportObject(data) {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        throw new Error('Unable to read the file. Not a JSON: ' + e.message);
      }
    }
    return data;
  }

  /**
   * Normalizes any previous and current ARC file expot data to common model.
   *
   * @param {Object} data Imported data.
   * @return {Promise} A promise resolved to ARC data export object.
   */
  _normalizeArc(data) {
    switch (data.kind) {
      case 'ARC#SavedHistoryDataExport':
      case 'ARC#AllDataExport':
      case 'ARC#SavedDataExport':
      case 'ARC#SavedExport':
      case 'ARC#HistoryDataExport':
      case 'ARC#HistoryExport':
      case 'ARC#Project':
      case 'ARC#SessionCookies':
      case 'ARC#HostRules':
      case 'ARC#ProjectExport':
        return this._normalizeArcPouchSystem(data);
      case 'ARC#requestsDataExport':
        return this._normalizeArcDexieSystem(data);
      default:
        return this._normalizeArcLegacyData(data);
    }
  }
  /**
   * Normalizes export data from the GWT system.
   * @param {Object} data Parsed data
   * @return {Object} Normalized import object
   */
  _normalizeArcLegacyData(data) {
    const transformer = new ArcLegacyTransformer(data);
    return transformer.transform();
  }
  /**
   * Normalizes export data from Dexie powered data store.
   * @param {Object} data Parsed data
   * @return {Object} Normalized import object
   */
  _normalizeArcDexieSystem(data) {
    const transformer = new ArcDexieTransformer(data);
    return transformer.transform();
  }
  /**
   * Normalizes ARC's data exported in PouchDB system
   * @param {Object} data Parsed data
   * @return {Object} Normalized import object
   */
  _normalizeArcPouchSystem(data) {
    const transformer = new ArcPouchTransformer(data);
    return transformer.transform();
  }
  /**
   * Normalizes Postman data into ARC's data model.
   * @param {Object} data Parsed data
   * @return {Object} Normalized import object
   */
  _normalizePostmap(data) {
    const transformer = new PostmanDataTransformer();
    return transformer.transform(data);
  }
  /**
   * Checks if passed `object` is the ARC export data.
   *
   * @param {Object} object A parsed JSON data.
   * @return {Boolean} true if the passed object is an ARC file.
   */
  _isArcFile(object) {
    if (!object || !this._isObject(object)) {
      return false;
    }
    if (object.kind) {
      if (object.kind.indexOf('ARC#') === 0) {
        return true;
      }
    }
    // Old export system does not have kind property.
    // Have to check if it has required properties.
    const arcEntries = ['projects', 'requests', 'history', 'url-history',
      'websocket-url-history', 'variables', 'headers-sets', 'auth-data',
      'cookies'
    ];
    for (let i = 0, len = arcEntries.length; i < len; i++) {
      if (arcEntries[i] in object) {
        return true;
      }
    }
    if (this._isOldImport(object)) {
      return true;
    }
    return false;
  }
  /**
   * First export / import system had single request data only. This function checks if given
   * file is from this ancient system.
   *
   * @param {Object} object Decoded JSON data.
   * @return {Boolean}
   */
  _isOldImport(object) {
    if (!(object.projects || object.requests || object.history)) {
      if ('headers' in object && 'url' in object && 'method' in object) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks if the passed argument is an Object.
   *
   * @param {any} object A value to test.
   * @return {Boolean}
   */
  _isObject(object) {
    return null !== object &&
      typeof object === 'object' &&
      Object.prototype.toString.call(object) === '[object Object]';
  }
  /**
   * Tests if data is a Postman file data
   * @param {Object} data Parsed file.
   * @return {Boolean}
   */
  _isPostman(data) {
    if (data.version && data.collections) {
      return true;
    }
    if (data.info && data.info.schema) {
      return true;
    }
    if (data.folders && data.requests) {
      return true;
    }
    if (data._postman_variable_scope) {
      return 'environment';
    }
    return false;
  }
  /**
   * Processes import file data.
   * It tests if the file is API data or ARC/Postan dump.
   * If it is an API definition (zip file or actuall API file) then it
   * dispatches `api-process-file` custom event. Otherwise it tries to import
   * file data.
   *
   * @param {File} file User file
   * @param {?Object} opts Additional options. `driveId` is only supported.
   * @return {Promise}
   */
  _processFileData(file, opts) {
    const apiTypes = [
      'application/zip', 'application/yaml', 'application/x-yaml',
      'application/raml', 'application/x-raml', 'application/x-zip-compressed'
    ];
    if (apiTypes.indexOf(file.type) !== -1) {
      return this._notifyApiParser(file);
    }
    // RAML files
    if (file.name && (file.name.indexOf('.raml') !== -1 ||
      file.name.indexOf('.yaml') !== -1 ||
      file.name.indexOf('.zip') !== -1)) {
      return this._notifyApiParser(file);
    }
    const id = Date.now();
    this._fire('process-loading-start', {
      message: 'Procerssing file data',
      id
    });
    let p;
    if (file instanceof Uint8Array) {
      p = Promise.resolve(file.toString());
    } else {
      p = this._readFile(file);
    }
    return p.then((content) => {
      content = content.trim();
      if (content[0] === '#' && content.indexOf('#%RAML') === 0) {
        return this._notifyApiParser(file);
      }
      let data;
      try {
        data = JSON.parse(content);
      } catch (_) {
        this._fire('process-loading-stop', {
          id
        });
        throw new Error('Unknown file format');
      }
      if (data.swagger) {
        this._fire('process-loading-stop', {
          id
        });
        return this._notifyApiParser(file);
      }
      return this.normalizeImportData(data)
      .then((data) => {
        this._fire('process-loading-stop', {
          id
        });
        return this._handleNormalizedFileData(data, opts);
      });
    });
  }
  /**
   * Processes normalized file import data.
   * When it is a single request object it dispatches `request-workspace-append`
   * event to apped request to the workspace. Otherwise it dispatches
   * `import-data-inspect` custom event.
   * @param {Object} data Normalized data
   * @param {?Object} opts Additional options. `driveId` is only supported.
   */
  _handleNormalizedFileData(data, opts) {
    if (!data) {
      throw new Error('File has no import data');
    }
    if (this._isSingleRequest(data)) {
      const obj = data.requests[0];
      if (opts && opts.driveId) {
        obj.driveId = opts.driveId;
      }
      delete obj.kind;
      obj._id = obj.key;
      delete obj.key;
      this._fire('request-workspace-append', {
        kind: 'ARC#Request',
        request: obj
      });
    } else if (data.loadToWorkspace) {
      this._fire('request-workspace-append', data);
    } else {
      this._fire('import-data-inspect', {
        data
      });
    }
  }
  /**
   * Reads file content as string
   * @param {File} file A file object
   * @return {Promise<String>} A promise resolved to file content
   */
  _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('File read error'));
      };
      reader.readAsText(file);
    });
  }
  /**
   * Dispatches `api-process-file` to parse API data usingseparate module.
   * In ARC electron it is `@advanced-rest-client/electron-amf-service`
   * node module. In other it might be other component.
   * @param {File} file User file.
   * @return {Promise}
   */
  _notifyApiParser(file) {
    const e = this._fire('api-process-file', {
      file
    });
    if (!e.defaultPrevented) {
      return Promise.reject(new Error('API processor not available'));
    }
    return e.detail.result
    .then((api) => {
      this._fire('api-data-ready', {
        model: api.model,
        type: api.type
      });
    });
  }
  /**
   * Dispatches custom event and returns it.
   * @param {String} type Event type
   * @param {Object} detail Event detail object
   * @return {CustomEvent}
   */
  _fire(type, detail) {
    const e = new CustomEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * User can export single request in ARC. In this case ARC opens new tab
   * rather actualy imports the data. This function tests if this is the case.
   * @param {Object} data Normalized import data
   * @return {Boolean}
   */
  _isSingleRequest(data) {
    if (!data.requests || !data.requests.length) {
      return false;
    }
    if (data.requests.length !== 1) {
      return false;
    }
    if (data.projects && data.projects.length === 0) {
      delete data.projects;
    }
    if (data.history && data.history.length === 0) {
      delete data.history;
    }
    if (Object.keys(data).length === 4) {
      return true;
    }
    return false;
  }
}
window.customElements.define(ArcDataImport.is, ArcDataImport);
