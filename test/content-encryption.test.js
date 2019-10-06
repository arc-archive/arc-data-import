import { assert, fixture } from '@open-wc/testing';
import { DataTestHelper } from './test-helper.js';
import * as sinon from 'sinon/pkg/sinon-esm.js';

import '../arc-data-import.js';
suite('Content decryption', function() {
  async function basicFixture() {
    return await fixture(`
      <arc-data-import></arc-data-import>
    `);
  }

  const passphrase = 'test';

  let fileContent;
  let element;
  suiteSetup(async () => {
    fileContent = await DataTestHelper.getFile('pouch-encrypted-export.arc');
  });

  setup(async () => {
    element = await basicFixture();
  });

  function decFactory(e) {
    e.preventDefault();
    /* global CryptoJS */
    const bytes = CryptoJS.AES.decrypt(e.detail.data, passphrase);
    const decoded = bytes.toString(CryptoJS.enc.Utf8);
    e.detail.result = Promise.resolve(decoded);
  }

  suiteTeardown(() => {
    window.removeEventListener('encryption-decode', decFactory);
  });

  function contentToFile(content) {
    const file = new Blob([content], { type: 'application/json' });
    file.name = 'arc-export.arc';
    return file;
  }

  test('decryption throws error when event not handled', async () => {
    let err;
    try {
      await element._decryptFile(fileContent);
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'Error was thrown');
    assert.equal(err.message, 'Unable to decode encrypted file.');
  });

  test('requests to encrypt the file when normalizeImportData()', async () => {
    window.addEventListener('encryption-decode', decFactory);
    const spy = sinon.spy();
    element.addEventListener('encryption-decode', spy);
    await element.normalizeImportData(fileContent);
    assert.isTrue(spy.called);
  });

  test('returns processed data when normalizing content', async () => {
    window.addEventListener('encryption-decode', decFactory);
    const result = await element.normalizeImportData(fileContent);
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, '9.14.64.305');
    assert.equal(result.kind, 'ARC#Import');
  });

  test('requests to encrypt the file procssing file data', async () => {
    window.addEventListener('encryption-decode', decFactory);
    const spy = sinon.spy();
    element.addEventListener('encryption-decode', spy);
    const blob = contentToFile(fileContent);
    await element._processFileData(blob);
    assert.isTrue(spy.called);
  });

  test('returns processed data for import-process-file event', async () => {
    window.addEventListener('encryption-decode', decFactory);
    const blob = contentToFile(fileContent);
    const e = new CustomEvent('import-process-file', {
      cancelable: true,
      bubbles: true,
      detail: {
        file: blob
      }
    });
    document.body.dispatchEvent(e);
    const result = await e.detail.result;
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, '9.14.64.305');
    assert.equal(result.kind, 'ARC#Import');
  });

  test('returns processed data for import-data-data event', async () => {
    window.addEventListener('encryption-decode', decFactory);
    const e = new CustomEvent('import-process-data', {
      cancelable: true,
      bubbles: true,
      detail: {
        data: fileContent
      }
    });
    document.body.dispatchEvent(e);
    const result = await e.detail.result;
    assert.typeOf(result.createdAt, 'string');
    assert.equal(result.version, '9.14.64.305');
    assert.equal(result.kind, 'ARC#Import');
  });
});
