module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('schedule_times', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),
  down: queryInterface => queryInterface.dropTable('schedule_times'),
}
