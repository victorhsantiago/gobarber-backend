import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import AppointmentController from './app/controllers/AppointmentController'
import FileController from './app/controllers/FileController'
import NotificationController from './app/controllers/NotificationController'
import ProviderController from './app/controllers/ProviderController'
import ScheduleController from './app/controllers/ScheduleController'
import SessionController from './app/controllers/SessionController'
import UserController from './app/controllers/UserController'

import authMiddleware from './app/middlewares/auth'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/sessions', SessionController.store)
routes.post('/users', UserController.store)

routes.use(authMiddleware)

routes.get('/appointments', AppointmentController.index)
routes.get('/notifications', NotificationController.index)
routes.get('/providers', ProviderController.index)
routes.get('/schedule', ScheduleController.index)

routes.post('/appointments', AppointmentController.store)
routes.post('/files', upload.single('file'), FileController.store)

routes.put('/users', UserController.update)

export default routes
