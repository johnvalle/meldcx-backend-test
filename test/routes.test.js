const request = require('supertest');
const path = require('path');
const app = require('../src/app');

let testPublicKey = null;
let testPrivateKey = null;

/**
 * Test for uploading files
 */
describe('POST /api/files/', () => {
  /**
   * Note: Test fails when MAX_DAILY_LIMIT is reached. When it happens, just adjust it in constants.
   */
  it('should upload file', (done) => {
    request(app)
      .post('/api/file')
      .attach('file', path.join(__dirname, 'sample-file.txt'))
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('publicKey');
        expect(res.body).toHaveProperty('privateKey');
        // assign to variables to be used in other tests
        testPublicKey = res.body.publicKey;
        testPrivateKey = res.body.privateKey;
        done();
      })
      .catch((err) => done(err));
  });

  it('should return an error if file is not attached', (done) => {
    request(app)
      .post('/api/file')
      .attach('file', null)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty('error');
        done();
      })
      .catch((err) => done(err));
  });

  it('should return an error if file will exceed upload limits', (done) => {
    request(app)
      .post('/api/file')
      .attach('file', path.join(__dirname, 'sample-large-image.jpg'))
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty('error', 'Exceed limit');
        done();
      })
      .catch((err) => done(err));
  });
});

/**
 * Test for download files
 */
describe('GET /api/file/:publicKey', () => {
  it('should return a file', (done) => {
    const url = `/api/file/${testPublicKey}`;
    request(app)
      .get(url)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('path');
        expect(res.body).toHaveProperty('mimetype');
        expect(res.body).toHaveProperty('filename');
        done();
      });
  });

  it('should return an error if publicKey is incorrect', (done) => {
    const url = '/api/file/some-incorrect-id';
    request(app)
      .get(url)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty('error', 'Not found');
        done();
      })
      .catch((err) => done(err));
  });
});

/**
 * Test for removing files
 */
describe('DELETE /api/file/:publicKey', () => {
  it('should remove a file', (done) => {
    const url = `/api/file/${testPrivateKey}`;
    request(app)
      .delete(url)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('message', 'File has been removed sucessfully.');
        done();
      });
  });

  it('should return an error if privateKey is incorrect', (done) => {
    const url = '/api/file/some-incorrect-id';
    request(app)
      .delete(url)
      .expect(400)
      .then((res) => {
        expect(res.body).toHaveProperty('error', 'Not found');
        done();
      })
      .catch((err) => done(err));
  });
});
