import { assert } from '@open-wc/testing';
import { DataTestHelper } from './test-helper.js';
import { ArcPouchTransformer } from '../transformers/arc-pouch-transformer.js';
suite('Data transform - PouchDB', function() {
  let jsonData;
  let result;
  suiteSetup(function() {
    return DataTestHelper.getFile('pouch-data-export.json')
    .then((response) => {
      jsonData = JSON.parse(response);
      const transformer = new ArcPouchTransformer(jsonData);
      return transformer.transform();
    })
    .then((data) => result = data);
  });

  test('Normalizes the data', function() {
    assert.typeOf(result, 'object');
  });

  test('Contains export object properties', function() {
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, '9.14.64.305');
    assert.equal(result.kind, 'ARC#Import');
    assert.typeOf(result.projects, 'array');
    assert.typeOf(result.requests, 'array');
    assert.typeOf(result.history, 'array');
    assert.typeOf(result.variables, 'array');
    assert.typeOf(result.cookies, 'array');
    assert.typeOf(result['websocket-url-history'], 'array');
    assert.typeOf(result['url-history'], 'array');
    assert.typeOf(result['headers-sets'], 'array');
    assert.typeOf(result['auth-data'], 'array');
    assert.typeOf(result['host-rules'], 'array');
  });

  test('Data are accounted for', function() {
    assert.lengthOf(result.projects, 2);
    assert.lengthOf(result.requests, 4);
    assert.lengthOf(result.history, 3);
    assert.lengthOf(result.variables, 4);
    assert.lengthOf(result.cookies, 2);
    assert.lengthOf(result['websocket-url-history'], 1);
    assert.lengthOf(result['url-history'], 5);
    assert.lengthOf(result['headers-sets'], 1);
    assert.lengthOf(result['auth-data'], 1);
    assert.lengthOf(result['host-rules'], 1);
  });

  test('Request objects are valid', function() {
    DataTestHelper.assertRequestObject(result.requests[0]);
    DataTestHelper.assertRequestObject(result.requests[1]);
    DataTestHelper.assertRequestObject(result.requests[2]);
    DataTestHelper.assertRequestObject(result.requests[3]);
  });

  test('Project objects are valid', function() {
    DataTestHelper.assertProjectObject(result.projects[0]);
    DataTestHelper.assertProjectObject(result.projects[1]);
  });

  test('History objects are valid', function() {
    DataTestHelper.assertHistoryObject(result.history[0]);
    DataTestHelper.assertHistoryObject(result.history[1]);
    DataTestHelper.assertHistoryObject(result.history[2]);
  });

  test('Request values are set', function() {
    let request = result.requests[0];
    let compare = jsonData.requests[0];
    assert.equal(request.url, compare.url);
    assert.equal(request.method, compare.method);
    assert.equal(request.headers, compare.headers);
    assert.equal(request.payload, compare.payload);
    assert.equal(request.created, compare.created);
    assert.equal(request.name, compare.name);
    assert.equal(request.type, compare.type);
    assert.isUndefined(request.kind);

    request = result.requests[1];
    compare = jsonData.requests[1];
    assert.equal(request.url, compare.url);
    assert.equal(request.method, compare.method);
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, compare.created);
    assert.equal(request.name, compare.name);
    assert.equal(request.type, compare.type);
    assert.isUndefined(request.kind);

    request = result.requests[3];
    compare = jsonData.requests[3];
    assert.equal(request.url, compare.url);
    assert.equal(request.method, compare.method);
    assert.equal(request.headers, compare.headers);
    assert.equal(request.payload, compare.payload);
    assert.equal(request.created, compare.created);
    assert.equal(request.name, compare.name);
    assert.equal(request.type, compare.type);
    assert.isUndefined(request.kind);
  });

  test('Project values are set', function() {
    let project = result.projects[0];
    let compare = jsonData.projects[0];
    assert.equal(project.name, compare.name, 'name is set');
    assert.equal(project.created, compare.created, 'created is set');
    assert.strictEqual(project.order, compare.order, 'order is set');
    assert.isUndefined(project.kind);

    project = result.projects[1];
    compare = jsonData.projects[1];
    assert.equal(project.name, compare.name, 'name is set');
    assert.equal(project.created, compare.created, 'created is set');
    assert.strictEqual(project.order, compare.order, 'order is set');
    assert.isUndefined(project.kind);
  });

  test('Associate requests with porojects', function() {
    assert.isUndefined(result.requests[0].projects);
    assert.isUndefined(result.requests[1].projects);
    assert.typeOf(result.requests[2].projects, 'array');
    assert.lengthOf(result.requests[2].projects, 1);
    assert.typeOf(result.requests[3].projects, 'array');
    assert.lengthOf(result.requests[3].projects, 1);
  });

  test('Associate porojects with requests', function() {
    const p1 = result.projects[0];
    assert.typeOf(p1.requests, 'array');
    assert.lengthOf(p1.requests, 1);
    const p2 = result.projects[0];
    assert.typeOf(p2.requests, 'array');
    assert.lengthOf(p2.requests, 1);
  });

  test('Project ID is set correctly', function() {
    const p1id = result.projects[0]._id;
    const p2id = result.projects[1]._id;
    assert.equal(result.requests[2].projects[0], p1id);
    assert.equal(result.requests[3].projects[0], p2id);
  });

  test('variable object has the `_id` property', function() {
    assert.typeOf(result.variables[0]._id, 'string');
    assert.typeOf(result.variables[1]._id, 'string');
    assert.typeOf(result.variables[2]._id, 'string');
    assert.typeOf(result.variables[3]._id, 'string');
  });

  test('variable values are set', function() {
    let v1 = result.variables[0];
    let compare = jsonData.variables[0];
    assert.strictEqual(v1.enabled, compare.enabled);
    assert.strictEqual(v1.environment, compare.environment);
    assert.strictEqual(v1.value, compare.value);
    assert.strictEqual(v1.variable, compare.variable);
    assert.isUndefined(v1.kind);

    v1 = result.variables[1];
    compare = jsonData.variables[1];
    assert.strictEqual(v1.enabled, compare.enabled);
    assert.strictEqual(v1.environment, compare.environment);
    assert.strictEqual(v1.value, compare.value);
    assert.strictEqual(v1.variable, compare.variable);
    assert.isUndefined(v1.kind);
  });

  test('cookie object has the `_id` property', function() {
    assert.typeOf(result.cookies[0]._id, 'string');
    assert.typeOf(result.cookies[1]._id, 'string');
  });

  test('cookie values are set', function() {
    let v1 = result.cookies[0];
    let compare = jsonData.cookies[0];
    assert.strictEqual(v1.domain, compare.domain);
    assert.strictEqual(v1.name, compare.name);
    assert.strictEqual(v1.value, compare.value);
    assert.isUndefined(v1.kind);

    v1 = result.cookies[1];
    compare = jsonData.cookies[1];
    assert.strictEqual(v1.domain, compare.domain);
    assert.strictEqual(v1.name, compare.name);
    assert.strictEqual(v1.value, compare.value);
    assert.isUndefined(v1.kind);
  });

  test('websocket-url-history object has the `_id` property', function() {
    assert.typeOf(result['websocket-url-history'][0]._id, 'string');
  });

  test('websocket-url-history values are set', function() {
    const v1 = result['websocket-url-history'][0];
    const compare = jsonData['websocket-url-history'][0];
    assert.strictEqual(v1.cnt, compare.cnt);
    assert.strictEqual(v1.time, compare.time);
    assert.isUndefined(v1.kind);
  });

  test('url-history object has the `_id` property', function() {
    assert.typeOf(result['url-history'][1]._id, 'string');
  });

  test('url-history values are set', function() {
    const v1 = result['url-history'][3];
    const compare = jsonData['url-history'][3];
    assert.strictEqual(v1.cnt, compare.cnt);
    assert.strictEqual(v1.time, compare.time);
    assert.isUndefined(v1.kind);
  });

  test('headers-sets object has the `_id` property', function() {
    assert.typeOf(result['headers-sets'][0]._id, 'string');
  });

  test('headers-sets values are set', function() {
    const v1 = result['headers-sets'][0];
    const compare = jsonData['headers-sets'][0];
    assert.strictEqual(v1.headers, compare.headers);
    assert.strictEqual(v1.name, compare.name);
    assert.isUndefined(v1.kind);
  });

  test('auth-data object has the `_id` property', function() {
    assert.typeOf(result['headers-sets'][0]._id, 'string');
  });

  test('auth-data values are set', function() {
    const v1 = result['auth-data'][0];
    const compare = jsonData['auth-data'][0];
    assert.strictEqual(v1.encoded, compare.encoded);
    assert.isUndefined(v1.kind);
  });

  test('host-rules object has the `_id` property', function() {
    assert.typeOf(result['host-rules'][0]._id, 'string');
  });

  test('host-rules values are set', function() {
    const v1 = result['host-rules'][0];
    const compare = jsonData['host-rules'][0];
    assert.strictEqual(v1.from, compare.from);
    assert.isUndefined(v1.kind);
  });
});
