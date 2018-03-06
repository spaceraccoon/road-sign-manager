const express = require('express');
const axios = require('axios');

const transformText = require('../helpers/transformText.js');
const transformImage = require('../helpers/transformImage');
const fetchData = require('../helpers/fetchData');

const router = express.Router();

const modes = {
  MANUAL: 0,
  TEXT: 1,
  IMAGE: 2,
  DATA: 3,
};

const garageIds = {
  0: 458221,
  1: 912794,
  2: 469420,
  3: 587662,
  4: 258066,
  5: 258289,
};

async function intervalHandler(garageId) {
  try {
    const data = await fetchData(garageId);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    await axios.post(process.env.ROAD_SIGN_URL, {
      message,
    });
  } catch (e) {
    console.error(e);
  }
}

/* GET manual mode page. */
router.get('/manual', (req, res) => {
  res.render('messageManual', {
    title: 'Manual Mode',
    mode: modes.MANUAL,
  });
});

/* GET text mode page. */
router.get('/text', (req, res) => {
  res.render('messageText', {
    title: 'Text Mode',
    mode: modes.TEXT,
  });
});

/* GET image mode page. */
router.get('/image', (req, res) => {
  res.render('messageImage', {
    title: 'Image Mode',
    mode: modes.IMAGE,
  });
});

/* GET parking data mode page. */
router.get('/data', (req, res) => {
  res.render('messageData', {
    title: 'Data Mode',
    mode: modes.DATA,
  });
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
  const errors = req.validationErrors();
  if (errors) {
    console.error(errors);
    res.render('messageManual', {
      title: 'Manual Mode',
      mode: modes.MANUAL,
      flash: {
        type: 'alert-danger',
        messages: errors,
      },
    });
  } else {
    clearInterval(req.app.locals.dataInterval);
    req.app.locals.currentMode = modes.MANUAL;
    await axios.post(process.env.ROAD_SIGN_URL, {
      message: req.body.message,
    });
    res.render('messageManual', {
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
    errors = req.validationErrors();
    if (errors) {
      throw errors;
    } else {
      clearInterval(req.app.locals.dataInterval);
      req.app.locals.currentMode = modes.TEXT;
      const message = await transformText([req.body.line1, req.body.line2]);
      await axios.post(process.env.ROAD_SIGN_URL, {
        message,
      });
      res.render('messageText', {
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
    res.render('messageText', {
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
    errors = req.validationErrors();

    if (errors) {
      throw errors;
    } else {
      clearInterval(req.app.locals.dataInterval);
      req.app.locals.currentMode = modes.IMAGE;
      const message = await transformImage(req.body.message);
      await axios.post(process.env.ROAD_SIGN_URL, {
        message,
      });
      res.render('messageImage', {
        title: 'Image Mode',
        mode: modes.IMAGE,
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
    res.render('messageImage', {
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

/* POST data message and forwards converted binary string to road sign. */
router.post('/data', async (req, res) => {
  try {
    clearInterval(req.app.locals.dataInterval);
    req.app.locals.currentMode = modes.DATA;
    req.app.locals.garage = req.body.message;
    const data = await fetchData(garageIds[req.body.message]);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Spaces`.toUpperCase(),
    ]);
    await axios.post(process.env.ROAD_SIGN_URL, {
      message,
    });
    req.app.locals.dataInterval = setInterval(
      intervalHandler,
      60000,
      garageIds[req.body.message],
    );
    res.render('messageData', {
      title: 'Data Mode',
      mode: modes.DATA,
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
    res.render('messageData', {
      title: 'Data Mode',
      mode: modes.DATA,
      flash: {
        type: 'alert-danger',
        messages: [
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
      case modes.DATA: {
        const data = await fetchData(garageIds[req.body.message]);
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
      default:
        throw new Error('Invalid mode');
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({
      errors,
      message: null,
    });
  }
});

module.exports = router;
