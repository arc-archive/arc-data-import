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
import { LitElement } from 'lit-element';
import 'pouchdb/dist/pouchdb.js';
/**
 * An element that offers access to the datastore for ARC objects.
 *
 * @customElement
 * @memberof LogicElements
 */
class ImportDataStore extends LitElement {
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
  async importData(exportObj) {
    let errors = [];
    function handleInfo(info) {
      if (info && info.length) {
        errors = errors.concat(info);
      }
    }
    if (exportObj.requests && exportObj.requests.length) {
      const result = await this.importRequests(exportObj.requests);
      handleInfo(result);
    }
    if (exportObj.projects && exportObj.projects.length) {
      const result = await this.importProjects(exportObj.projects);
      handleInfo(result);
    }
    if (exportObj.history && exportObj.history.length) {
      const result = await this.importHistory(exportObj.history);
      handleInfo(result);
    }
    const wuh = exportObj['websocket-url-history'];
    if (wuh && wuh.length) {
      const result = await this.importWebsocketUrls(wuh);
      handleInfo(result);
    }
    const uh = exportObj['url-history'];
    if (uh && uh.length) {
      const result = await this.importUrls(uh);
      handleInfo(result);
    }
    if (exportObj.cookies && exportObj.cookies.length) {
      const result = await this.importCookies(exportObj.cookies);
      handleInfo(result);
    }
    const ad = exportObj['auth-data'];
    if (ad && ad.length) {
      const result = await this.importAuthData(ad);
      handleInfo(result);
    }
    const hs = exportObj['headers-sets'];
    if (hs && hs.length) {
      const result = await this.importHeaders(hs);
      handleInfo(result);
    }
    if (exportObj.variables && exportObj.variables.length) {
      const result = await this.importVariables(exportObj.variables);
      handleInfo(result);
    }
    if (exportObj.variables && exportObj.variables.length) {
      const result = await this._importEnvironments(exportObj.variables);
      handleInfo(result);
    }
    const hr = exportObj['host-rules'];
    if (hr && hr.length) {
      const result = await this.importHostRules(hr);
      handleInfo(result);
    }
    return errors.length ? errors : undefined;
  }

  async importRequests(requests) {
    const db = this._savedDb;
    const result = await db.bulkDocs(requests);
    this.savedIndexes = this._listRequestIndex(result, requests, 'saved');
    return await this._handleInsertResponse(result, requests, db);
  }

  async importProjects(projects) {
    const db = this._projectsDb;
    const result = await db.bulkDocs(projects)
    return await this._handleInsertResponse(result, projects, db);
  }

  async importHistory(history) {
    const db = this._historyDb;
    const result = await db.bulkDocs(history);
    this.historyIndexes = this._listRequestIndex(result, history, 'history');
    return await this._handleInsertResponse(result, history, db);
  }

  async importWebsocketUrls(urls) {
    const db = this._socketUrlDb;
    const result = await db.bulkDocs(urls)
    return await this._handleInsertResponse(result, urls, db);
  }

  async importUrls(urls) {
    const db = this._urlDb;
    const result = await db.bulkDocs(urls)
    return await this._handleInsertResponse(result, urls, db);
  }

  async importCookies(data) {
    const db = this._cookiesDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async importAuthData(data) {
    const db = this._authDataDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async importHeaders(data) {
    const db = this._headersSetsDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async importHostRules(data) {
    const db = this._hostRulesDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async importVariables(data) {
    const db = this._variablesDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async importEnvironments(data) {
    const db = this._variablesEnvsDb;
    const result = await db.bulkDocs(data)
    return await this._handleInsertResponse(result, data, db);
  }

  async _importEnvironments(variables) {
    const userDefined = [];
    variables.forEach((item) => {
      if (item.environment && item.environment !== 'default') {
        const name = item.environment.toLowerCase();
        if (userDefined.indexOf(name) === -1) {
          userDefined.push(name);
        }
      }
    });
    if (!userDefined.length) {
      return;
    }
    const db = this._variablesEnvsDb;
    const response = await db.allDocs({
      include_docs: true
    });
    if (response && response.rows.length) {
      response.rows.forEach((item) => {
        const doc = item.doc;
        const name = doc.name.toLowerCase();
        const index = userDefined.indexOf(name);
        if (index > -1) {
          userDefined.splice(index, 1);
        }
      });
    }
    if (!userDefined.length) {
      return;
    }
    const docs = userDefined.map((name) => {
      return {
        name: name,
        created: Date.now()
      };
    });
    await db.bulkDocs(docs);
  }

  async _handleInsertResponse(result, items, db) {
    const conflicted = [];
    const errors = [];

    result.forEach((item, index) => {
      if (item.error && item.status === 409) {
        conflicted[conflicted.length] = items[index];
      } else if (item.error) {
        errors.push(item.messsage);
      }
    });
    if (conflicted.length) {
      const result = await this._handleConflictedInserts(db, conflicted);
      if (!result) {
        return errors;
      }
      return errors.concat(result);
    }
  }

  async _handleConflictedInserts(db, conflicted) {
    const errors = [];
    const keys = conflicted.map((item) => item._id);
    const result = await db.allDocs({ keys })
    const data = [];
    for (let i = 0, len = result.rows.length; i < len; i++) {
      const item = result.rows[i];
      data[data.length] = await this.__handleConflictedItem(db, conflicted, item, i);
    }
    const insertResponse = await db.bulkDocs(data);
    insertResponse.forEach((item) => {
      if (item.error) {
        errors.push(item.messsage);
      }
    });
    return errors.length ? errors : undefined;
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
  async __handleConflictedItem(db, conflicted, item, index) {
    if (item.value.deleted) {
      const response = await db.get(item.id, { rev: item.value.rev });
      response._deleted = false;
      const result = await db.put(response);
      conflicted[index]._rev = result.rev;
      return conflicted[index];
    }
    conflicted[index]._rev = item.value.rev;
    return conflicted[index];
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
