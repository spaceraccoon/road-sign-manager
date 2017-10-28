var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/manual', function(req, res, next) {
  res.render('messageManual', { title: 'Manual Mode' });
});

router.get('/text', function(req, res, next) {
  res.render('messageText', { title: 'Text Mode' });
});

//Receive on POST and console logs message (for /message/text)
router.post('/text', function(req, res) {
  console.log(req.body.message);
  res.render('messageText', { title: 'Text Mode' });
});

//Receive on POST and send message to traffic sign (for /message/manual)
router.post('/manual', function(req, res, next) {
  console.log(req.body.message);
  axios.post('https://morning-caverns-74081.herokuapp.com/message', {
    'message': req.body.message
  })
  res.render('messageManual', { title: 'Manual Mode' });
});

module.exports = router;
