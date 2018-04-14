mmodule.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Signs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      key: {
        type: Sequelize.STRING,
      }
      url: {
        type: Sequelize.STRING,
      },
      mode: {
        type: Sequelize.INTEGER,
      },
      message: {
        type: Sequelize.TEXT,
      },
    }),
  down: queryInterface => queryInterface.dropTable('Signs'),
};
