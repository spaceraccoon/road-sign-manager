module.exports = (sequelize, DataTypes) => {
  const Sign = sequelize.define(
    'Sign',
    {
      name: DataTypes.STRING,
      key: DataTypes.STRING,
      url: DataTypes.STRING,
      mode: DataTypes.INTEGER,
      message: DataTypes.TEXT,
    },
    {
      timestamps: false,
    },
  );

  return Sign;
};
