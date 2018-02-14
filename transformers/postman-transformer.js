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
 * Base class for all Postman transformers
 *
 * @extends BaseTransformer
 */
class _PostmanTransformer extends BaseTransformer {
  /**
   * @constructor
   * @param {Object} data Import data object
   */
  constructor(data) {
    super(data);
  }
  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param {Object} item Postam v1 model.
   * @return {String} Body value
   */
  computeBodyOld(item) {
    if (typeof item.data === 'string') {
      return item.data;
    }
    if (item.data instanceof Array && !item.data.length) {
      return '';
    }
    switch (item.dataMode) {
      case 'params': return this._computeFormDataBody(item);
      case 'urlencoded': return this._computeUrlEncodedBody(item);
      case 'binary': return '';
    }
  }
  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param {Object} item Postam v1 model.
   * @return {String} Body value. Always empty string.
   */
  _computeFormDataBody(item) {
    if (!item.data || !item.data.length) {
      return '';
    }
    let multipart = [];
    item.data.forEach((item) => {
      let obj = {
        enabled: item.enabled,
        name: item.key,
        isFile: item.type === 'file',
        value: item.type === 'file' ? '' : item.value
      };
      multipart.push(obj);
    });
    item.multipart = multipart;
    return '';
  }
  /**
   * Computes body as a URL encoded data model.
   *
   * @param {Object} item Postam v1 model.
   * @return {String} Body value.
   */
  _computeUrlEncodedBody(item) {
    if (!item.data || !item.data.length) {
      return '';
    }
    return item.data.map((item) => {
      let name = this._paramValue(item.name);
      let value = this._paramValue(item.value);
      return name + '=' + value;
    }).join('&');
  }

  /**
   * Parse input string as a payload param key or value.
   *
   * @param {String} input An input to parse.
   * @return {String} Trimmed string
   */
  _paramValue(input) {
    if (!input) {
      return String();
    }
    input = String(input);
    input = input.trim();
    return input;
  }
  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param {Array<Object>} array Postman params model.
   * @return {Array<Object>} ARC params model.
   */
  computeSimpleModel(array) {
    let result = [];
    if (!array || !array.length) {
      return result;
    }
    result = array.map((item) => {
      let enabled = typeof item.enabled === 'undefined' ? true : item.enabled;
      return {
        name: item.key,
        value: item.value,
        enabled: enabled
      };
    });
    return result;
  }
}
if (isNode) {
  exports.PostmanTransformer = _PostmanTransformer;
} else {
  (window || self).PostmanTransformer = _PostmanTransformer;
}
