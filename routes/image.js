var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/manual', function(req, res, next) {
  res.render('imageManual', { title: 'Image Manual Mode' });
});

router.get('/text', function(req, res, next) {
  res.render('imageLog', { title: 'Log Mode' });
});

//Receive on POST and console logs message (for /message/text)
router.post('/text', function(req, res) {
  console.log(req.body.image);
  res.render('imageLog', { title: 'Text Mode' });
});

//Receive on POST and send message to traffic sign (for /message/manual)
router.post('/manual', function(req, res, next) {
  console.log(req.body.image);
  axios.post(process.env.ROAD_SIGN_URL, {
    'image': req.body.image
  })
  res.render('imageManual', { title: 'Image Manual Mode' });
});

module.exports = router;
