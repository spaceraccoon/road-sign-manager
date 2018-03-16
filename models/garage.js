module.exports = (sequelize, DataTypes) => {
  const Garage = sequelize.define(
    'Garage',
    {
      garageId: DataTypes.BIGINT,
      name: DataTypes.STRING,
    },
    {
      timestamps: false,
    },
  );

  return Garage;
};
