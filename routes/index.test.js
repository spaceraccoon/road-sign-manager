const request = require('supertest');
const app = require('../app');
const models = require('../models');

beforeAll(async () => {
  await models.sequelize.sync({
    force: true,
  });
});

afterAll(() => {
  models.sequelize.close();
});

describe('Test the root path', () => {
  test('It should be rejected without proper authentication', () =>
    request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(401);
      }));

  test('It should successfully respond to the GET method', () =>
    request(app)
      .get('/')
      .auth(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD)
      .then(response => {
        expect(response.statusCode).toBe(200);
      }));
});
