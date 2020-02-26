import Bee from 'bee-queue'
import redisConfig from '../config/redis'

import SendCancelationMail from '../app/jobs/SendCancelationMail'

const jobs = [SendCancelationMail]

class Queue {
  constructor() {
    this.queues = {}
    this.init()
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      }
    })
  }

  add(key, job) {
    return this.queues[key].bee.createJob(job).save()
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key]
      bee.on('failed', this.handleFailure).process(handle)
    })
  }

  handleFailure(job, err) {
    console.warn(`Queue ${job.queue.name}: FAILED`, err)
  }
}

export default new Queue()
