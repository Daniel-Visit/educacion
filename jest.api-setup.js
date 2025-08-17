// Mock de Request para tests de API
global.Request = class MockRequest {
  constructor(input, init = {}) {
    this._url = typeof input === 'string' ? input : input?.url || '';
    this.method = init.method || 'GET';
    this.body = init.body || null;
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  get url() {
    return this._url;
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
};

// Mock de NextResponse
global.NextResponse = {
  json: jest.fn((data, init = {}) => ({
    json: () => data,
    status: init.status || 200,
  })),
};
