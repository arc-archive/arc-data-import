/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
/**
 * An element that offers access to the datastore for ARC objects.
 *
 * @customElement
 * @polymer
 * @memberof LogicElements
 */
class ImportDataStore extends PolymerElement {
  get _savedDb() {
    /* global PouchDB */
    return new PouchDB('saved-requests');
  }
  get _historyDb() {
    return new PouchDB('history-requests');
  }
  get _projectsDb() {
    return new PouchDB('legacy-projects');
  }
  get _socketUrlDb() {
    return new PouchDB('websocket-url-history');
  }
  get _urlDb() {
    return new PouchDB('url-history');
  }
  get _variablesDb() {
    return new PouchDB('variables');
  }
  get _variablesEnvsDb() {
    return new PouchDB('variables-environments');
  }
  get _headersSetsDb() {
    return new PouchDB('headers-sets');
  }
  get _cookiesDb() {
    return new PouchDB('cookies');
  }
  get _authDataDb() {
    return new PouchDB('auth-data');
  }
  get _hostRulesDb() {
    return new PouchDB('host-rules');
  }

  /**
   * Imports data into the data store.
   *
   * @param {Object} exportObj Normalized export object
   * @return {Promise} Promise resolved to list of error messages, if any.
   */
  importData(exportObj) {
    let errors = [];
    let promise;
    if (exportObj.requests && exportObj.requests.length) {
      promise = this.importRequests(exportObj.requests);
    } else {
      promise = Promise.resolve();
    }

    function handleInfo(info) {
      if (info && info.length) {
        errors = errors.concat(info);
      }
    }

    return promise
    .then((info) => {
      handleInfo(info);
      if (exportObj.projects && exportObj.projects.length) {
        return this.importProjects(exportObj.projects);
      }
    })
    .then((info) => {
      handleInfo(info);
      if (exportObj.history && exportObj.history.length) {
        return this.importHistory(exportObj.history);
      }
    })
    .then((info) => {
      handleInfo(info);
      const data = exportObj['websocket-url-history'];
      if (data && data.length) {
        return this.importWebsocketUrls(data);
      }
    })
    .then((info) => {
      handleInfo(info);
      const data = exportObj['url-history'];
      if (data && data.length) {
        return this.importUrls(data);
      }
    })
    .then((info) => {
      handleInfo(info);
      if (exportObj.cookies && exportObj.cookies.length) {
        return this.importCookies(exportObj.cookies);
      }
    })
    .then((info) => {
      handleInfo(info);
      const data = exportObj['auth-data'];
      if (data && data.length) {
        return this.importAuthData(data);
      }
    })
    .then((info) => {
      handleInfo(info);
      const data = exportObj['headers-sets'];
      if (data && data.length) {
        return this.importHeaders(data);
      }
    })
    .then((info) => {
      handleInfo(info);
      if (exportObj.variables && exportObj.variables.length) {
        return this.importVariables(exportObj.variables);
      }
    })
    .then((info) => {
      handleInfo(info);
      if (exportObj.variables && exportObj.variables.length) {
        return this._importEnvironments(exportObj.variables);
      }
    })
    .then((info) => {
      handleInfo(info);
      const data = exportObj['host-rules'];
      if (data && data.length) {
        return this.importHostRules(data);
      }
    })
    .then((info) => {
      handleInfo(info);
      return errors.length ? errors : undefined;
    });
  }

  importRequests(requests) {
    const db = this._savedDb;
    return db.bulkDocs(requests)
    .then((result) => {
      this.savedIndexes = this._listRequestIndex(result, requests, 'saved');
      return this._handleInsertResponse(result, requests, db);
    });
  }

  importProjects(projects) {
    const db = this._projectsDb;
    return db.bulkDocs(projects)
    .then((result) => this._handleInsertResponse(result, projects, db));
  }

  importHistory(history) {
    const db = this._historyDb;
    return db.bulkDocs(history)
    .then((result) => {
      this.historyIndexes = this._listRequestIndex(result, history, 'history');
      return this._handleInsertResponse(result, history, db);
    });
  }

  importWebsocketUrls(urls) {
    const db = this._socketUrlDb;
    return db.bulkDocs(urls)
    .then((result) => this._handleInsertResponse(result, urls, db));
  }

