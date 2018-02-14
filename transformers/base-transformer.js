'use strict';
/* global self */
var isNode = true;
if (typeof window !== 'undefined' || (typeof self !== 'undefined' && self.importScripts)) {
  isNode = false;
}
class _BaseTransformer {
  constructor(data) {
    this._data = data;
  }

  /**
   * Generates request's datastore ID value.
   *
   * @param {Object} item A request object property.
   * @param {?String} projectId If set it adds project information to the ID.
   * @return {String} Request ID value.
   */
  generateRequestId(item, projectId) {
    var name = (item.name || 'unknown name').toLowerCase();
    var url = (item.url || 'https://').toLowerCase();
    var method = (item.method || 'GET').toLowerCase();

    var id = encodeURIComponent(name) + '/';
    id += encodeURIComponent(url) + '/';
    id += method;
    if (projectId) {
      id += '/' + projectId;
    }
    return id;
  }

  get _lut() {
    if (this.__lut) {
      return this.__lut;
    }
    var lut = [];
    for (var i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    this.__lut = lut;
    return lut;
  }

  uuid() {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    var lut = this._lut;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] +
      lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' +
      lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] +
      lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
      lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  }

  /**
   * Sets hours, minutes, seconds and ms to 0 and returns timestamp.
   *
   * @return {Number} Timestamp to the day.
   */
  getDayToday(timestamp) {
    var d = new Date(timestamp);
    var tCheck = d.getTime();
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
    var url = item.url.toLowerCase();
    var method = item.method.toLowerCase();

    var today;
    try {
      today = this.getDayToday(timestamp);
    } catch (e) {
      today = this.getDayToday(Date.now());
    }
    var id = today + '/';
    id += encodeURIComponent(url) + '/';
    id += method;
    return id;
  }
}
if (isNode) {
  exports.BaseTransformer = _BaseTransformer;
} else {
  (window || self).BaseTransformer = _BaseTransformer;
}
