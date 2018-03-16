module.exports = (sequelize, DataTypes) => {
  const Garage = sequelize.define(
    'Garage',
    {
      garageId: { type: DataTypes.BIGINT, unique: true },
      name: DataTypes.STRING,
    },
    {
      timestamps: false,
    },
  );

  return Garage;
};
