[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/arc-data-import.svg)](https://www.npmjs.com/package/@advanced-rest-client/arc-data-import)

[![Build Status](https://travis-ci.org/advanced-rest-client/arc-data-import.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/arc-data-import)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/arc-data-import)

## &lt;arc-data-import&gt;

An element that imports data into the ARC datastore.

Currently the element imports the following formats:

- ARC original format
- ARC format for Dexie data store
- ARC format for PouchDB (current)
- Postman v1 collections
- Postman v2 collections
- Postman backup data
- Postamn environment data

Planned suupport for:

- HAR files

```html
<arc-data-import></arc-data-import>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/arc-data-import
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/arc-data-import/arc-data-import.js';
    </script>
  </head>
  <body>
    <arc-data-import></arc-data-import>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/arc-data-import/arc-data-import.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <arc-data-import></arc-data-import>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/arc-data-import
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
