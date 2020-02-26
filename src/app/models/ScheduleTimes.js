import Sequelize, { Model } from 'sequelize'

class ScheduleTimes extends Model {
  static init(sequelize) {
    super.init(
      {
        time: Sequelize.STRING,
      },
      { sequelize }
    )
    return this
  }
}

export default ScheduleTimes
