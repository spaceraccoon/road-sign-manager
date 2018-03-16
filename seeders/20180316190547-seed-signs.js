module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'Signs',
      [
        {
          name: 'Development 1',
          url: 'https://morning-caverns-74081.herokuapp.com/message',
        },
        {
          name: 'Development 2',
          url: 'https://mighty-eyrie-20017.herokuapp.com/message',
        },
      ],
      {},
    ),

  down: queryInterface => queryInterface.bulkDelete('Signs', null, {}),
};
