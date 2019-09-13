import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from './test-helper.js';
import '../arc-data-import.js';

suite('Dexie legacy import', function() {
  async function basicFixture() {
    return await fixture(`<arc-data-import></arc-data-import>`);
  }

  suite('Dexie import to datastore', function() {
    let originalData;
    let element;
    let data;
    suiteSetup(function() {
      return DataGenerator.destroySavedRequestData()
      .then(() => DataTestHelper.getFile('dexie-data-export.json'))
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
        assert.lengthOf(requests, 6, 'Has 6 requests');
        return DataTestHelper.getDatastoreProjectsData();
      })
      .then((projects) => {
        assert.lengthOf(projects, 2, 'Has 2 projects');
        return DataTestHelper.getDatastoreHistoryData();
      })
      .then((history) => {
        assert.lengthOf(history, 0, 'Has no history');
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
        // 4 requests are in a project in the test data
        // and this import is missing project ID so it generates IDs again
        // so together it should give 6 from previous import + 4 new
        assert.lengthOf(requests, 10);
        return DataTestHelper.getDatastoreProjectsData();
      })
      .then((projects) => {
        assert.lengthOf(projects, 4);
        return DataTestHelper.getDatastoreHistoryData();
      })
      .then((history) => {
        assert.lengthOf(history, 0);
      });
    });
  });
});
