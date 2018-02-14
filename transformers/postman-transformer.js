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
    this._postamVarRegex = /\{\{(.*?)\}\}/gim;
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
  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @param {String} match
   * @param {String} value
   * @return {String} Value to be replaced in the string.
   */
  variablesReplacerFunction(match, value) {
    switch (value) {
      case '$randomInt': value = 'random()'; break;
      case '$guid': value = 'uuid()'; break;
      case '$timestamp': value = 'now()'; break;
    }
    return '${' + value + '}';
  }
  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param {String} str A string value to check for variables.
   * @return {String} The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str) {
    if (!str || !str.indexOf) {
      return str;
    }
    // https://jsperf.com/regex-replace-with-test-conditions
    if (str.indexOf('{{') !== -1) {
      str = str.replace(this._postamVarRegex, this.variablesReplacerFunction);
    }
    return str;
  }

  ensureVarsRecursevily(obj) {
    if (obj instanceof Array) {
      for (let i = 0, len = obj.length; i < len; i++) {
        obj[i] = this.ensureVarsRecursevily(obj[i]);
      }
      return obj;
    }
    if (obj === Object(obj)) {
      Object.keys(obj).forEach((index) => {
        obj[index] = this.ensureVarsRecursevily(obj[index]);
      });
      return obj;
    }
    if (typeof obj === 'string') {
      return this.ensureVariablesSyntax(obj);
    }
    return obj;
  }
}
if (isNode) {
  exports.PostmanTransformer = _PostmanTransformer;
} else {
  (window || self).PostmanTransformer = _PostmanTransformer;
}
