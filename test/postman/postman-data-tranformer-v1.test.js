'use strict';

const assert = require('chai').assert;
const {PostmanV1Transformer} = require('../..');
const {DataTestHelper} = require('../test-helper');

describe('postman-v1-transformer (collection)', function() {

  describe('_readProjectInfo()', function() {
    var jsonData;
    var result;
    before(function() {
      jsonData = require('./collection-v1.json');
    });

    beforeEach(function() {
      const transformer = new PostmanV1Transformer(jsonData);
      result = transformer._readProjectInfo();
    });

    it('Returns an object', function() {
      assert.typeOf(result, 'object');
    });

    it('Contains _id', function() {
      assert.equal(result._id, 'e4638c4e-1a37-9b63-4db3-4ad8c3516706');
    });

    it('name is set', function() {
      assert.equal(result.name, 'TestCollection');
    });

    it('description is set', function() {
      assert.equal(result.description, 'Some description');
    });

    it('created is set', function() {
      assert.equal(result.created, 1518549355798);
    });

    it('updated is set', function() {
      assert.equal(result.updated, 1518549355798);
    });

    it('order is set', function() {
      assert.equal(result.order, 0);
    });
  });

  describe('_computeRequestsInOrder()', function() {
    var jsonData;
    var result;
    before(function() {
      jsonData = require('./collection-v1.json');
    });

    beforeEach(function() {
      const transformer = new PostmanV1Transformer(jsonData);
      result = transformer._computeRequestsInOrder();
    });

    it('Returns an array', function() {
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 2);
    });

    it('Requests are in order', function() {
      assert.equal(result[0].id, '6995f0d5-4c47-8bbd-de3c-1cd357e6a99d');
      assert.equal(result[1].id, '2246fd9b-169a-7051-c3e2-d2137ab90ede');
    });
  });

  describe('Data processing', function() {
    var jsonData;
    var result;

    before(function() {
      jsonData = require('./collection-v1.json');
      const transformer = new PostmanV1Transformer(jsonData);
      return transformer.transform()
      .then(data => result = data);
    });

    it('Returns the data', function() {
      assert.typeOf(result, 'object');
    });

    it('Contains export object properties', function() {
      assert.typeOf(result.createdAt, 'string');
      assert.equal(result.version, 'postman-collection-v1');
      assert.equal(result.kind, 'ARC#Import');
      assert.typeOf(result.projects, 'array');
      assert.typeOf(result.requests, 'array');
    });

    it('Data are accounted for', function() {
      assert.lengthOf(result.projects, 1);
      assert.lengthOf(result.requests, 2);
    });

    it('Request objects are valid', function() {
      for (var i = 0; i < result.requests.length; i++) {
        DataTestHelper.assertRequestObject(result.requests[i]);
      }
    });

    it('Project data is set', function() {
      const project = result.projects[0];
      for (var i = 0; i < result.requests.length; i++) {
        assert.typeOf(result.requests[i].projectOrder, 'number');
        assert.equal(result.requests[i].legacyProject, project._id);
      }
    });

    it('Project object is valid', function() {
      DataTestHelper.assertProjectObject(result.projects[0]);
    });

    it('Contains headersModel', function() {
      const model = result.requests[1].headersModel;
      assert.typeOf(model, 'array');
      assert.lengthOf(model, 3);
    });

    it('headersModel contains properties', function() {
      var model = result.requests[1].headersModel[0];
      assert.equal(model.name, 'h1');
      assert.equal(model.value, 'h1v');
      assert.isTrue(model.enabled);
      model = result.requests[1].headersModel[1];
      assert.isFalse(model.enabled);
    });

    it('Contains queryModel', function() {
      const model = result.requests[1].queryModel;
      assert.typeOf(model, 'array');
      assert.lengthOf(model, 3);
    });

    it('queryModel contains properties', function() {
      var model = result.requests[1].queryModel[0];
      assert.equal(model.name, 'p1');
      assert.equal(model.value, 'v1');
      assert.isTrue(model.enabled);
      model = result.requests[1].queryModel[1];
      assert.isFalse(model.enabled);
    });
  });
});
