/* global chance */
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
const DataTestHelper = {};
DataTestHelper.getFile = function(file) {
  return fetch(file).then((response) => {
    if (!response.ok) {
      throw new Error('File ' + file + ' is unavailable');
    }
    return response.text();
  });
};

DataTestHelper.assertRequestId = function(request) {
  const id = request._id;
  assert.typeOf(id, 'string', '_id is a string');
};

DataTestHelper.assertHistoryId = function(request) {
  const id = request._id;
  assert.typeOf(id, 'string', '_id is a string');
  const parts = id.split('/');
  assert.lengthOf(parts, 3, '_id has 3 parts');
  assert.isNotNaN(parts[0], 'First part is a number');
};

DataTestHelper.assertRequestObject = function(request) {
  DataTestHelper.assertRequestId(request);
  assert.typeOf(request.created, 'number', 'created is a number');
  assert.typeOf(request.updated, 'number', 'updated is a number');
  assert.typeOf(request.headers, 'string', 'headers is a string');
  assert.typeOf(request.method, 'string', 'method is a string');
  assert.typeOf(request.name, 'string', 'name is a string');
  assert.typeOf(request.type, 'string', 'type is a string');
  assert.typeOf(request.url, 'string', 'url is a string');
  assert.typeOf(request.payload, 'string', 'payload is a string');
};

DataTestHelper.assertHistoryObject = function(request) {
  DataTestHelper.assertHistoryId(request);
  assert.typeOf(request.created, 'number', 'created is a number');
  assert.typeOf(request.updated, 'number', 'updated is a number');
  assert.typeOf(request.headers, 'string', 'headers is a string');
  assert.typeOf(request.method, 'string', 'method is a string');
  assert.isUndefined(request.name, 'name is undefined');
  assert.isUndefined(request.type, 'type is undefined');
  assert.typeOf(request.url, 'string', 'url is a string');
  assert.typeOf(request.payload, 'string', 'payload is a string');
};

DataTestHelper.assertProjectObject = function(project) {
  assert.typeOf(project._id, 'string', '_id is a string');
  assert.typeOf(project.created, 'number', 'created is a number');
  assert.typeOf(project.updated, 'number', 'updated is a number');
  assert.typeOf(project.name, 'string', 'name is a string');
  assert.typeOf(project.order, 'number', 'order is a number');
  assert.isUndefined(project._oldId, '_oldId is cleared');
};

DataTestHelper.clone = function(obj) {
  let copy;
  if (null === obj || 'object' !== typeof obj) {
    return obj;
  }
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = DataTestHelper.clone(obj[i]);
    }
    return copy;
  }
  if (obj instanceof Object) {
    copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = DataTestHelper.clone(obj[attr]);
      }
    }
    return copy;
  }
  throw new Error('Unable to copy obj! Its type isn\'t supported.');
};

DataTestHelper.getDatastoreData = function(name) {
  /* global PouchDB */
  const db = new PouchDB(name);
  return db.allDocs({
    include_docs: true
  })
  .then(response => {
    return response.rows.map(item => item.doc);
  });
};

DataTestHelper.getDatastoreRequestData = function() {
  return DataTestHelper.getDatastoreData('saved-requests');
};
DataTestHelper.getDatastoreProjectsData = function() {
  return DataTestHelper.getDatastoreData('legacy-projects');
};
DataTestHelper.getDatastoreHistoryData = function() {
  return DataTestHelper.getDatastoreData('history-requests');
};
DataTestHelper.getDatastoreVariablesData = function() {
  return DataTestHelper.getDatastoreData('variables');
};
DataTestHelper.getDatastoreEnvironmentsData = function() {
  return DataTestHelper.getDatastoreData('variables-environments');
};
DataTestHelper.getDatastoreheadersData = function() {
  return DataTestHelper.getDatastoreData('headers-sets');
};
DataTestHelper.getDatastoreCookiesData = function() {
  return DataTestHelper.getDatastoreData('cookies');
};
DataTestHelper.getDatastoreWebsocketsData = function() {
  return DataTestHelper.getDatastoreData('websocket-url-history');
};
DataTestHelper.getDatastoreUrlsData = function() {
  return DataTestHelper.getDatastoreData('url-history');
};
DataTestHelper.getDatastoreAthDataData = function() {
  return DataTestHelper.getDatastoreData('auth-data');
};
DataTestHelper.getDatastoreHostRulesData = function() {
  return DataTestHelper.getDatastoreData('host-rules');
};
DataTestHelper.updateObject = function(dbName, obj) {
  const db = new PouchDB(name);
  return db.put(obj, {
    force: true
  });
};

DataTestHelper.updateRequestRandom = function(obj) {
  obj.name = chance.word();
  return DataTestHelper.updateObject('saved-requests', obj);
};
