'use strict';

const assert = require('chai').assert;
const {PostmanBackupTransformer} = require('../..');
const {DataTestHelper} = require('../test-helper');

describe('Postman backup transformer', function() {
  var jsonData;
  var result;

  before(function() {
    jsonData = require('./postman-data.json');
    const transformer = new PostmanBackupTransformer(jsonData);
    return transformer.transform()
    .then(data => result = data);
  });

  it('Normalizes the data', function() {
    assert.typeOf(result, 'object');
  });

  it('Contains export object properties', function() {
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, 'postman-backup');
    assert.equal(result.kind, 'ARC#Import');
    assert.typeOf(result.projects, 'array');
    assert.typeOf(result.requests, 'array');
    assert.typeOf(result.variables, 'array');
    assert.typeOf(result['headers-sets'], 'array');
  });

  it('Data are accounted for', function() {
    assert.lengthOf(result.projects, 2);
    assert.lengthOf(result.requests, 46);
    assert.lengthOf(result.variables, 4);
    assert.lengthOf(result['headers-sets'], 1);
  });

  it('Request objects are valid', function() {
    for (var i = 0; i < result.requests.length; i++) {
      DataTestHelper.assertRequestObject(result.requests[i]);
    }
  });

  it('Project data is set', function() {
    for (var i = 0; i < result.requests.length; i++) {
      assert.typeOf(result.requests[i].projectOrder, 'number');
      assert.typeOf(result.requests[i].legacyProject, 'string');
    }
  });

  function findProject(projects, projectId) {
    return projects.find(item => item._id === projectId);
  }

  it('Project exists in the projects list', function() {
    for (var i = 0; i < result.requests.length; i++) {
      let id = result.requests[i].legacyProject;
      let project = findProject(result.projects, id);
      assert.ok(project);
    }
  });

  it('Project objects are valid', function() {
    DataTestHelper.assertProjectObject(result.projects[0]);
    DataTestHelper.assertProjectObject(result.projects[1]);
  });

  it('headers-sets object has the `_id` property', function() {
    assert.typeOf(result['headers-sets'][0]._id, 'string');
  });

  it('headers-sets values are set', function() {
    var value = result['headers-sets'][0];
    assert.strictEqual(value.headers, 'x-key: value\nother-key: other value');
    assert.strictEqual(value.name, 'headers-preset');
  });

  it('Contains headersModel', function() {
    const model = result.requests[5].headersModel;
    assert.typeOf(model, 'array');
    assert.lengthOf(model, 3);
  });

  it('headersModel contains properties', function() {
    var model = result.requests[5].headersModel[0];
    assert.equal(model.name, 'h1');
    assert.equal(model.value, 'h1v');
    assert.isTrue(model.enabled);
    model = result.requests[5].headersModel[1];
    assert.isFalse(model.enabled);
  });

  it('Contains queryModel', function() {
    const model = result.requests[5].queryModel;
    assert.typeOf(model, 'array');
    assert.lengthOf(model, 3);
  });

  it('queryModel contains properties', function() {
    var model = result.requests[5].queryModel[0];
    assert.equal(model.name, 'p1');
    assert.equal(model.value, 'v1');
    assert.isTrue(model.enabled);
    model = result.requests[5].queryModel[1];
    assert.isFalse(model.enabled);
  });
});
