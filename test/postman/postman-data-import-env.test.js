import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from '../test-helper.js';
import '../../arc-data-import.js';
suite('postman-data-import-env', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  suite('Postamn import to datastore - environment', function() {
    let originalData;
    let element;
    let data;
    suiteSetup(function() {
      return DataTestHelper.getFile('postman/environment.json')
      .then((response) => {
        originalData = JSON.parse(response);
      });
    });

    suiteTeardown(function() {
      return DataGenerator.destroyVariablesData();
    });

    setup(async function() {
      element = await basicFixture();
      data = DataTestHelper.clone(originalData);
    });

    test('Stores the data', function() {
      return element.normalizeImportData(data)
      .then((parsed) => {
        return element.storeData(parsed);
      })
      .then((errors) => {
        assert.isUndefined(errors);
        return DataTestHelper.getDatastoreVariablesData();
      })
      .then((variables) => {
        assert.lengthOf(variables, 3);
      });
    });

    test('Overrides all data', function() {
      return element.normalizeImportData(data)
      .then((parsed) => {
        return element.storeData(parsed);
      })
      .then((errors) => {
        assert.isUndefined(errors);
        return DataTestHelper.getDatastoreVariablesData();
      })
      .then((variables) => {
        assert.lengthOf(variables, 3);
      });
    });
  });
});
