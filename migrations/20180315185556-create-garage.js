module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Garages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      garageId: {
        type: Sequelize.BIGINT,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
      },
    }),
  down: queryInterface => queryInterface.dropTable('Garages'),
};
