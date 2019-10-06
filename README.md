[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-data-import.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-data-import)

[![Build Status](https://travis-ci.org/advanced-rest-client/arc-data-import.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/arc-data-import)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/arc-data-import)

## &lt;arc-data-import&gt;

An element that imports data into the ARC datastore.

Currently the element imports the following formats:

-   ARC original format
-   ARC format for Dexie data store
-   ARC format for PouchDB (current)
-   Postman v1 collections
-   Postman v2 collections
-   Postman backup data
-   Postamn environment data

Planned support for:

-   HAR files

The component reads the file and try to recognize file content. If it find an API specification file it dispatches `api-process-file`
custom event for the application to handle API data.

## Usage

### Installation
```
npm install --save @advanced-rest-client/arc-data-import
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/arc-data-import/arc-data-import.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <arc-data-import></arc-data-import>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### File decryption

The component discovers when the file was previously encoded using AES provided by
[crypto-js](https://www.npmjs.com/package/crypto-js) library.
`arc-data-export` adds `aes` in the first line of the file which is used in ARC as an anchor to know whether the file was encoded.
If the file was encoded the element dispatches `encryption-decode` event with the `data` set on the `detail` object
and `aes` value set on `detail.method`. The application must support this event or it result in error otherwise.

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-data-import
cd arc-data-import
npm i
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
