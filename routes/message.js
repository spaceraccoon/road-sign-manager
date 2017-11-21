const express = require('express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const router = express.Router();
const axios = require('axios');
const transformText = require('../helpers/transformText.js')
const transformImage = require('../helpers/transformImage');

/* GET manual message page. */
router.get('/manual', function(req, res, next) {
  res.render('messageManual', { title: 'Manual Mode' });
});

/* GET text message page. */
router.get('/text', function(req, res, next) {
  res.render('messageText', { title: 'Text Mode' });
});

/* GET image message page. */
router.get('/image', function(req, res, next) {
  res.render('messageImage', { title: 'Image Mode' });
});

/* POST manual message and forwards binary string to road sign. */
router.post('/manual', function(req, res, next) {

  // log the req message
  console.log(req.body.message);

  // Check that req message matches regex [0-1]{2592} ie. binary string of length 2592
  req.checkBody("message", "Please enter a valid binary string. See above for details.").matches(/^[0-1]{2592}$/, "i");
  var errors = req.validationErrors();
  console.log(errors);

  if (errors) {
    res.render('messageManual', {
      title: 'Manual Mode',
      flash: { type: 'alert-danger', messages: errors}
    });
  } else {
    axios.post(process.env.ROAD_SIGN_URL, {
      'message': req.body.message
    });
    res.render('messageManual', {
      title: 'Manual Mode',
      flash: { type: 'alert-success', messages: [ { msg: 'Success!' }]}
    });
  }
});

/* POST text message and forwards converted binary string to road sign. */
router.post('/text', async function(req, res) {
  res.render('messageText', { title: 'Text Mode' });
  try {
    let message = await transformText(req.body.message);
    try {
      await axios.post(process.env.ROAD_SIGN_URL, { message });
    } catch (e) {
      throw e;
    }
    res.render('messageText', {
  		title: 'Text Mode',
  		flash: { type: 'alert-success', messages: [{ msg: 'Success!' }]}
  	});
  } catch(e) {
    console.log(e);

    res.render('messageText', {
      title: 'Text Mode',
      flash: { type: 'alert-danger', messages: [{ msg: 'Failed to convert text!' }]}
    });
  }
});

/* POST image URL message and forwards converted binary string to road sign. */
router.post('/image', async function(req, res) {
  try {
    let message = await transformImage(req.body.message);
    try {
      await axios.post(process.env.ROAD_SIGN_URL, { message });
    } catch (e) {
      throw e;
    }
    res.render('messageImage', {
  		title: 'Image Mode',
  		flash: { type: 'alert-success', messages: [ { msg: 'Success!' }]}
  	});
  } catch(e) {
    console.log(e);

    res.render('messageImage', {
      title: 'Image Mode',
      flash: { type: 'alert-danger', messages: [ { msg: 'Failed to convert image!' }]}
    });
  }
});

module.exports = router;
