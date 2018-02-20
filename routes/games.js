// routes/batchs.js
const router = require('express').Router()
const passport = require('../config/auth')
const { batch } = require('../models')
const utils = require('../lib/utils')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/batchs', (req, res, next) => {
      batch.find()
        // Newest batchs first
        .sort({ startedAt: -1 })
        // Send the data in JSON format
        .then((batchs) => res.json(batchs))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })
    .get('/batchs/:id', (req, res, next) => {
      const id = req.params.id

      batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }
          res.json(batch)
        })
        .catch((error) => next(error))
    })
    .post('/batchs', authenticate, (req, res, next) => {
      const newbatch = {
        userId: req.account._id,
        players: [{
          userId: req.account._id,
          pairs: []
        }],
        cards: utils.shuffle('✿✪♦✵♣♠♥✖'.repeat(2).split(''))
          .map((symbol) => ({ visible: false, symbol }))
      }

      batch.create(newbatch)
        .then((batch) => {
          io.emit('action', {
            type: 'batch_CREATED',
            payload: batch
          })
          res.json(batch)
        })
        .catch((error) => next(error))
    })
    .put('/batchs/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const updatedbatch = req.body

      batch.findByIdAndUpdate(id, { $set: updatedbatch }, { new: true })
        .then((batch) => {
          io.emit('action', {
            type: 'batch_UPDATED',
            payload: batch
          })
          res.json(batch)
        })
        .catch((error) => next(error))
    })
    .patch('/batchs/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const patchForbatch = req.body

      batch.findById(id)
        .then((batch) => {
          if (!batch) { return next() }

          const updatedbatch = { ...batch, ...patchForbatch }

          batch.findByIdAndUpdate(id, { $set: updatedbatch }, { new: true })
            .then((batch) => {
              io.emit('action', {
                type: 'batch_UPDATED',
                payload: batch
              })
              res.json(batch)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/batchs/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      batch.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'batch_REMOVED',
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
