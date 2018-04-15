module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'Signs',
      [
        {
          name: 'Development 1',
          url: 'https://morning-caverns-74081.herokuapp.com/message',
          key: 'helloworld',
        },
        {
          name: 'Development 2',
          url: 'https://mighty-eyrie-20017.herokuapp.com/message',
          key: 'helloworld',
        },
      ],
      {},
    ),

  down: queryInterface => queryInterface.bulkDelete('Signs', null, {}),
};
