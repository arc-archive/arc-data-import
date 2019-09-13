import { BaseTransformer } from './base-transformer.js';
/**
 * Transforms Dexie system (legacy system) into current data model.
 */
export class ArcDexieTransformer extends BaseTransformer {
  /**
   * Transforms legacy ARC export object based on Dexie data store
   * into current export data model.
   *
   * @return {Object} New data model object.
   */
  transform() {
    return this._parseRequests(this._data.requests)
    .then((result) => {
      const projects = this._processProjects(this._data.projects);
      return {
        projects: projects,
        data: this._associateProjects(result, projects)
      };
    })
    .then((data) => {
      const result = {
        createdAt: new Date().toISOString(),
        version: 'unknown',
        kind: 'ARC#Import',
        requests: data.data.saved ? data.data.saved.map((item) => item.request) : [],
        projects: data.projects ? data.projects.map((item) => item.legacyProject) : [],
        history: data.data.history ? data.data.history.map((item) => item.request) : []
      };
      // TODO: handle history data.
      return result;
    });
  }
  /**
   * In new structure projects do not have a refference to request ids. It's
   * the other way around in previous system.
   * It's a bad pattern for object stores but it must suffice for now.
   * @param {?Array} projects List of projects in the import.
   * @return {Array} preprocessed projects array
   */
  _processProjects(projects) {
    if (!projects || !projects.length) {
      return [];
    }
    const list = [];
    projects.forEach((item) => {
      const result = this._processProjectItem(item);
      if (result) {
        list.push(result);
      }
    });
    return list;
  }
  /**
   * Creates a pre-processed project data.
   *
   * @param {Object} item Project object from the import.
   * @return {Object} Pre-processed project object with project store data
   * under the `legacyProject` property and list of requests IDs under
   * the `updateData` property.
   */
  _processProjectItem(item) {
    if (!item.requestIds || !item.requestIds.length) {
      return;
    }
    return {
      updateData: item.requestIds,
      legacyProject: {
        _id: this.uuid(),
        name: item.name,
        order: item.order,
        updated: item.updateTime,
        created: item.created
      }
    };
  }
  /**
   * History is placed in its own store, saved items has own store.
   * Har data are not imported this way as user cannot actually use it.
   *
   * @param {Array} requests List of requests objects from the import file.
   * @return {Promise} A promise resolved when import is ready.
   */
  _parseRequests(requests) {
    return new Promise((resolve) => {
      this._parseRequestsDeffered(requests, resolve);
    })
    .then((result) => {
      // remove duplicates from the history.
      const ids = [];
      result.history = result.history.filter((item) => {
        if (ids.indexOf(item.request._id) === -1) {
          ids[ids.length] = item.request._id;
          return true;
        }
        return false;
      });
      return result;
    });
  }
  /**
   * Parses the request data.
   * It takes only portion of the data to parse so the script release the
   * event loop and ANR screen won't appear.
   *
   * @param {Array} requests List of requests from the import.
   * @param {Function} done A callkback function to be called when ready.
   * @param {?Array} saved Final list of saved requests
   * @param {?Array} history Final list of history items.
   */
  _parseRequestsDeffered(requests, done, saved, history) {
    saved = saved || [];
    history = history || [];
    if (requests.length === 0) {
      done({
        saved: saved,
        history: history
      });
      return;
    }
    const len = Math.min(requests.length, 200);
    // Up to 200 loop iteration at once.
    // Then the function return and release main loop.
    for (let i = 0; i < len; i++) {
      const item = requests[i];
      if (item.type === 'history') {
        const result = this._parseHistoryItem(item);
        history.push({
          origin: result.originId,
          request: result.request
        });
      } else if (item.type === 'saved') {
        const result = this._parseSavedItem(item);
        saved.push({
          origin: result.originId,
          request: result.request
        });
      } else if (item.type === 'drive') {
        const result = this._parseDriveItem(item);
        saved.push({
          origin: result.originId,
          request: result.request
        });
      }
    }
    requests.splice(0, len);
    if (typeof process !== 'undefined' && process.nextTick) {
      process.nextTick(() => {
        this._parseRequestsDeffered(requests, done, saved, history);
      });
    } else if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        this._parseRequestsDeffered(requests, done, saved, history);
      });
    } else {
      setTimeout(() => {
        this._parseRequestsDeffered(requests, done, saved, history);
      }, 16);
    }
  }

  _parseHistoryItem(item) {
    item.updateTime = item.updateTime || Date.now();
    const id = this.generateHistoryId(item.updateTime, item);
    const obj = {
      _id: id,
      method: item.method,
      url: item.url,
      updated: new Date(item.updateTime).getTime()
    };
    // payload and headers
    const har = item._har || item.har;
    const entries = har.entries;
    const entry = entries[entries.length - 1];
    if (entry) {
      const harRequest = entry.request;
      obj.headers = this._parseHarHeders(harRequest.headers);
      obj.payload = harRequest.postData.text;
      let t = new Date(entry.startedDateTime).getTime();
      if (t !== t) {
        t = Date.now();
      }
      obj.created = t;
    } else {
      obj.created = obj.updated;
    }
    obj.updated = Date.now();
    return {
      originId: item.id,
      request: obj
    };
  }

  _parseSavedItem(item) {
    const requestName = item.name || item._name;
    let keyName = requestName;
    if (keyName && keyName[0] === '_') {
      keyName = keyName.substr(1);
    }
    // This is not the latest id structure but will avoid duplicates
    const id = this.generateRequestId({
      name: keyName,
      url: item.url,
      method: item.method
    });
    const obj = {
      _id: id,
      name: requestName,
      method: item.method,
      url: item.url,
      type: 'saved',
      queryModel: [],
      headersModel: []
    };
    // payload and headers
    const harIndex = item.referenceEntry || 0;
    const har = item._har || item.har;
    if (har) {
      const entries = har.entries;
      let entry;
      if (harIndex || harIndex === 0) {
        entry = entries[harIndex];
      } else {
        entry = entries[0];
      }
      if (entry) {
        const harRequest = entry.request;
        obj.headers = this._parseHarHeders(harRequest.headers);
        obj.payload = harRequest.postData.text;
        let t = new Date(entry.startedDateTime).getTime();
        if (t !== t) {
          t = Date.now();
        }
        obj.created = t;
      }
    }
    obj.updated = Date.now();

    return {
      originId: item.id,
      request: obj
    };
  }

  _parseDriveItem(item) {
    const result = this._parseSavedItem(item);
    result.request.driveId = item.driveId;
    return result;
  }

  _parseHarHeders(arr) {
    if (!arr || !arr.length) {
      return '';
    }
    return arr.map((item) => {
      return item.name + ': ' + item.value;
    }).join('\n');
  }
  /**
   * Associate requests with project data.
   *
   * @param {Object} data Parsed requests object
   * @param {Array} projects List of projects
   * @return {Object} Parsed requests object
   */
  _associateProjects(data, projects) {
    if (!projects || !projects.length) {
      return data;
    }
    data.saved = data.saved || [];
    const savedLen = data.saved.length;
    const projectsLen = projects.length;
    for (let i = 0; i < projectsLen; i++) {
      const project = projects[i];
      const newProjectId = project.legacyProject._id;
      for (let j = 0, rLen = project.updateData.length; j < rLen; j++) {
        const rId = project.updateData[j];
        for (let k = 0; k < savedLen; k++) {
          if (data.saved[k].origin === rId) {
            const request = data.saved[k].request;
            request._id += '/' + newProjectId;
            this.addProjectReference(request, newProjectId);
            this.addRequestReference(project.legacyProject, request._id);
            break;
          }
        }
      }
    }
    return data;
  }
}
