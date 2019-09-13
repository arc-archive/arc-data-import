import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from '../test-helper.js';
import '../../arc-data-import.js';
suite('Postamn import to datastore - backup data', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  let originalData;
  let element;
  let data;
  suiteSetup(function() {
    return DataTestHelper.getFile('postman/postman-data.json')
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
      assert.isUndefined(errors, 'has no errors');
      return DataTestHelper.getDatastoreRequestData();
    })
    .then((requests) => {
      assert.lengthOf(requests, 46);
      return DataTestHelper.getDatastoreProjectsData();
    })
    .then((projects) => {
      assert.lengthOf(projects, 2);
      return DataTestHelper.getDatastoreVariablesData();
    })
    .then((variables) => {
      assert.lengthOf(variables, 5);
      return DataTestHelper.getDatastoreEnvironmentsData();
    })
    .then((environments) => {
      assert.lengthOf(environments, 2);
      return DataTestHelper.getDatastoreheadersData();
    })
    .then((headers) => {
      assert.lengthOf(headers, 1);
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
      // 1 request is in a project in the test data
      // and this import is missing project ID so it generates IDs again
      // so together it should give 2 from previous import + 1 new
      assert.lengthOf(requests, 46);
      return DataTestHelper.getDatastoreProjectsData();
    })
    .then((projects) => {
      assert.lengthOf(projects, 2);
      return DataTestHelper.getDatastoreVariablesData();
    })
    .then((variables) => {
      assert.lengthOf(variables, 10);
      return DataTestHelper.getDatastoreEnvironmentsData();
    })
    .then((environments) => {
      assert.lengthOf(environments, 2);
      return DataTestHelper.getDatastoreheadersData();
    })
    .then((headers) => {
      assert.lengthOf(headers, 2);
    });
  });
});
