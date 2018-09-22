'use strict';
/*jshint -W098 */
/**
 * Base class for all transformers.
 * Includes common functions.
 */
class BaseTransformer {
  /**
   * @constructor
   * @param {Object} data Data to be transformed.
   */
  constructor(data) {
    this._data = data;
  }

  /**
   * Executes function in next event loop.
   *
   * @param {Function} fn A function to be executed in next event loop.
   */
  deffer(fn) {
    if (typeof Polymer !== 'undefined' && Polymer.RenderStatus) {
      Polymer.RenderStatus.afterNextRender(this, fn);
    } else if (typeof process !== 'undefined' && process.nextTick) {
      process.nextTick(fn.bind(this));
    } else if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(fn.bind(this));
    } else {
      setTimeout(fn.bind(this), 16);
    }
  }

  /**
   * Generates request's datastore ID value.
   *
   * @param {Object} item A request object property.
   * @param {?String} projectId If set it adds project information to the ID.
   * @return {String} Request ID value.
   */
  generateRequestId(item, projectId) {
    const name = (item.name || 'unknown name').toLowerCase();
    const url = (item.url || 'https://').toLowerCase();
    const method = (item.method || 'GET').toLowerCase();

    let id = encodeURIComponent(name) + '/';
    id += encodeURIComponent(url) + '/';
    id += method;
    if (projectId) {
      id += '/' + projectId;
    }
    return id;
  }
  /**
   * Helper for uuid();
   *
   * @return {Array<Number>}
   */
  get _lut() {
    if (this.__lut) {
      return this.__lut;
    }
    let lut = [];
    for (let i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    this.__lut = lut;
    return lut;
  }
  /**
   * Generates UUID.
   *
   * @return {String} UUID.
   */
  uuid() {
    let d0 = Math.random() * 0xffffffff | 0;
    let d1 = Math.random() * 0xffffffff | 0;
    let d2 = Math.random() * 0xffffffff | 0;
    let d3 = Math.random() * 0xffffffff | 0;
    let lut = this._lut;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] +
      lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' +
      lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
      lut[d2 & 0x3f | 0x80] +
      lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
      lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] +
      lut[d3 >> 24 & 0xff];
  }

  /**
   * Sets hours, minutes, seconds and ms to 0 and returns timestamp.
   *
   * @param {Number} timestamp Day's timestamp.
   * @return {Number} Timestamp to the day.
   */
  getDayToday(timestamp) {
    let d = new Date(timestamp);
    let tCheck = d.getTime();
    if (tCheck !== tCheck) {
      throw new Error('Invalid timestamp: ' + timestamp);
    }
    d.setMilliseconds(0);
    d.setSeconds(0);
    d.setMinutes(0);
    d.setHours(0);
    return d.getTime();
  }
  /**
   * Computes history item ID
   *
   * @param {Number} timestamp The timestamp to use
   * @param {Object} item History item
   * @return {String} Datastore ID
   */
  generateHistoryId(timestamp, item) {
    let url = item.url.toLowerCase();
    let method = item.method.toLowerCase();
    let today;
    try {
      today = this.getDayToday(timestamp);
    } catch (e) {
      today = this.getDayToday(Date.now());
    }
    let id = today + '/';
    id += encodeURIComponent(url) + '/';
    id += method;
    return id;
  }
  /**
   * Adds project reference to a request object.
   * @param {Object} request Request object to alter
   * @param {String} id Project id
   */
  addProjectReference(request, id) {
    if (!id) {
      return;
    }
    if (!request.projects) {
      request.projects = [];
    }
    if (request.projects.indexOf(id) === -1) {
      request.projects.push(id);
    }
  }
  /**
   * Adds request reference to a project object.
   * @param {Object} project Project object to alter
   * @param {String} id Request id
   */
  addRequestReference(project, id) {
    if (!id) {
      return;
    }
    if (!project.requests) {
      project.requests = [];
    }
    if (project.requests.indexOf(id) === -1) {
      project.requests.push(id);
    }
  }
}
