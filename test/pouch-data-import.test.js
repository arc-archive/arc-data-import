import { assert, fixture } from '@open-wc/testing';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import { DataTestHelper } from './test-helper.js';
import '../arc-data-import.js';
suite('PouchDB import to datastore', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  let originalData;
  let element;
  let data;
  suiteSetup(function() {
    return DataTestHelper.getFile('pouch-data-export.json')
    .then((response) => {
      originalData = JSON.parse(response);
    });
  });

  suiteTeardown(function() {
    return DataGenerator.destroyAll();
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
      assert.isUndefined(errors, 'No errors while importing');
      return DataTestHelper.getDatastoreRequestData();
    })
    .then((requests) => {
      assert.lengthOf(requests, 4, 'Has 4 requests');
      return DataTestHelper.getDatastoreProjectsData();
    })
    .then((projects) => {
      assert.lengthOf(projects, 2, 'Has 2 projects');
      return DataTestHelper.getDatastoreVariablesData();
    })
    .then((variables) => {
      assert.lengthOf(variables, 4, 'Has 4 variables');
      return DataTestHelper.getDatastoreEnvironmentsData();
    })
    .then((environments) => {
      assert.lengthOf(environments, 2, 'Has 2 environments');
      return DataTestHelper.getDatastoreheadersData();
    })
    .then((headers) => {
      assert.lengthOf(headers, 1, 'Has 1 header set');
      return DataTestHelper.getDatastoreHistoryData();
    })
    .then((history) => {
      assert.lengthOf(history, 3, 'Has 3 history');
      return DataTestHelper.getDatastoreCookiesData();
    })
    .then((cookies) => {
      assert.lengthOf(cookies, 2, 'Has 2 cookies');
      return DataTestHelper.getDatastoreWebsocketsData();
    })
    .then((websocketUrls) => {
      assert.lengthOf(websocketUrls, 1, 'Has 1 WS history');
      return DataTestHelper.getDatastoreUrlsData();
    })
    .then((urls) => {
      assert.lengthOf(urls, 5, 'Has 5 URL history');
      return DataTestHelper.getDatastoreAthDataData();
    })
    .then((auth) => {
      assert.lengthOf(auth, 1, 'Has 1 auth data');
      return DataTestHelper.getDatastoreHostRulesData();
    })
    .then((rules) => {
      assert.lengthOf(rules, 1, 'Has 1 host rule');
      assert.equal(rules[0]._id, 'host-rule');
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
      assert.lengthOf(requests, 4, 'Has 4 requests');
      return DataTestHelper.getDatastoreProjectsData();
    })
    .then((projects) => {
      assert.lengthOf(projects, 2, 'Has 2 projects');
      return DataTestHelper.getDatastoreVariablesData();
    })
    .then((variables) => {
      assert.lengthOf(variables, 8, 'Has 8 variables');
      return DataTestHelper.getDatastoreEnvironmentsData();
    })
    .then((environments) => {
      assert.lengthOf(environments, 2, 'Has 2 environments');
      return DataTestHelper.getDatastoreheadersData();
    })
    .then((headers) => {
      assert.lengthOf(headers, 2, 'Has 2 headers');
    });
  });
});
