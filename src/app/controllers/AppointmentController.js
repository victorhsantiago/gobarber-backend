import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt'

import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import Notifications from '../schemas/Notification'

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      attributes: ['id', 'date'],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    })

    return res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    })

    if (!(await schema.isValid(req.body)))
      res.status(400).json({ error: 'Validations fails' })

    const { provider_id, date } = req.body

    // Check if provider_id belongs to a provider
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    })

    if (req.userId === provider_id)
      return res.status(401).json({
        error: 'Only costumers may create appointments',
      })

    if (!checkIsProvider)
      return res
        .status(401)
        .json({ error: 'You can create appointments only with providers' })

    // check for past dates
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date()))
      return res.status(400).json({ error: 'Past dates are not permitted' })

    // check date availability
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    })

    if (checkAvailability)
      return res
        .status(400)
        .json({ error: 'Appointment time is not available' })

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    })

    // Notify appointment provider
    const { name } = await User.findByPk(req.userId)
    const formatedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' HH:mm'h'",
      { locale: pt }
    )
    await Notifications.create({
      content: `Novo agendamento de ${name} para ${formatedDate}`,
      user: provider_id,
    })

    return res.json(appointment)
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id)

    if (appointment.user_id !== req.userId)
      return res
        .status(401)
        .json({ error: 'You do not have permission to perform this operation' })

    const dataWithSub = subHours(appointment.date, 2)

    if (isBefore(dataWithSub, new Date()))
      return res.status(401).json({
        error: 'You can only cancel appointments with 2 hours in advance',
      })

    appointment.canceled_at = new Date()

    await appointment.save()

    return res.json(appointment)
  }
}

export default new AppointmentController()
