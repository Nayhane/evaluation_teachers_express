// routes/batches.js
const router = require('express').Router()
const passport = require('../config/auth')
const { Batch } = require('../models')
const utils = require('../lib/utils')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/batches', authenticate, (req, res, next) => {
      Batch.find()
        // Newest batches first
        .sort({ startedAt: -1 })
        // Send the data in JSON format
        .then((batches) => res.json(batches))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })

    .get('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id

      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }
          res.json(batch)
        })
        .catch((error) => next(error))
    })

    .post('/batches', authenticate, (req, res, next) => {
      const newbatch = {
        batchNumber: req.body.batchNumber,
        startAt: req.body.startAt,
        endAt: req.body.endAt
      }

      Batch.create(newbatch)
        .then((batch) => {
          // io.emit('action', {
          //   type: 'BATCH_CREATED',
          //   payload: batch
          // })
          res.json(batch)
        })
        .catch((error) => next(error))
    })

    .put('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const updatedbatch = req.body

      Batch.findByIdAndUpdate(id, { $set: updatedbatch }, { new: true })
        .then((batch) => {
          io.emit('action', {
            type: 'BATCH_UPDATED',
            payload: batch
          })
          res.json(batch)
        })
        .catch((error) => next(error))
    })

    .patch('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const patchForBatch = req.body

      Batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }

          const updatedBatch = { ...batch, ...patchForBatch }

          batch.findByIdAndUpdate(id, { $set: updatedBatch }, { new: true })
            .then((batch) => {
              io.emit('action', {
                type: 'BATCH_UPDATED',
                payload: batch
              })
              res.json(batch)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })

    .delete('/batches/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      Batch.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'BATCH_REMOVED',
            payload: id
          })
          res.status = 200
          res.json({
            message: 'Removed',
            _id: id
          })
        })
        .catch((error) => next(error))
    })

  return router
}
