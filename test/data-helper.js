const DataHelper = {};

DataHelper.generateArcImportFile = () => {
  const data = `{
    "createdAt": "2019-02-02T21:58:25.467Z",
    "version": "13.0.0-alpha.3",
    "kind": "ARC#AllDataExport",
    "requests": []
  }`;
  const file = new Blob([data], {type: 'application/json'});
  file.name = 'arc-export.json';
  return file;
};

DataHelper.generateElectronBuffer = () => {
  const data = `{
    "createdAt": "2019-02-02T21:58:25.467Z",
    "version": "13.0.0-alpha.3",
    "kind": "ARC#AllDataExport",
    "requests": [{}]
  }`;
  const uint8 = new Uint8Array([10, 20, 30, 40, 50]);
  uint8.toString = () => {
    return data;
  };
  return uint8;
};

DataHelper.generateRamlUnknownFile = () => {
  const data = `#%RAML 1.0
  baseUri: https://api.domain.com
  `;
  const file = new Blob([data]);
  return file;
};
DataHelper.generateOas2JsonUnknownFile = () => {
  const data = `{"swagger": true}`;
  const file = new Blob([data]);
  return file;
};

DataHelper.generateJsonErrorFile = () => {
  const data = `{swagger: true}`;
  const file = new Blob([data]);
  return file;
};


DataHelper.generateSingleRequestImport = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#RequestData',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
    }],
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#AllDataExport'
  };
};

DataHelper.generateMultiRequestImport = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#RequestData',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
    }, {
      key: '20013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#RequestData',
      updated: 1545502958057,
      created: 1545363890464,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/other',
    }],
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#AllDataExport'
  };
};

DataHelper.generateProjectImportOpen = () => {
  return {
    requests: [{
      key: '11013905-9b5a-49d9-adc8-f76ec3ead2f1',
      kind: 'ARC#RequestData',
      updated: 1545502958053,
      created: 1545363890469,
      headers: 'Content-Type: application/json\nContent-Length: 2',
      method: 'POST',
      payload: '{}',
      url: 'https://www.domain.com/customers',
      projects: ['24550674-868e-411c-9359-09e59c91956c']
    }],
    projects: [{
      order: 0,
      requests: ['11013905-9b5a-49d9-adc8-f76ec3ead2f1'],
      name: 'Response actions',
      updated: 1549390841631,
      created: 1549390841631,
      kind: 'ARC#ProjectData',
      key: '24550674-868e-411c-9359-09e59c91956c'
    }],
    loadToWorkspace: true,
    createdAt: '2019-02-02T21:58:25.467Z',
    version: '13.0.0',
    kind: 'ARC#ProjectExport'
  };
};
