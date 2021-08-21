const request = require('supertest');

const app = require('../src/app');

describe('POST /api/files/upload', () => {
  it('responds with a json message', (done) => {
    request(app)
      .post('/api/file/upload')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        upload: true
      }, done);
  });
});

describe('GET /api/files/download', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/file/download')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        download: true
      }, done);
  });
});

describe('DELETE /api/file/remove', () => {
  it('responds with a json message', (done) => {
    request(app)
      .delete('/api/file/remove')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        remove: true
      }, done);
  });
});
