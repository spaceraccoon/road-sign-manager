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
      `${data.free} Lots`.toUpperCase(),
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
  });
});

/* GET text mode page. */
router.get('/text', (req, res) => {
  res.render('messageText', {
    title: 'Text Mode',
  });
});

/* GET image mode page. */
router.get('/image', (req, res) => {
  res.render('messageImage', {
    title: 'Image Mode',
  });
});

/* GET parking data mode page. */
router.get('/data', (req, res) => {
  res.render('messageData', {
    title: 'Data Mode',
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
      flash: {
        type: 'alert-danger',
        messages: errors,
      },
    });
  } else {
    clearInterval(req.app.locals.dataInterval);
    req.app.locals.mode = modes.MANUAL;
    await axios.post(process.env.ROAD_SIGN_URL, {
      message: req.body.message,
    });
    res.render('messageManual', {
      title: 'Manual Mode',
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
      req.app.locals.mode = modes.TEXT;
      const message = await transformText([req.body.line1, req.body.line2]);
      await axios.post(process.env.ROAD_SIGN_URL, {
        message,
      });
      res.render('messageText', {
        title: 'Text Mode',
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
      req.app.locals.mode = modes.IMAGE;
      const message = await transformImage(req.body.message);
      await axios.post(process.env.ROAD_SIGN_URL, {
        message,
      });
      res.render('messageImage', {
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
    res.render('messageImage', {
      title: 'Image Mode',
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
    req.app.locals.mode = modes.DATA;
    req.app.locals.garage = req.body.message;
    const data = await fetchData(garageIds[req.body.message]);
    const message = await transformText([
      data.name.toUpperCase(),
      `${data.free} Lots`.toUpperCase(),
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

router.post('/preview', async(req, res) => {
  console.log(req.body);
  switch(req.body.mode) {
    case modes.MANUAL:
      try {
        req
          .checkBody(
            'message',
            'Please enter a valid binary string. See above for details.',
          )
          .matches(/^[0-1]{2592}$/, 'i');
        const errors = req.validationErrors();
        if (errors) {
          throw errors;
        }
        else {
          res.status(200).send('messageManual', {
            title: 'Manual Mode',
            messages: req.body.message
          })
        }
      }
      catch (errors) {
        console.error(errors);
        res.status(400).send('messageImage', {
          title: 'Image Mode',
          messages: errors
          })
      }
      break;
    case modes.TEXT:
      try {
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
        } 
        else {
          clearInterval(req.app.locals.dataInterval);
          req.app.locals.mode = modes.TEXT;
          const message = await transformText([req.body.line1, req.body.line2]);
          await axios.post(process.env.ROAD_SIGN_URL, {
            message,
          });
          console.log("sending response");
          res.status(200).json({
            title: 'Text Mode',
            messages: message
          })
        }
      }
      catch (errors) {
        console.error(errors);
        res.status(400).json({
          title: 'Image Mode',
          messages: errors
          })
      }
      break;
    case modes.IMAGE:
      try { 
        req
          .checkBody(
            'message',
            'Please enter a valid image URL, of type .png or .jpeg',
          )
          .matches(/^.*.(?:jpeg|png|jpg)$/, 'i');
        errors = req.validationErrors();
        if (errors) {
          throw errors;
        } 
        else {
          clearInterval(req.app.locals.dataInterval);
          req.app.locals.mode = modes.IMAGE;
          const message = await transformImage(req.body.message);
          await axios.post(process.env.ROAD_SIGN_URL, {
            message,
          });
          res.status(200).json({
            title: 'Image Mode',
            messages: message
          })
        }
      }
      catch (errors) {
        console.error(errors);
        res.status(400).json({
          title: 'Image Mode',
          messages: errors
          })
      }
      break;
    case modes.DATA:
      try {
        clearInterval(req.app.locals.dataInterval);
        req.app.locals.mode = modes.DATA;
        req.app.locals.garage = req.body.message;
        const data = await fetchData(garageIds[req.body.message]);
        const message = await transformText([
          data.name.toUpperCase(),
          `${data.free} Lots`.toUpperCase(),
        ]);
        await axios.post(process.env.ROAD_SIGN_URL, {
          message,
        });
        req.app.locals.dataInterval = setInterval(
          intervalHandler,
          60000,
          garageIds[req.body.message],
        );
        res.status(200).json({
          title: 'Image Mode',
          messages: message
        })
      }
      catch(errors) {
        console.error(errors);
        res.status(400).json({
          title: 'Image Mode',
          messages: errors
        })
      }           
      break;
  }
});
  
module.exports = router;
