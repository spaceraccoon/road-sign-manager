const express = require('express');
const axios = require('axios');

const { Garage, Sign } = require('../models');

const router = express.Router();

async function renderSettings(req, res) {
  res.render('settings', {
    title: 'Settings',
    flash: req.flash || null,
    garages: await Garage.findAll({
      raw: true,
      order: [['name', 'ASC']],
    }),
    signs: await Sign.findAll({
      raw: true,
      order: [['name', 'ASC']],
    }),
  });
}

/* GET settings page. */
router.get('/', renderSettings);

/* POST create garage. */
router.post(
  '/create-garage',
  async (req, res, next) => {
    let errors;
    try {
      req.checkBody('name', 'Please enter a valid garage name.').isLength({
        min: 1,
        max: 255,
      });
      req
        .checkBody('garageId', 'Please enter a valid Smarking garage ID.')
        .custom(garageId =>
          axios.get(
            `https://my.smarking.net/api/users/v1/garages/id/${garageId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.SMARKING_KEY}`,
              },
            },
          ),
        );
      // req.checkBody('garageId', `Garage already exists.`).custom(
      //   async garageId =>
      //     new Promise(async (resolve, reject) => {
      //       const garage = await Garage.findOne({
      //         where: {
      //           garageId,
      //         },
      //       });
      //       if (garage) {
      //         reject(new Error('Garage already exists'));
      //       } else {
      //         resolve();
      //       }
      //     }),
      // );
      try {
        await req.asyncValidationErrors();
      } catch (e) {
        errors = e;
      }
      if (errors) {
        throw errors;
      } else {
        const newGarage = await Garage.create({
          garageId: req.body.garageId,
          name: req.body.name,
        });
        req.flash = {
          type: 'alert-success',
          messages: [
            {
              msg: `Created ${newGarage.name}.`,
            },
          ],
        };
      }
    } catch (e) {
      console.error(e);
      req.flash = {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to apply settings!',
          },
        ],
      };
    }
    next();
  },
  renderSettings,
);

/* POST delete garage. */
router.post(
  '/delete-garage',
  async (req, res, next) => {
    let errors;
    let garage;
    try {
      req.checkBody('id', 'Please enter a valid garage id.').exists();
      req.checkBody('id', 'Please enter a valid garage id.').custom(
        async id =>
          new Promise(async (resolve, reject) => {
            garage = await Garage.findById(id);
            if (garage) {
              resolve();
            } else {
              reject(new Error('No garage found.'));
            }
          }),
      );
      try {
        await req.asyncValidationErrors();
      } catch (e) {
        errors = e;
      }
      if (errors) {
        throw errors;
      } else {
        await Garage.destroy({
          where: {
            id: req.body.id,
          },
        });
        req.flash = {
          type: 'alert-success',
          messages: [
            {
              msg: `Destroyed ${garage.name}.`,
            },
          ],
        };
      }
    } catch (e) {
      console.error(e);
      req.flash = {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to apply settings!',
          },
        ],
      };
    }
    next();
  },
  renderSettings,
);

/* POST create sign. */
router.post(
  '/create-sign',
  async (req, res, next) => {
    let errors;
    try {
      req.checkBody('name', 'Please enter a valid sign name.').isLength({
        min: 1,
        max: 255,
      });
      req
        .checkBody('url', 'Please enter a valid sign URL.')
        .matches(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/,
          'i',
        );
      req.checkBody('url', `Sign URL already exists.`).custom(
        async url =>
          new Promise(async (resolve, reject) => {
            const sign = await Sign.findOne({
              where: {
                url,
              },
            });
            if (sign) {
              reject(new Error('Sign URL already exists'));
            } else {
              resolve();
            }
          }),
      );
      try {
        await req.asyncValidationErrors();
      } catch (e) {
        errors = e;
      }
      if (errors) {
        throw errors;
      } else {
        const newSign = await Sign.create({
          name: req.body.name,
          url: req.body.url,
        });
        req.flash = {
          type: 'alert-success',
          messages: [
            {
              msg: `Created ${newSign.name}.`,
            },
          ],
        };
      }
    } catch (e) {
      console.error(e);
      req.flash = {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to apply settings!',
          },
        ],
      };
    }
    next();
  },
  renderSettings,
);

/* POST delete sign. */
router.post(
  '/delete-sign',
  async (req, res, next) => {
    let errors;
    let sign;
    try {
      req.checkBody('id', 'Please enter a valid sign.').exists();
      req.checkBody('id', 'Please enter a valid sign.').custom(
        async id =>
          new Promise(async (resolve, reject) => {
            sign = await Sign.findById(id);
            if (sign) {
              resolve();
            } else {
              reject(new Error('No garage found.'));
            }
          }),
      );
      try {
        await req.asyncValidationErrors();
      } catch (e) {
        errors = e;
      }
      if (errors) {
        throw errors;
      } else {
        await Sign.destroy({
          where: {
            id: req.body.id,
          },
        });
        req.flash = {
          type: 'alert-success',
          messages: [
            {
              msg: `Destroyed ${sign.name}.`,
            },
          ],
        };
      }
    } catch (e) {
      console.error(e);
      req.flash = {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to apply settings!',
          },
        ],
      };
    }
    next();
  },
  renderSettings,
);

module.exports = router;
