import { assert, fixture } from '@open-wc/testing';
import '../arc-data-import.js';
import { DataHelper } from './data-helper.js';
import { spy as sinonSpy } from 'sinon/pkg/sinon-esm.js';

suite('<arc-data-import>', function() {
  async function basicFixture() {
    return await fixture(`<arc-data-import></arc-data-import>`);
  }

  suite('Basics', function() {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('_dataStore is an element', function() {
      const transformer = element._dataStore;
      assert.ok(transformer);
      assert.equal(transformer.nodeName.toLowerCase(), 'import-data-store');
      assert.isFalse(transformer instanceof HTMLUnknownElement);
    });
  });

  suite('_notifyDataImported()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Dispatches the event', () => {
      const spy = sinonSpy();
      element.addEventListener('data-imported', spy);
      element._notifyDataImported();
      assert.isTrue(spy.called);
    });

    test('Event bubbles', () => {
      const spy = sinonSpy();
      element.addEventListener('data-imported', spy);
      element._notifyDataImported();
      assert.isTrue(spy.args[0][0].bubbles);
    });
  });

  suite('_notifyIndexer()', () => {
    let element;
    let saved;
    let history;
    setup(async function() {
      element = await basicFixture();
      saved = [{ id: 1, type: 'saved', url: 'https://domain.com' }];
      history = [{ id: 2, type: 'history', url: 'https://api.com' }];
    });

    test('Dispatches the event', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer(saved, history);
      assert.isTrue(spy.called);
    });

    test('Event bubbles', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer(saved, history);
      assert.isTrue(spy.args[0][0].bubbles);
    });

    test('Event has indexes', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer(saved, history);
      const data = spy.args[0][0].detail.data;
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 2);
    });

    test('Passes "saved" indexes only', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer(saved);
      const data = spy.args[0][0].detail.data;
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 1);
    });

    test('Passes "history" indexes only', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer(undefined, history);
      const data = spy.args[0][0].detail.data;
      assert.typeOf(data, 'array');
      assert.lengthOf(data, 1);
    });

    test('Event is not dispatched when no indexes', () => {
      const spy = sinonSpy();
      element.addEventListener('url-index-update', spy);
      element._notifyIndexer();
      assert.isFalse(spy.called);
    });
  });

  suite('_normalizeHandler()', function() {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Does nothing when no detail object', () => {
      const e = new CustomEvent('test', { cancelable: true });
      element._normalizeHandler(e);
      assert.equal(e.detail, null);
    });

    test('Does nothing event is canelled', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      e.preventDefault();
      const spy = sinonSpy(element, 'normalizeImportData');
      element._normalizeHandler(e);
      assert.isFalse(spy.called);
    });

    test('Cancels the event', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._normalizeHandler(e);
      e.detail.result.catch(() => {});
      assert.isTrue(e.defaultPrevented);
    });

    test('Rejects result when no data', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._normalizeHandler(e);
      assert.typeOf(e.detail.result.then, 'function');
      return e.detail.result
      .then(() => {
        throw new Error('Should reject');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'Content property not set');
      });
    });

    test('Calls normalizeImportData()', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: { content: {} } });
      const spy = sinonSpy(element, 'normalizeImportData');
      element._normalizeHandler(e);
      return e.detail.result
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
      });
    });
  });

  suite('_importHandler()', function() {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Does nothing when no detail object', () => {
      const e = new CustomEvent('test', { cancelable: true });
      element._importHandler(e);
      assert.equal(e.detail, null);
    });

    test('Does nothing event is canelled', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      e.preventDefault();
      const spy = sinonSpy(element, 'storeData');
      element._importHandler(e);
      assert.isFalse(spy.called);
    });

    test('Cancels the event', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importHandler(e);
      e.detail.result.catch(() => {});
      assert.isTrue(e.defaultPrevented);
    });

    test('Rejects result when no data', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importHandler(e);
      assert.typeOf(e.detail.result.then, 'function');
      return e.detail.result
      .then(() => {
        throw new Error('Should reject');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'The "content" property not set');
      });
    });

    test('Calls storeData()', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: { content: {} } });
      const spy = sinonSpy(element, 'storeData');
      element._importHandler(e);
      return e.detail.result
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
      });
    });
  });

  suite('_importFileHandler()', function() {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Does nothing when no detail object', () => {
      const e = new CustomEvent('test', { cancelable: true });
      element._importFileHandler(e);
      assert.equal(e.detail, null);
    });

    test('Does nothing event is canelled', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      e.preventDefault();
      const spy = sinonSpy(element, '_processFileData');
      element._importFileHandler(e);
      assert.isFalse(spy.called);
    });

    test('Cancels the event', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importFileHandler(e);
      e.detail.result.catch(() => {});
      assert.isTrue(e.defaultPrevented);
    });

    test('Rejects result when no file', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importFileHandler(e);
      assert.typeOf(e.detail.result.then, 'function');
      return e.detail.result
      .then(() => {
        throw new Error('Should reject');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.notEqual(cause.message, 'Should reject');
      });
    });

    test('Calls _processFileData()', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: { file: new Blob(['test']) } });
      const spy = sinonSpy(element, '_processFileData');
      element._importFileHandler(e);
      return e.detail.result
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
        assert.typeOf(spy.args[0][0], 'blob');
      });
    });

    test('Adds driveId when set', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {
        file: new Blob(['test']),
        driveId: 'test-id'
      } });
      const spy = sinonSpy(element, '_processFileData');
      element._importFileHandler(e);
      return e.detail.result
      .catch(() => {})
      .then(() => {
        assert.deepEqual(spy.args[0][1], { driveId: 'test-id' });
      });
    });
  });

  suite('_importDataHandler()', function() {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Does nothing when no detail object', () => {
      const e = new CustomEvent('test', { cancelable: true });
      element._importDataHandler(e);
      assert.equal(e.detail, null);
    });

    test('Does nothing event is canelled', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      e.preventDefault();
      const spy = sinonSpy(element, 'normalizeImportData');
      element._importDataHandler(e);
      assert.isFalse(spy.called);
    });

    test('Cancels the event', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importDataHandler(e);
      e.detail.result.catch(() => {});
      assert.isTrue(e.defaultPrevented);
    });

    test('Rejects result when no data', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: {} });
      element._importDataHandler(e);
      assert.typeOf(e.detail.result.then, 'function');
      return e.detail.result
      .then(() => {
        throw new Error('Should reject');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'The "data" property not set');
      });
    });

    test('Calls normalizeImportData()', () => {
      const e = new CustomEvent('test', { cancelable: true, detail: { data: {} } });
      const spy = sinonSpy(element, 'normalizeImportData');
      element._importDataHandler(e);
      return e.detail.result
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
      });
    });
  });

  suite('_processFileData()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    function apiParserHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.resolve({ api: true });
    }

    function apiParserErrorHandler(e) {
      e.preventDefault();
      e.detail.result = Promise.reject(new Error('test-error'));
    }

    teardown(() => {
      window.removeEventListener('api-process-file', apiParserHandler);
      window.removeEventListener('api-process-file', apiParserErrorHandler);
    });

    [
      'application/zip', 'application/yaml', 'application/x-yaml',
      'application/raml', 'application/x-raml', 'application/x-zip-compressed'
    ].forEach((type) => {
      test('Calls _notifyApiParser() for file type ' + type, () => {
        const file = { type };
        window.addEventListener('api-process-file', apiParserHandler);
        const spy = sinonSpy(element, '_notifyApiParser');
        element._processFileData(file);
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], file);
      });
    });

    [
      'api.raml', 'api.yaml', 'project.zip'
    ].forEach((name) => {
      test('Calls _notifyApiParser() for file with extension ' + name, () => {
        const file = { type: '', name };
        window.addEventListener('api-process-file', apiParserHandler);
        const spy = sinonSpy(element, '_notifyApiParser');
        element._processFileData(file);
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], file);
      });
    });

    test('Returns a promise', () => {
      const file = DataHelper.generateArcImportFile();
      const result = element._processFileData(file);
      assert.typeOf(result.then, 'function');
      return result;
    });

    test('Dispatches process-loading-start event', () => {
      const file = DataHelper.generateArcImportFile();
      const spy = sinonSpy();
      element.addEventListener('process-loading-start', spy);
      const result = element._processFileData(file);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.message, 'Procerssing file data');
      return result;
    });

    test('Calls _readFile() on file data', () => {
      const file = DataHelper.generateArcImportFile();
      const spy = sinonSpy(element, '_readFile');
      const result = element._processFileData(file);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].name, 'arc-export.json');
      return result;
    });

    test('Calls toString() on Electron buffer', () => {
      const file = DataHelper.generateElectronBuffer();
      const spy = sinonSpy(file, 'toString');
      const result = element._processFileData(file);
      assert.isTrue(spy.called);
      return result;
    });

    test('Calls _notifyApiParser() for unknown file with RAML spec', () => {
      const file = DataHelper.generateRamlUnknownFile();
      window.addEventListener('api-process-file', apiParserHandler);
      const spy = sinonSpy(element, '_notifyApiParser');
      return element._processFileData(file)
      .then(() => {
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0].size, file.size);
      });
    });

    test('Calls _notifyApiParser() for unknown file with OAS 2 JSON spec', () => {
      const file = DataHelper.generateOas2JsonUnknownFile();
      window.addEventListener('api-process-file', apiParserHandler);
      const spy = sinonSpy(element, '_notifyApiParser');
      return element._processFileData(file)
      .then(() => {
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0].size, file.size);
      });
    });

    test('Rejects when JSON file is not valid', () => {
      const file = DataHelper.generateJsonErrorFile();
      return element._processFileData(file)
      .then(() => {
        throw new Error('Should not resolve.');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'Unknown file format');
      });
    });

    test('Rejects when api processor not in the DOM', () => {
      const file = DataHelper.generateRamlUnknownFile();
      return element._processFileData(file)
      .then(() => {
        throw new Error('Should not resolve.');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'API processor not available');
      });
    });

    test('Rejects when api processor error', () => {
      window.addEventListener('api-process-file', apiParserErrorHandler);
      const file = DataHelper.generateRamlUnknownFile();
      return element._processFileData(file)
      .then(() => {
        throw new Error('Should not resolve.');
      })
      .catch((cause) => {
        assert.typeOf(cause.message, 'string');
        assert.equal(cause.message, 'test-error');
      });
    });

    test('Dispatches process-loading-stop event on error', () => {
      let id;
      element.addEventListener('process-loading-start', function f(e) {
        element.removeEventListener('process-loading-start', f);
        id = e.detail.id;
      });
      const spy = sinonSpy();
      element.addEventListener('process-loading-stop', spy);
      window.addEventListener('api-process-file', apiParserHandler);
      const file = DataHelper.generateOas2JsonUnknownFile();
      return element._processFileData(file)
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0].detail.id, id);
      });
    });

    test('Calls normalizeImportData()', () => {
      const file = DataHelper.generateArcImportFile();
      const spy = sinonSpy(element, 'normalizeImportData');
      return element._processFileData(file)
      .then(() => {
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], {
          createdAt: '2019-02-02T21:58:25.467Z',
          kind: 'ARC#Import',
          requests: [],
          version: '13.0.0-alpha.3'
        });
      });
    });

    test('Dispatches process-loading-stop event when ready', () => {
      let id;
      element.addEventListener('process-loading-start', function f(e) {
        element.removeEventListener('process-loading-start', f);
        id = e.detail.id;
      });
      const spy = sinonSpy();
      element.addEventListener('process-loading-stop', spy);
      const file = DataHelper.generateArcImportFile();
      return element._processFileData(file)
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
        assert.equal(spy.args[0][0].detail.id, id);
      });
    });

    test('Calls _handleNormalizedFileData() with processed data', () => {
      const spy = sinonSpy(element, '_handleNormalizedFileData');
      const file = DataHelper.generateArcImportFile();
      return element._processFileData(file)
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][0], {
          createdAt: '2019-02-02T21:58:25.467Z',
          kind: 'ARC#Import',
          requests: [],
          version: '13.0.0-alpha.3'
        });
      });
    });

    test('Passes options to _handleNormalizedFileData()', () => {
      const opts = { test: true };
      const spy = sinonSpy(element, '_handleNormalizedFileData');
      const file = DataHelper.generateArcImportFile();
      return element._processFileData(file, opts)
      .catch(() => {})
      .then(() => {
        assert.isTrue(spy.called);
        assert.deepEqual(spy.args[0][1], opts);
      });
    });
  });

  suite('_isOldImport()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Returns false when not a request object', () => {
      const result = element._isOldImport({});
      assert.isFalse(result);
    });

    test('Returns false when arc import', () => {
      const result = element._isOldImport({
        projects: [],
        requests: []
      });
      assert.isFalse(result);
    });

    test('Returns true when single request object', () => {
      const result = element._isOldImport({
        headers: 'a',
        url: 'b',
        method: 'c'
      });
      assert.isTrue(result);
    });
  });

  suite('_isArcFile()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Returns false when no argument', () => {
      const result = element._isArcFile();
      assert.isFalse(result);
    });

    test('Returns false when not an object', () => {
      const result = element._isArcFile([]);
      assert.isFalse(result);
    });

    test('Returns false when not ARC kind', () => {
      const result = element._isArcFile({
        kind: 'test'
      });
      assert.isFalse(result);
    });

    test('Returns true when ARC kind', () => {
      const result = element._isArcFile({
        kind: 'ARC#AllDataExport'
      });
      assert.isTrue(result);
    });

    [
      'projects', 'requests', 'history', 'url-history',
      'websocket-url-history', 'variables', 'headers-sets', 'auth-data',
      'cookies'
    ].forEach((prop) => {
      test(`Returns true when property ${prop} is set`, () => {
        const data = {};
        data[prop] = true;
        const result = element._isArcFile(data);
        assert.isTrue(result);
      });
    });

    test('Returns true when very very old arc import', () => {
      const result = element._isArcFile({
        headers: 'a',
        url: 'b',
        method: 'c'
      });
      assert.isTrue(result);
    });

    test('Returns false otherwise', () => {
      const result = element._isArcFile({});
      assert.isFalse(result);
    });
  });

  suite('_isSingleRequest()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Returns false when not request data', () => {
      const result = element._isSingleRequest({});
      assert.isFalse(result);
    });

    test('Returns false when request size is > 1', () => {
      const result = element._isSingleRequest({
        requests: [{}, {}]
      });
      assert.isFalse(result);
    });

    test('Returns true when import object has single request', () => {
      const request = DataHelper.generateSingleRequestImport();
      const result = element._isSingleRequest(request);
      assert.isTrue(result);
    });

    test('Ignores empty projects', () => {
      const request = DataHelper.generateSingleRequestImport();
      request.projects = [];
      const result = element._isSingleRequest(request);
      assert.isTrue(result);
    });

    test('Ignores empty history', () => {
      const request = DataHelper.generateSingleRequestImport();
      request.history = [];
      const result = element._isSingleRequest(request);
      assert.isTrue(result);
    });
  });

  suite('_handleNormalizedFileData()', () => {
    let element;
    setup(async function() {
      element = await basicFixture();
    });

    test('Throws when no data', () => {
      assert.throws(() => {
        element._handleNormalizedFileData();
      });
    });

    test('Dispatches request-workspace-append event', () => {
      const spy = sinonSpy();
      element.addEventListener('request-workspace-append', spy);
      const request = DataHelper.generateSingleRequestImport();
      element._handleNormalizedFileData(request);
      assert.isTrue(spy.called);
    });

    test('Dispatches request-workspace-append for project with forced open', () => {
      const spy = sinonSpy();
      element.addEventListener('request-workspace-append', spy);
      const data = DataHelper.generateProjectImportOpen();
      element._handleNormalizedFileData(data);
      assert.deepEqual(spy.args[0][0].detail, data);
    });

    test('Removes key and kind properties', () => {
      const spy = sinonSpy();
      element.addEventListener('request-workspace-append', spy);
      const request = DataHelper.generateSingleRequestImport();
      element._handleNormalizedFileData(request);
      assert.isUndefined(spy.args[0][0].detail.request.key);
      assert.isUndefined(spy.args[0][0].detail.request.kind);
    });

    test('Sets request _id', () => {
      const spy = sinonSpy();
      element.addEventListener('request-workspace-append', spy);
      const request = DataHelper.generateSingleRequestImport();
      element._handleNormalizedFileData(request);
      assert.equal(spy.args[0][0].detail.request._id, '11013905-9b5a-49d9-adc8-f76ec3ead2f1');
    });

    test('Adds driveId', () => {
      const spy = sinonSpy();
      element.addEventListener('request-workspace-append', spy);
      const request = DataHelper.generateSingleRequestImport();
      element._handleNormalizedFileData(request, { driveId: 'test' });
      assert.equal(spy.args[0][0].detail.request.driveId, 'test');
    });

    test('Dispatches import-data-inspect event', () => {
      const spy = sinonSpy();
      element.addEventListener('import-data-inspect', spy);
      const request = DataHelper.generateMultiRequestImport();
      element._handleNormalizedFileData(request);
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0].detail.data, request);
    });
  });
});
