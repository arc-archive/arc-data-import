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
 * Transforms environment export from postman to ARC variables.
 *
 * @extends BaseTransformer
 */
class _PostmanEnvTransformer extends PostmanTransformer {
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
    let result = {
      createdAt: new Date().toISOString(),
      version: 'postman-environment',
      kind: 'ARC#Import',
      variables: this._transformVariables(this._data.values, this._data.name)
    };
    return Promise.resolve(result);
  }
  /**
   * Transforms the list of variables in a environment to ARC variables.
   *
   * @param {Array<Object>} vars List of Postman's variables
   * @param {?String} envName Environment name. Default to `default`.
   * @return {Array<Object>} List of ARC variables.
   */
  _transformVariables(vars, envName) {
    if (!vars || !vars.length) {
      return [];
    }
    envName = envName || 'default';
    return vars.map((item) => {
      let result = {
        environment: envName,
        enabled: !!item.enabled,
        variable: item.key,
        value: this.ensureVariablesSyntax(item.value)
      };
      result._id = this._genId(result);
      return result;
    });
  }
  /**
   * Generates an _id to store the same data.
   * @param {Object} item ARC variable model
   * @return {String} Variable ID
   */
  _genId(item) {
    let result = 'postman-var-';
    result += encodeURIComponent(item.environment) + '/';
    result += encodeURIComponent(item.variable);
    return result;
  }
}
if (isNode) {
  exports.PostmanEnvTransformer = _PostmanEnvTransformer;
} else {
  (window || self).PostmanEnvTransformer = _PostmanEnvTransformer;
}
