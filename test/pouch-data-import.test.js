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
  suiteSetup(async () => {
    const response = await DataTestHelper.getFile('pouch-data-export.json');
    originalData = JSON.parse(response);
  });

  suite('storing data', () => {
    setup(async function() {
      element = await basicFixture();
      data = DataTestHelper.clone(originalData);
      const parsed = await element.normalizeImportData(data);
      const errors = await element.storeData(parsed);
      assert.isUndefined(errors, 'No errors while importing');
    });

    teardown(function() {
      return DataGenerator.destroyAll();
    });

    test('stores saved request data', async () => {
      const result = await DataTestHelper.getDatastoreRequestData();
      assert.lengthOf(result, 5, 'Has 5 requests');
    });

    test('stores projects data', async () => {
      const result = await DataTestHelper.getDatastoreProjectsData();
      assert.lengthOf(result, 2, 'Has 2 projects');
    });

    test('stores variables data', async () => {
      const result = await DataTestHelper.getDatastoreVariablesData();
      assert.lengthOf(result, 4, 'Has 4 variables');
    });

    test('stores environments data', async () => {
      const result = await DataTestHelper.getDatastoreEnvironmentsData();
      assert.lengthOf(result, 2, 'Has 2 environments');
    });

    test('stores history request data', async () => {
      const result = await DataTestHelper.getDatastoreHistoryData();
      assert.lengthOf(result, 3, 'Has 3 history');
    });

    test('stores cookies data', async () => {
      const result = await DataTestHelper.getDatastoreCookiesData();
      assert.lengthOf(result, 2, 'Has 2 cookies');
    });

    test('stores websocket url data', async () => {
      const result = await DataTestHelper.getDatastoreWebsocketsData();
      assert.lengthOf(result, 1, 'Has 1 WS history');
    });

    test('stores url history data', async () => {
      const result = await DataTestHelper.getDatastoreUrlsData();
      assert.lengthOf(result, 5, 'Has 5 URL history');
    });

    test('stores auth data', async () => {
      const result = await DataTestHelper.getDatastoreAthDataData();
      assert.lengthOf(result, 1, 'Has 1 auth data');
    });

    test('stores host rules data', async () => {
      const result = await DataTestHelper.getDatastoreHostRulesData();
      assert.lengthOf(result, 1, 'Has 1 host rule');
      assert.equal(result[0]._id, 'host-rule');
    });

    test('stores client certificates', async () => {
      const [indexes, certs] = await DataGenerator.getDatastoreClientCertificates();
      assert.lengthOf(indexes, 1, 'has 1 certificate index document');
      assert.lengthOf(certs, 1, 'has 1 certificate data document');
    });
  });


  suite('overriding data', () => {
    suiteTeardown(function() {
      return DataGenerator.destroyAll();
    });

    setup(async function() {
      element = await basicFixture();
      data = DataTestHelper.clone(originalData);
      const parsed = await element.normalizeImportData(data);
      const errors = await element.storeData(parsed);
      assert.isUndefined(errors, 'No errors while importing');
    });

    // this test comes first as variables are always added as new
    test('stores variables data', async () => {
      const parsed = await element.normalizeImportData(data);
      const errors = await element.storeData(parsed);
      assert.isUndefined(errors, 'No errors while importing');
      const result = await DataTestHelper.getDatastoreVariablesData();
      assert.lengthOf(result, 4, 'Has 4 variables');
    });

    test('stores saved request data', async () => {
      const result = await DataTestHelper.getDatastoreRequestData();
      // 1 request is in a project in the test data
      // and this import is missing project ID so it generates IDs again
      // so together it should give 2 from previous import + 1 new
      assert.lengthOf(result, 7, 'Has 7 requests');
    });

    test('stores projects data', async () => {
      const result = await DataTestHelper.getDatastoreProjectsData();
      assert.lengthOf(result, 4, 'Has 4 projects');
    });

    test('stores environments data', async () => {
      const result = await DataTestHelper.getDatastoreEnvironmentsData();
      assert.lengthOf(result, 2, 'Has 2 environments');
    });

    test('stores client certificates', async () => {
      const [indexes, certs] = await DataGenerator.getDatastoreClientCertificates();
      assert.lengthOf(indexes, 1, 'has 1 certificate index document');
      assert.lengthOf(certs, 1, 'has 1 certificate data document');
    });
  });
});
