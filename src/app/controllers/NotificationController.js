import Notification from '../schemas/Notification'
import User from '../models/User'

class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    })

    if (!checkIsProvider)
      res.status(401).json({ error: 'Only providers may list appointments' })

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20)

    return res.json({ notifications })
  }
}

export default new NotificationController()
