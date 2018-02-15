'use strict';

const assert = require('chai').assert;
const {ArcDexieTransformer} = require('..');
const {DataTestHelper} = require('./test-helper');

describe('Dexie export', function() {
  var jsonData;
  var result;
  before(function() {
    jsonData = require('./dexie-data-export.json');
    const transformer = new ArcDexieTransformer(jsonData);
    return transformer.transform()
    .then(data => result = data);
  });

  it('Normalizes the data', function() {
    assert.typeOf(result, 'object');
  });

  it('Contains export object properties', function() {
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, 'unknown');
    assert.equal(result.kind, 'ARC#Import');
    assert.typeOf(result.projects, 'array');
    assert.typeOf(result.requests, 'array');
    assert.typeOf(result.history, 'array');
  });

  it('Projects contains 2 entries', function() {
    assert.lengthOf(result.projects, 2);
  });

  it('History is empty', function() {
    assert.lengthOf(result.history, 0);
  });

  it('Requests contains 6 entries', function() {
    assert.lengthOf(result.requests, 6);
  });

  it('Request objects are valid', function() {
    DataTestHelper.assertRequestObject(result.requests[0]);
    DataTestHelper.assertRequestObject(result.requests[3]);
    DataTestHelper.assertRequestObject(result.requests[5]);
  });

  it('Request values are set', function() {
    var request = result.requests[0];
    assert.equal(request.url, 'hrttp://localhost:8080/url2');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506365775233);
    assert.equal(request.name, 'test-request');
    assert.equal(request.type, 'saved');

    request = result.requests[3];
    assert.equal(request.url, 'http://onet.pl/test');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506365939968);
    assert.equal(request.name, 'Other endpoint');
    assert.equal(request.type, 'saved');

    request = result.requests[5];
    assert.equal(request.url, 'http://second-project.com');
    assert.equal(request.method, 'PUT');
    assert.equal(request.headers, 'x-test: headers');
    assert.equal(request.payload, 'test-payload');
    assert.equal(request.created, 1506367353657);
    assert.equal(request.name, 'second-project-request');
    assert.equal(request.type, 'saved');
  });

  it('Projects object is valid', function() {
    DataTestHelper.assertProjectObject(result.projects[0]);
    DataTestHelper.assertProjectObject(result.projects[1]);
  });

  it('Project values are set', function() {
    var project = result.projects[0];
    assert.equal(project.name, 'Project name', 'name is set');
    assert.equal(project.created, 1506365878724, 'created is set');
    assert.strictEqual(project.order, 0, 'order is set');

    project = result.projects[1];
    assert.equal(project.name, 'second-project', 'name is set');
    assert.equal(project.created, 1506367353678, 'created is set');
    assert.strictEqual(project.order, 0, 'order is set');
  });

  it('Associate requests with porojects', function() {
    assert.isUndefined(result.requests[0].legacyProject);
    assert.isUndefined(result.requests[1].legacyProject);
    assert.typeOf(result.requests[2].legacyProject, 'string');
    assert.typeOf(result.requests[3].legacyProject, 'string');
    assert.typeOf(result.requests[4].legacyProject, 'string');
    assert.typeOf(result.requests[5].legacyProject, 'string');
  });

  it('Project ID is set correctly', function() {
    var p1id = result.projects[0]._id;
    var p2id = result.projects[1]._id;
    assert.equal(result.requests[2].legacyProject, p1id);
    assert.equal(result.requests[3].legacyProject, p1id);
    assert.equal(result.requests[4].legacyProject, p1id);
    assert.equal(result.requests[5].legacyProject, p2id);
  });
});

describe('Dexie history', function() {
  var jsonData;
  var result;
  before(function() {
    jsonData = require('./dexie-history-export.json');
    const transformer = new ArcDexieTransformer(jsonData);
    return transformer.transform()
    .then(data => result = data);
  });

  it('Normalizes the data', function() {
    assert.typeOf(result, 'object');
  });

  it('History contains 4 entries', function() {
    assert.lengthOf(result.history, 4);
  });

  it('History objects are valid', function() {
    DataTestHelper.assertHistoryObject(result.history[0]);
    DataTestHelper.assertHistoryObject(result.history[1]);
    DataTestHelper.assertHistoryObject(result.history[2]);
    DataTestHelper.assertHistoryObject(result.history[3]);
  });

  it('Request values are set', function() {
    var request = result.history[0];
    assert.equal(request.url, 'http://wp.pl');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506366584358);

    request = result.history[2];
    assert.equal(request.url, 'http://google.com');
    assert.equal(request.method, 'PUT');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506365841855);
  });
});

describe('Dexie saved export', function() {
  var jsonData;
  var result;
  before(function() {
    jsonData = require('./dexie-saved-export.json');
    const transformer = new ArcDexieTransformer(jsonData);
    return transformer.transform()
    .then(data => result = data);
  });

  it('Requests contains 2 entries', function() {
    assert.lengthOf(result.requests, 2);
  });

  it('Request objects are valid', function() {
    DataTestHelper.assertRequestObject(result.requests[0]);
    DataTestHelper.assertRequestObject(result.requests[1]);
  });

  it('Request values are set', function() {
    var request = result.requests[0];
    assert.equal(request.url, 'hrttp://localhost:8080/url2');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506365775233);
    assert.equal(request.name, 'Request in project');
    assert.equal(request.type, 'saved');

    request = result.requests[1];
    assert.equal(request.url, 'http://google.com');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1506365826194);
    assert.equal(request.name, 'Regular request');
    assert.equal(request.type, 'saved');
  });
});
