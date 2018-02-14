'use strict';
/* global self */
var isNode = true;
if (typeof window !== 'undefined' || (typeof self !== 'undefined' && self.importScripts)) {
  isNode = false;
}
if (isNode) {
  var {PostmanBackupTransformer} = require('./postman-backup-transformer');
  var {PostmanV1Transformer} = require('./postman-v1-transformer');
  var {PostmanV2Transformer} = require('./postman-v2-transformer');
}
class _PostmanDataTransformer {
  transform(data) {
    let version = this.recognizeVersion(data);
    let instance;
    switch (version) {
      case 'backup':
        instance = new PostmanBackupTransformer(data);
        break;
      case 'collection':
        instance = new PostmanV1Transformer(data);
        break;
      case 'collection-v2':
        instance = new PostmanV2Transformer(data);
        break;
      default: return Promise.reject('Unsupported Postman version.');
    }
    return instance.transform();
  }

  recognizeVersion(data) {
    if (data.version) {
      return 'backup';
    }
    if (!data.info && data.name && data.folders) {
      return 'collection';
    }
    if (data.info.schema) {
      switch (data.info.schema) {
        case 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json':
          return 'collection-v2';
        case 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json':
          return 'collection-v2.1';
      }
    }
  }
}
if (isNode) {
  exports.PostmanDataTransformer = _PostmanDataTransformer;
} else {
  (window || self).PostmanDataTransformer = _PostmanDataTransformer;
}
