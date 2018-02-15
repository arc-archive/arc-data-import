'use strict';

const assert = require('chai').assert;
const {ArcLegacyTransformer} = require('..');
const {DataTestHelper} = require('./test-helper');

describe('Single request import', function() {
  var jsonData;
  var result;

  before(function() {
    jsonData = require('./legacy-request-import.json');
    const transformer = new ArcLegacyTransformer(jsonData);
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
  });

  it('Projects is empty', function() {
    assert.lengthOf(result.projects, 0);
  });

  it('Requests contains a single entry', function() {
    assert.lengthOf(result.requests, 1);
  });

  it('Request object is valid', function() {
    DataTestHelper.assertRequestObject(result.requests[0]);
  });

  it('Default name is set', function() {
    assert.equal(result.requests[0].name, 'unnamed');
  });

  it('Request values are set', function() {
    var request = result.requests[0];
    assert.equal(request.url, 'http://mulesoft.com');
    assert.equal(request.method, 'GET');
    assert.equal(request.headers, '');
    assert.equal(request.payload, '');
    assert.equal(request.created, 1450675637093);
  });

  it('Google Drive information is present', function() {
    var request = result.requests[0];
    assert.equal(request.driveId, '0Bzpy9PK_RiBOeWRYUEo0TmRyTzA');
    assert.equal(request.type, 'google-drive');
  });
});

describe('Multiple requests import', function() {
  var jsonData;
  var result;
  before(function() {
    jsonData = require('./legacy-data-import.json');
    const transformer = new ArcLegacyTransformer(jsonData);
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
  });

  it('Projects contains an item', function() {
    assert.lengthOf(result.projects, 1);
  });

  it('Requests contains 2 entries', function() {
    assert.lengthOf(result.requests, 2);
  });

  it('Requests objects are valid', function() {
    DataTestHelper.assertRequestObject(result.requests[0]);
    DataTestHelper.assertRequestObject(result.requests[1]);
  });

  it('Projects object is valid', function() {
    DataTestHelper.assertProjectObject(result.projects[0]);
  });

  it('Project values are set', function() {
    var project = result.projects[0];
    assert.equal(project.name, 'test-project', 'name is set');
    assert.equal(project.created, 1506285256547, 'created is set');
    assert.strictEqual(project.order, 0, 'order is set');
  });

  it('Project information is set on the request', function() {
    assert.equal(result.requests[0].legacyProject, result.projects[0]._id,
      'Project ID is set');
    assert.isUndefined(result.requests[1].legacyProject, 'Project id is undefined');
  });
});
