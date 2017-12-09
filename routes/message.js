const express = require('express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const router = express.Router();
const axios = require('axios');
const transformText = require('../helpers/transformText.js')
const transformImage = require('../helpers/transformImage');
const fetchData = require('../helpers/fetchData');

const modes = {
  MANUAL: 0,
  TEXT: 1,
  IMAGE: 2,
  DATA: 3
}

const garageIds = {
  '0': 458221,
  '1': 912794,
  '2': 469420,
  '3': 587662,
  '4': 258066,
  '5': 258289
}

const intervalHandler = async function(garageId) {
  try {
    let data = await fetchData(garageId);
    let message = await transformText([data.name.toUpperCase(), `${data.free} Lots`.toUpperCase()]);
    console.log(`${new Date().toISOString()}: ${data.name} has ${data.free} lots.`);
    await axios.post(process.env.ROAD_SIGN_URL, { message });
  } catch (e) {
    console.log(e);
  }
}

/* GET manual mode page. */
router.get('/manual', function (req, res, next) {
  res.render('messageManual', {
    title: 'Manual Mode',
    mode: req.app.locals.mode
  });
});

/* GET text mode page. */
router.get('/text', function (req, res, next) {
  res.render('messageText', {
    title: 'Text Mode',
    mode: req.app.locals.mode
  });
});

/* GET image mode page. */
router.get('/image', function (req, res, next) {
  res.render('messageImage', {
    title: 'Image Mode',
    mode: req.app.locals.mode
  });
});

/* GET parking data mode page. */
router.get('/data', function (req, res, next) {
  res.render('messageData', {
    title: 'Data Mode',
    mode: req.app.locals.mode
  });
});

/* POST manual message and forwards binary string to road sign. */
router.post('/manual', async function (req, res, next) {
  try {
    // Check that req message matches regex [0-1]{2592} ie. binary string of length 2592
    req.checkBody("message", "Please enter a valid binary string. See above for details.").matches(/^[0-1]{2592}$/, "i");
    var errors = req.validationErrors();
    if (errors) {
      throw (errors);
    } else {
      clearInterval(req.app.locals.dataInterval);
      req.app.locals.mode = modes.MANUAL;
      await axios.post(process.env.ROAD_SIGN_URL, {
        'message': req.body.message
      });
      res.render('messageManual', {
        title: 'Manual Mode',
        flash: {
          type: 'alert-success',
          messages: [{
            msg: 'Success!'
          }]
        },
        mode: req.app.locals.mode
      });
    }
  } catch (e) {
    console.log(e);
    res.render('messageManual', {
      title: 'Manual Mode',
      flash: {
        type: 'alert-danger',
        messages: errors
      },
      mode: req.app.locals.mode
    });
  }
});

/* POST text message and forwards converted binary string to road sign. */
router.post('/text', async function (req, res) {
  try {
    // Check that each line is 12 or less letters long 
    req.checkBody("line1", "Please enter a valid message for line 1. See above for details.").isLength({ min: 1, max: 12 });
    req.checkBody("line2", "Please enter a valid message for line 2. See above for details.").isLength({ min: 0, max: 12 });
    var errors = req.validationErrors();
    if (errors) {
      throw (errors);
    } else {
      clearInterval(req.app.locals.dataInterval);
      req.app.locals.mode = modes.TEXT;
      let message = await transformText([req.body.line1, req.body.line2]);
      await axios.post(process.env.ROAD_SIGN_URL, {
        message
      });
      res.render('messageText', {
        title: 'Text Mode',
        flash: {
          type: 'alert-success',
          messages: [{
            msg: 'Success!'
          }]
        },
        mode: req.app.locals.mode
      });
    }
  } catch (e) {
    console.log(e);
    res.render('messageText', {
      title: 'Text Mode',
      flash: {
        type: 'alert-danger',
        messages: errors ? errors : [{ msg: 'Failed to convert text!' }]
      },
      mode: req.app.locals.mode
    });
  }
});

/* POST image URL message and forwards converted binary string to road sign. */
router.post('/image', async function (req, res) {
  try {
    clearInterval(req.app.locals.dataInterval);
    req.app.locals.mode = modes.IMAGE;
    let message = await transformImage(req.body.message);
    await axios.post(process.env.ROAD_SIGN_URL, {
      message
    });
    res.render('messageImage', {
      title: 'Image Mode',
      flash: {
        type: 'alert-success',
        messages: [{
          msg: 'Success!'
        }]
      },
      mode: req.app.locals.mode
    });
  } catch (e) {
    console.log(e);

    res.render('messageImage', {
      title: 'Image Mode',
      flash: {
        type: 'alert-danger',
        messages: [{
          msg: 'Failed to convert image!'
        }]
      },
      mode: req.app.locals.mode
    });
  }
});

/* POST data message and forwards converted binary string to road sign. */
router.post('/data', async function (req, res) {
  try {
    clearInterval(req.app.locals.dataInterval);
    req.app.locals.mode = modes.DATA;
    let data = await fetchData(garageIds[(req.body.message)]);
    let message = await transformText([data.name.toUpperCase(), `${data.free} Lots`.toUpperCase()]);
    await axios.post(process.env.ROAD_SIGN_URL, { message });
    req.app.locals.dataInterval = setInterval(intervalHandler, 60000, garageIds[(req.body.message)]);
    res.render('messageData', {
      title: 'Data Mode',
      flash: {
        type: 'alert-success',
        messages: [{
          msg: 'Success!'
        }]
      },
      mode: req.app.locals.mode
    });
  } catch (e) {
    console.log(e);
    res.render('messageData', {
      title: 'Data Mode',
      flash: {
        type: 'alert-danger',
        messages: [{
          msg: 'Failed to convert data!'
        }]
      },
      mode: req.app.locals.mode
    });
  }
});

module.exports = router;
