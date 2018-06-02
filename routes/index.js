/**
 * Routes that render the static home and about pages.
 */

const express = require('express');

const { Garage, Sign } = require('../models');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  res.render('index', {
    title: 'Dashboard',
    garages: await Garage.findAll({
      raw: true,
      order: [['name', 'ASC']],
    }),
    signs: await Sign.findAll({
      raw: true,
      order: [['name', 'ASC']],
    }),
  });
});

/* GET about page. */
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
  });
});

module.exports = router;
