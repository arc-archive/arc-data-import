'use strict';
/* global ArcLegacyTransformer, ArcDexieTransformer, ArcPouchTransformer,
PostmanDataTransformer */
/*jshint -W098 */

class ArcDataImportLogic {
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
      case 'ARC#HistoryDataExport':
      case 'ARC#Project':
      case 'ARC#SessionCookies':
      case 'ARC#HostRules':
        return this._normalizeArcPouchSystem(data);
      case 'ARC#requestsDataExport':
        return this._normalizeArcDexieSystem(data);
      default:
        return this._normalizeArcLegacyData(data);
    }
  }

  // Normalizes export data from the GWT system.
  _normalizeArcLegacyData(data) {
    let transformer = new ArcLegacyTransformer(data);
    return transformer.transform();
  }
  // Normalizes export data from Dexie powered data store.
  _normalizeArcDexieSystem(data) {
    let transformer = new ArcDexieTransformer(data);
    return transformer.transform();
  }
  // Normalizes ARC's data exported in PouchDB system
  _normalizeArcPouchSystem(data) {
    let transformer = new ArcPouchTransformer(data);
    return transformer.transform();
  }
  // Normalizes Postman data into ARC's data model.
  _normalizePostmap(data) {
    let transformer = new PostmanDataTransformer();
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
   */
  _isObject(object) {
    return null !== object &&
      typeof object === 'object' &&
      Object.prototype.toString.call(object) === '[object Object]';
  }
  // Tests if data is a Postman data.
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
}
