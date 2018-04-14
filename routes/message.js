const express = require('express');
const axios = require('axios');

const transformText = require('../helpers/transformText');
const transformImage = require('../helpers/transformImage');
const fetchData = require('../helpers/fetchData');
const { Garage, Sign } = require('../models');
const modes = require('../data/modes');

const router = express.Router();

function checkSignOptions(req) {
  req
    .checkBody('signOptions', 'Please select at least one road sign to update.')
    .isLength({
      min: 1,
    });
}

async function updateSigns(signOptions, message, mode) {
  signOptions.forEach(async signOption => {
    const sign = await Sign.findById(signOption);
    if (!sign) {
      throw new Error('Invalid sign');
    }
    await sign.update({
      mode,
      message,
    });
    await axios.post(
      sign.url,
      {
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${sign.key}`,
        },
      },
    );
  });
}

async function intervalHandlerSingle(garageId, signOptions) {
  try {
    const data = await fetchData(garageId);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    updateSigns(signOptions, message, modes.DATASINGLE);
  } catch (e) {
    console.error(e);
  }
}

/* eslint-disable no-param-reassign */
async function intervalHandlerMulti(garages, signOptions, locals) {
  try {
    const garage = await Garage.findById(garages[locals.dataIntervalIndex], {
      raw: true,
    });
    if (!garage) {
      throw new Error('Invalid garage');
    }
    const data = await fetchData(garage.garageId);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    updateSigns(signOptions, message, modes.DATAMULTI);
    locals.dataIntervalIndex = (locals.dataIntervalIndex + 1) % garages.length;
  } catch (e) {
    console.error(e);
  }
}

/* GET manual mode page. */
router.get('/manual', (req, res) => {
  res.render('message/manual', {
    title: 'Manual Mode',
    mode: modes.MANUAL,
  });
});

/* GET text mode page. */
router.get('/text', (req, res) => {
  res.render('message/text', {
    title: 'Text Mode',
    mode: modes.TEXT,
  });
});

/* GET image mode page. */
router.get('/image', (req, res) => {
  res.render('message/image', {
    title: 'Image Mode',
    mode: modes.IMAGE,
  });
});

/* GET single parking data mode page. */
router.get('/data-single', async (req, res) => {
  try {
    res.render('message/dataSingle', {
      title: 'Data Mode (Single)',
      mode: modes.DATASINGLE,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
    });
  } catch (e) {
    console.error(e);
    res.render('message/dataSingle', {
      title: 'Data Mode (Single)',
      mode: modes.DATASINGLE,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-danger',
        messages: [
          {
            msg: 'Unable to retrieve garages!',
          },
        ],
      },
    });
  }
});

/* GET multi parking data mode page. */
router.get('/data-multi', async (req, res) => {
  try {
    res.render('message/dataMulti', {
      title: 'Data Mode (Multi)',
      mode: modes.DATAMULTI,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
    });
  } catch (e) {
    console.error(e);
    res.render('message/dataMulti', {
      title: 'Data Mode (Multi)',
      mode: modes.DATAMULTI,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-danger',
        messages: [
          {
            msg: 'Unable to retrieve garages!',
          },
        ],
      },
    });
  }
});

/* POST manual message and forwards binary string to road sign. */
router.post('/manual', async (req, res) => {
  // Check that req message matches regex [0-1]{2592} ie. binary string of length 2592
  req
    .checkBody(
      'message',
      'Please enter a valid binary string. See above for details.',
    )
    .matches(/^[0-1]{2592}$/, 'i');
  checkSignOptions(req);
  const errors = req.validationErrors();
  if (errors) {
    console.error(errors);
    res.render('message/manual', {
      title: 'Manual Mode',
      mode: modes.MANUAL,
      flash: {
        type: 'alert-danger',
        messages: errors,
      },
    });
  } else {
    clearInterval(req.app.locals.dataInterval);
    updateSigns(req.body.signOptions, req.body.message, modes.MANUAL);
    res.render('message/manual', {
      title: 'Manual Mode',
      mode: modes.MANUAL,
      flash: {
        type: 'alert-success',
        messages: [
          {
            msg: 'Success!',
          },
        ],
      },
    });
  }
});

/* POST text message and forwards converted binary string to road sign. */
router.post('/text', async (req, res) => {
  let errors;
  try {
    // Check that each line is 12 or less letters long
    req
      .checkBody(
        'line1',
        'Please enter a valid message for line 1. See above for details.',
      )
      .isLength({
        min: 1,
        max: 12,
      });
    req
      .checkBody(
        'line2',
        'Please enter a valid message for line 2. See above for details.',
      )
      .isLength({
        min: 0,
        max: 12,
      });
    checkSignOptions(req);
    errors = req.validationErrors();
    if (errors) {
      throw errors;
    } else {
      clearInterval(req.app.locals.dataInterval);
      const message = await transformText([req.body.line1, req.body.line2]);
      updateSigns(req.body.signOptions, message, modes.TEXT);
      res.render('message/text', {
        title: 'Text Mode',
        mode: modes.TEXT,
        flash: {
          type: 'alert-success',
          messages: [
            {
              msg: 'Success!',
            },
          ],
        },
      });
    }
  } catch (e) {
    console.error(e);
    res.render('message/text', {
      title: 'Text Mode',
      mode: modes.TEXT,
      flash: {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to convert text!',
          },
        ],
      },
    });
  }
});

/* POST image URL message and forwards converted binary string to road sign. */
router.post('/image', async (req, res) => {
  let errors;
  try {
    // Check that req message url is of type .png or .jpeg
    req
      .checkBody(
        'message',
        'Please enter a valid image URL, of type .png or .jpeg',
      )
      .matches(/^.*.(?:jpeg|png|jpg)$/, 'i');
    checkSignOptions(req);
    errors = req.validationErrors();

    if (errors) {
      throw errors;
    } else {
      clearInterval(req.app.locals.dataInterval);
      const message = await transformImage(req.body.message);
      updateSigns(req.body.signOptions, message, modes.IMAGE);
      res.render('message/image', {
        title: 'Image Mode',
        flash: {
          type: 'alert-success',
          messages: [
            {
              msg: 'Success!',
            },
          ],
        },
      });
    }
  } catch (e) {
    console.error(e);
    res.render('message/image', {
      title: 'Image Mode',
      mode: modes.IMAGE,
      flash: {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to convert image!',
          },
        ],
      },
    });
  }
});

/* POST single data message and forwards converted binary string to road sign. */
router.post('/data-single', async (req, res) => {
  let errors;
  let garage;
  try {
    checkSignOptions(req);
    req.checkBody('message', 'Please enter a valid garage id.').exists();
    req.checkBody('message', 'Please enter a valid garage id.').custom(
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
    }
    clearInterval(req.app.locals.dataInterval);
    const data = await fetchData(garage.garageId);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    updateSigns(req.body.signOptions, message, modes.DATASINGLE);
    req.app.locals.dataInterval = setInterval(
      intervalHandlerSingle,
      60000,
      garage.garageId,
      req.body.signOptions,
    );
    res.render('message/dataSingle', {
      title: 'Data Mode (Single)',
      mode: modes.DATASINGLE,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-success',
        messages: [
          {
            msg: 'Success!',
          },
        ],
      },
    });
  } catch (e) {
    console.error(e);
    res.render('message/dataSingle', {
      title: 'Data Mode (Single)',
      mode: modes.DATASINGLE,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to convert data!',
          },
        ],
      },
    });
  }
});

/* POST multiple data messages and forwards converted binary string to road sign. */
router.post('/data-multi', async (req, res) => {
  let errors;
  try {
    checkSignOptions(req);
    req.checkBody('garages', 'Please select at least two garages.').isLength({
      min: 2,
    });
    req.checkBody('interval', 'Please enter a valid interval.').isInt({
      min: 1,
    });
    errors = req.validationErrors();
    if (errors) {
      throw errors;
    }
    clearInterval(req.app.locals.dataInterval);
    const garage = await Garage.findById(req.body.garages[0]);
    const data = await fetchData(garage.garageId);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    updateSigns(req.body.signOptions, message, modes.DATAMULTI);
    req.app.locals.dataIntervalIndex = 1 % req.body.garages.length;
    req.app.locals.dataInterval = setInterval(
      intervalHandlerMulti,
      parseInt(req.body.interval, 10) * 1000,
      req.body.garages,
      req.body.signOptions,
      req.app.locals,
    );
    res.render('message/dataMulti', {
      title: 'Data Mode (Multi)',
      mode: modes.DATAMULTI,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-success',
        messages: [
          {
            msg: 'Success!',
          },
        ],
      },
    });
  } catch (e) {
    console.error(e);
    res.render('message/dataMulti', {
      title: 'Data Mode (Multi)',
      mode: modes.DATAMULTI,
      garages: await Garage.findAll({ raw: true, order: [['name', 'ASC']] }),
      flash: {
        type: 'alert-danger',
        messages: errors || [
          {
            msg: 'Failed to convert data!',
          },
        ],
      },
    });
  }
});

/* POST different messages and modes and responds with JSON of converted binary. */
router.post('/preview', async (req, res) => {
  let errors;
  try {
    switch (req.body.mode) {
      case modes.MANUAL:
        req
          .checkBody(
            'message',
            'Please enter a valid binary string. See above for details.',
          )
          .matches(/^[0-1]{2592}$/, 'i');
        errors = req.validationErrors();
        if (errors) {
          throw errors;
        } else {
          res.status(200).json({
            errors: null,
            message: req.body.message,
          });
        }
        break;
      case modes.TEXT:
        req
          .checkBody(
            'message.line1',
            'Please enter a valid message for line 1. See above for details.',
          )
          .isLength({
            min: 1,
            max: 12,
          });
        req
          .checkBody(
            'message.line2',
            'Please enter a valid message for line 2. See above for details.',
          )
          .isLength({
            min: 0,
            max: 12,
          });
        errors = req.validationErrors();
        if (errors) {
          throw errors;
        } else {
          const message = await transformText([
            req.body.message.line1,
            req.body.message.line2,
          ]);
          res.status(200).json({
            errors: null,
            message,
          });
        }
        break;
      case modes.IMAGE:
        req
          .checkBody(
            'message',
            'Please enter a valid image URL, of type .png or .jpeg',
          )
          .matches(/^.*.(?:jpeg|png|jpg)$/, 'i');
        errors = req.validationErrors();
        if (errors) {
          throw errors;
        } else {
          const message = await transformImage(req.body.message);
          res.status(200).json({
            errors: null,
            message,
          });
        }
        break;
      case modes.DATASINGLE: {
        const garage = await Garage.findById(req.body.message, {
          raw: true,
        });
        if (!garage) {
          throw new Error('Invalid garage');
        }
        const data = await fetchData(garage.garageId);
        const message = await transformText([
          data.name.toUpperCase(),
          `${data.free} Spaces`.toUpperCase(),
        ]);
        res.status(200).json({
          errors: null,
          message,
        });
        break;
      }
      case modes.DATAMULTI: {
        req
          .checkBody('message.garages', 'Please select at least two garages.')
          .isLength({
            min: 2,
          });
        req
          .checkBody('message.interval', 'Please enter a valid interval.')
          .isInt({
            min: 1,
          });
        errors = req.validationErrors();
        if (errors) {
          throw errors;
        }
        const message = await Promise.all(
          req.body.message.garages.map(async id => {
            const garage = await Garage.findById(id, {
              raw: true,
            });
            if (!garage) {
              throw new Error('Invalid garage');
            }
            const data = await fetchData(garage.garageId);
            return transformText([
              data.name.toUpperCase(),
              `${data.free} Spaces`.toUpperCase(),
            ]);
          }),
        );
        res.status(200).json({
          errors: null,
          message,
        });
        break;
      }
      default:
        throw new Error('Invalid mode');
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({
      errors: errors || [
        {
          msg: 'Failed to generate preview!',
        },
      ],
      message: null,
    });
  }
});

module.exports = router;
