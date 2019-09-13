import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from '../test-helper.js';
import '../../arc-data-import.js';
suite('postman-data-import-v1-test', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  suite('Postamn import to datastore - v1', function() {
    let originalData;
    let element;
    let data;
    suiteSetup(function() {
      return DataTestHelper.getFile('postman/collection-v1.json')
      .then((response) => {
        originalData = JSON.parse(response);
      });
    });

    suiteTeardown(function() {
      return DataGenerator.destroySavedRequestData()
      .then(function() {
        return DataGenerator.destroyVariablesData();
      })
      .then(function() {
        return DataGenerator.destroyHeadersData();
      });
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
        return DataTestHelper.getDatastoreRequestData();
      })
      .then((requests) => {
        assert.lengthOf(requests, 2);
        return DataTestHelper.getDatastoreProjectsData();
      })
      .then((projects) => {
        assert.lengthOf(projects, 1);
      });
    });

    test('Overrides all data', function() {
      return element.normalizeImportData(data)
      .then((parsed) => {
        return element.storeData(parsed);
      })
      .then((errors) => {
        assert.isUndefined(errors);
        return DataTestHelper.getDatastoreRequestData();
      })
      .then((requests) => {
        assert.lengthOf(requests, 2);
        return DataTestHelper.getDatastoreProjectsData();
      })
      .then((projects) => {
        assert.lengthOf(projects, 1);
      });
    });
  });
});
