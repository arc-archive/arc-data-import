import { PostmanBackupTransformer } from './postman-backup-transformer.js';
import { PostmanEnvTransformer } from './postman-env-transformer.js';
import { PostmanV1Transformer } from './postman-v1-transformer.js';
import { PostmanV2Transformer } from './postman-v2-transformer.js';

export class PostmanDataTransformer {
  transform(data) {
    const version = this.recognizeVersion(data);
    let instance;
    switch (version) {
      case 'backup':
        instance = new PostmanBackupTransformer(data);
        break;
      case 'environment':
        instance = new PostmanEnvTransformer(data);
        break;
      case 'collection':
        instance = new PostmanV1Transformer(data);
        break;
      case 'collection-v2':
        instance = new PostmanV2Transformer(data);
        break;
      default: return Promise.reject(new Error('Unsupported Postman version.'));
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
    if (data._postman_variable_scope && data._postman_variable_scope === 'environment') {
      return 'environment';
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