  importUrls(urls) {
    const db = this._urlDb;
    return db.bulkDocs(urls)
    .then((result) => this._handleInsertResponse(result, urls, db));
  }

  importCookies(data) {
    const db = this._cookiesDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  importAuthData(data) {
    const db = this._authDataDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  importHeaders(data) {
    const db = this._headersSetsDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  importHostRules(data) {
    const db = this._hostRulesDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  importVariables(data) {
    const db = this._variablesDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  importEnvironments(data) {
    const db = this._variablesEnvsDb;
    return db.bulkDocs(data)
    .then((result) => this._handleInsertResponse(result, data, db));
  }

  _importEnvironments(variables) {
    const userDefined = [];
    variables.forEach((item) => {
      if (item.environment && item.environment !== 'default') {
        let name = item.environment.toLowerCase();
        if (userDefined.indexOf(name) === -1) {
          userDefined.push(name);
        }
      }
    });
    if (!userDefined.length) {
      return Promise.resolve();
    }
    const db = this._variablesEnvsDb;
    db.allDocs({
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      include_docs: true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    })
    .then((response) => {
      if (response && response.rows.length) {
        response.rows.forEach((item) => {
          let doc = item.doc;
          let name = doc.name.toLowerCase();
          let index = userDefined.indexOf(name);
          if (index > -1) {
            userDefined.splice(index, 1);
          }
        });
      }
    })
    .then(() => {
      if (!userDefined.length) {
        return;
      }
      const docs = userDefined.map((name) => {
        return {
          name: name,
          created: Date.now()
        };
      });
      return db.bulkDocs(docs);
    });
  }

  _handleInsertResponse(result, items, db) {
    const conflicted = [];
    const errors = [];

    result.forEach((item, index) => {
      if (item.error && item.status === 409) {
        conflicted[conflicted.length] = items[index];
      } else if (item.error) {
        console.error('Can not insted saved request into the datastore.', item);
        errors.push(item.messsage);
      }
    });
    if (conflicted.length) {
      return this._handleConflictedInserts(db, conflicted)
      .then((result) => {
        if (!result) {
          return errors;
        }
        return errors.concat(result);
      });
    }
  }

  _handleConflictedInserts(db, conflicted) {
    const errors = [];
    const keys = conflicted.map((item) => item._id);
    return db.allDocs({keys: keys})
    .then((result) => {
      let promises = result.rows.map((i, index) =>
        this.__handleConflictedItem(db, conflicted, i, index));
      return Promise.all(promises);
    })
    .then((data) => db.bulkDocs(data))
    .then((response) => {
      response.forEach((item) => {
        if (item.error) {
          errors.push(item.messsage);
        }
      });
      return errors.length ? errors : undefined;
    });
  }
  /**
   * Handles datastore conflict for datastore object.
   *
   * @param {Object} db PouchDB reference to the data store.
   * @param {Array} conflicted List of conflicted items
   * @param {Object} item Conflicted item.
   * @param {Number} index Index of conflicted item in `conflicted` array
   * @return {Promise}
   */
  __handleConflictedItem(db, conflicted, item, index) {
    if (item.value.deleted) {
      return db.get(item.id, {rev: item.value.rev})
      .then((response) => {
        response._deleted = false;
        return db.put(response);
      })
      .then((result) => {
        conflicted[index]._rev = result.rev || result._rev;
        return conflicted[index];
      });
    }
    conflicted[index]._rev = item.value.rev;
    return Promise.resolve(conflicted[index]);
  }
  /**
   * Lists all requests that should be added to URL index.
   * It builds an array of requests are required by `arc-models/url-indexer`
   * element.
   *
   * @param {Array<Object>} result PouchDB bulk insert response
   * @param {Array<Object>} requests Inserted requests
   * @param {String} type Request type, `saved` or `history`
   * @return {Array<Object>|undefined}
   */
  _listRequestIndex(result, requests, type) {
    const index = [];
    result.forEach((item, i) => {
      if (item.error) {
        return;
      }
      index[index.length] = {
        id: item.id,
        url: requests[i].url,
        type
      };
    });
    return index.length ? index : undefined;
  }
}
window.customElements.define('import-data-store', ImportDataStore);
