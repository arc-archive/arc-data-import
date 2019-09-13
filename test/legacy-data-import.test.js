import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from './test-helper.js';
import '../arc-data-import.js';

suite('Legacy data', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  suite('Legacy import to datastore', function() {
    let originalData;
    let element;
    let data;
    suiteSetup(function() {
      return DataTestHelper.getFile('legacy-data-import.json')
      .then((response) => {
        originalData = JSON.parse(response);
      });
    });

    suiteTeardown(function() {
      return DataGenerator.destroySavedRequestData();
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

    test('Overrides (some) data', function() {
      return element.normalizeImportData(data)
      .then((parsed) => {
        return element.storeData(parsed);
      })
      .then((errors) => {
        assert.isUndefined(errors);
        return DataTestHelper.getDatastoreRequestData();
      })
      .then((requests) => {
        // 1 request is in a project in the test data
        // and this import is missing project ID so it generates IDs again
        // so together it should give 2 from previous import + 1 new
        assert.lengthOf(requests, 3);
        return DataTestHelper.getDatastoreProjectsData();
      })
      .then((projects) => {
        assert.lengthOf(projects, 2);
      });
    });
  });

  suite('Legacy single request to datastore', function() {
    let originalData;
    let element;
    let data;
    suiteSetup(function() {
      return DataTestHelper.getFile('legacy-request-import.json')
      .then((response) => {
        originalData = JSON.parse(response);
      });
    });

    suiteTeardown(function() {
      return DataGenerator.destroySavedRequestData();
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
      });
    });
  });
});
