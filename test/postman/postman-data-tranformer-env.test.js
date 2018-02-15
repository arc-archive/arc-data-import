'use strict';

const assert = require('chai').assert;
const {PostmanEnvTransformer} = require('../..');

describe('postman-env-transformer', function() {

  describe('_transformVariables()', function() {
    var transformer;
    var jsonData;
    before(function() {
      jsonData = require('./environment.json');
    });

    beforeEach(function() {
      transformer = new PostmanEnvTransformer(jsonData);
    });

    it('Returns an array', function() {
      const result = transformer._transformVariables(jsonData.values);
      assert.typeOf(result, 'array');
      assert.lengthOf(result, 3);
    });

    it('Transforms variables', function() {
      const result = transformer._transformVariables(jsonData.values);
      assert.equal(result[1].value, 'test ${var1}');
    });

    it('Sets `enabled` proeprty', function() {
      const result = transformer._transformVariables(jsonData.values);
      assert.isTrue(result[1].enabled);
      assert.isFalse(result[2].enabled);
    });

    it('Sets environment property', function() {
      const env = 'test-env';
      const result = transformer._transformVariables(jsonData.values, env);
      assert.equal(result[0].environment, env);
      assert.equal(result[1].environment, env);
      assert.equal(result[2].environment, env);
    });

    it('Sets default environment property', function() {
      const env = 'default';
      const result = transformer._transformVariables(jsonData.values);
      assert.equal(result[0].environment, env);
      assert.equal(result[1].environment, env);
      assert.equal(result[2].environment, env);
    });
  });

  describe('transform()', function() {
    var jsonData;
    var transformer;
    before(function() {
      jsonData = require('./environment.json');
    });

    beforeEach(function() {
      transformer = new PostmanEnvTransformer(jsonData);
    });

    it('Returns Promise', function() {
      const result = transformer.transform();
      assert.typeOf(result.then, 'function');
    });

    it('Contains export object properties', function() {
      return transformer.transform()
      .then(function(result) {
        assert.typeOf(result.createdAt, 'string');
        assert.equal(result.version, 'postman-environment');
        assert.equal(result.kind, 'ARC#Import');
        assert.typeOf(result.variables, 'array');
        assert.lengthOf(result.variables, 3);
      });
    });
  });
});
