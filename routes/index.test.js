const request = require('supertest');
const app = require('../app');

describe('Test the root path', () => {
  test('It should successfully respond to the GET method', () =>
    request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(200);
      }));
});
