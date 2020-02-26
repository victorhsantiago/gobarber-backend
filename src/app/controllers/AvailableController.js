import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns'
import { Op } from 'sequelize'
import Appointment from '../models/Appointment'
import ScheduleTimes from '../models/ScheduleTimes'

class AvailableController {
  async index(req, res) {
    const { date } = req.query

    if (!date) res.status(400).json({ error: 'Invalid date' })

    const searchDate = Number(date)

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: { [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)] },
      },
    })

    const schedule = await ScheduleTimes.findAll()

    const avaiable = schedule.map(({ time }) => {
      const [hour, minute] = time.split(':')
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      )

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaiable:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      }
    })

    res.json(avaiable)
  }
}

export default new AvailableController()