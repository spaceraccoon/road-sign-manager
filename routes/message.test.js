const request = require('supertest');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../app');

beforeAll(() => {
  const mock = new MockAdapter(axios);
  mock.onPost(process.env.ROAD_SIGN_URL).reply(200, {});
});

describe('Test message paths', () => {
  describe('Test manual message paths', () => {
    test('It should raise an error for an incorrect POST request', () =>
      request(app)
        .post('/message/manual')
        .type('form')
        .send({ message: '01' })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain(
            'Please enter a valid binary string. See above for details.',
          );
        }));
    test('It should successfully respond to a correct POST request', () =>
      request(app)
        .post('/message/manual')
        .type('form')
        .send({
          message:
            '011001010110100101010011100010010110011001011110111100101111000001011000110010110010010101001101110110000101010001111000100100000010011000111110101010000010110001111111110100011010011110011010110100100100101001010001100100001001010110010001101110100011100011100010010001011101100011001100000100000011110111101110100111001000000000101001101101111011100111110011111111001001011010001011100010100001101010111101110101111010111000010010111010101001011001111000110100101101011110111010100110011001101100011100101101100000011001001100110001001001100101101101100010100101100101011101100011110011110000111001100101110000011000000000110011000011110101100010111110111100111010001011110001011010110000100110101111011101100001111111100100100100000100010011000000110000000011000011101000100001011001000000000011100111001110011001000001111011101001110011110100011000001110000110111001111100101111001001010101010101010100001000101001111010110111110011010110100010010110111100011110000101111101101011010111010000001000011001100101111000111101100110110000101101011101111001111101110101001000110111111101010111001000100110001010010100101000111100001000010011001000001010110101100011101110000110000001110100011001010011100101001000010111110110110010100000110011110011100111110001101101100001100011101000110010010011110000000010111011100011101101111001111100010000010010101011010011111100001100110001110101101011111010100110000000100101011010000000010010011110011000110101011101100110001100010101110111011011100111101110100000001000000100101110100001001101110001001010000001010111010101010010011111111110000101000110011100110011101011001011100001000010100010000110000101111001011111100110111010010001101101001110010010110000011011111111001110001101111100111011000011011101101111001100111110001111100001110111100110000111011101101100010111011101110111001011000111110101100000110000010100010111010000101010010101100100011101000011000001011011101010001111101111100101101011111101111101001110111011001010011111101100110011010101011011110000010001011111100010101111101010111101011100000100011101101011100101001001011010101101111110000011000110010110010010000001101011011100110010010010011001111011111101000100111001111000001101000000111100101100100010001100000100100110001100100101111110001001110011100011110101100101000011001111100001101011110101010010101010001111010101010000010110000010110010101011110100011010011111111010001110100101100101001011001110001110001011110111001101011101111001010100000111001001011101000010100010111101000101100011110001001011101010010100011101101000000101010111001110011010001011111000',
        })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain('Success!');
        }));
  });
  describe('Test text message paths', () => {
    test('It should raise an error for an incorrect POST request', () =>
      request(app)
        .post('/message/text')
        .type('form')
        .send({ line1: '' })
        .then(response => {
          const mock = new MockAdapter(axios);
          mock.onPost(process.env.ROAD_SIGN_URL).reply(200, {});
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain(
            'Please enter a valid message for line 1. See above for details.',
          );
        }));
    test('It should raise an error for an incorrect POST request', () =>
      request(app)
        .post('/message/text')
        .type('form')
        .send({ line1: 'This line is too long for line one' })
        .then(response => {
          const mock = new MockAdapter(axios);
          mock.onPost(process.env.ROAD_SIGN_URL).reply(200, {});
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain(
            'Please enter a valid message for line 1. See above for details.',
          );
        }));
    test('It should successfully respond to a correct POST request', () =>
      request(app)
        .post('/message/text')
        .type('form')
        .send({
          line1: 'Hello',
          line2: 'World',
        })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain('Success!');
        }));
  });

  describe('Test image message paths', () => {
    test('It should raise an error for an incorrect POST request', () =>
      request(app)
        .post('/message/image')
        .type('form')
        .send({ message: 'notanimagefile' })
        .then(response => {
          const mock = new MockAdapter(axios);
          mock.onPost(process.env.ROAD_SIGN_URL).reply(200, {});
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain(
            'Please enter a valid image URL, of type .png or .jpeg',
          );
        }));
    test('It should successfully respond to a correct POST request', () =>
      request(app)
        .post('/message/image')
        .type('form')
        .send({
          message:
            'https://en.facebookbrand.com/wp-content/uploads/2016/05/FB-fLogo-Blue-broadcast-2.png',
        })
        .then(response => {
          expect(response.statusCode).toBe(200);
          expect(response.text).toContain('Success!');
        }));
  });
});
