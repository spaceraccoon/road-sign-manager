var express = require('express');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var router = express.Router();
var axios = require('axios');
var textTransform = require('../helpers/transformText.js')

var transformImage = require('../helpers/transformImage');

/* GET home page. */
router.get('/manual', function(req, res, next) {
  res.render('messageManual', { title: 'Manual Mode' });
});

router.get('/text', function(req, res, next) {
  res.render('messageText', { title: 'Text Mode' });
});

router.get('/image', function(req, res, next) {
  res.render('messageImage', { title: 'Image Mode' });
})

//Receive on POST and console logs message (for /message/text)
router.post('/text', function(req, res) {
  console.log(req.body.message);
  console.log(textTransform(req.body.message));
  res.render('messageText', { title: 'Text Mode' });
});

router.post('/image', function(req, res) {

	// log req message
  console.log(req.body.message);

	// check req message for valid URL later

	// log any errors
	binaryString = transformImage(req.body.message);
	// post to our road sign app
	axios.post(process.env.ROAD_SIGN_URL, {
		'message': binaryString
	});
	// render with success flash
	res.render('messageImage', {
		title: 'Manual Mode',
		flash: { type: 'alert-success', messages: [ { msg: 'Success!' }]}
	});
})

// Receive on POST and send message to traffic sign (for /message/manual)
router.post('/manual', function(req, res, next) {

  // log the req message
  console.log(req.body.message);

  // check that req message matches regex [0-1]{2592} ie. binary string of length 2592
  req.checkBody("message", "Please enter a valid binary string. See above for details.").matches(/^[0-1]{2592}$/, "i");

  // log errors
  var errors = req.validationErrors();
  console.log(errors);

  // if there are errors
  if (errors) {
    // render with error flash
    res.render('messageManual', {
      title: 'Manual Mode',
      flash: { type: 'alert-danger', messages: errors}
    });
  }

  // if no errors
  else {
    // post to our road sign app
    axios.post(process.env.ROAD_SIGN_URL, {
      'message': req.body.message
    });
    // render with success flash
    res.render('messageManual', {
      title: 'Manual Mode',
      flash: { type: 'alert-success', messages: [ { msg: 'Success!' }]}
    });
  }
});

module.exports = router;
