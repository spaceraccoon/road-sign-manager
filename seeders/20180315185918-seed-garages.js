module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'Garages',
      [
        {
          garageId: 458221,
          name: 'Air Rights Garage',
        },
        {
          garageId: 912794,
          name: 'Crown Street Garage',
        },
        {
          garageId: 469420,
          name: 'Orange and Elm Lot',
        },
        {
          garageId: 587662,
          name: 'Temple Medical Garage',
        },
        {
          garageId: 258066,
          name: 'Temple Street Garage',
        },
        {
          garageId: 258289,
          name: 'Union Station Garage',
        },
      ],
      {},
    ),

  down: queryInterface => queryInterface.bulkDelete('Garages', null, {}),
};
