// routes/batchs.js
const router = require('express').Router()
const passport = require('../../config/auth')
const { batch, User } = require('../../models')

const authenticate = passport.authorize('jwt', { session: false })

const loadbatch = (req, res, next) => {
  const id = req.params.id

  batch.findById(id)
    .then((batch) => {
      req.batch = batch
      next()
    })
    .catch((error) => next(error))
}

const getPlayers = (req, res, next) => {
  Promise.all(req.batch.players.map(player => User.findById(player.userId)))
    .then((users) => {
      // Combine player data and user's name
      req.players = req.batch.players.map((player) => {
        const { name } = users
          .filter((u) => u._id.toString() === player.userId.toString())[0]

        return {
          userId: player.userId,
          pairs: player.pairs,
          name
        }
      })
      next()
    })
    .catch((error) => next(error))
}

module.exports = io => {
  router
    .get('/batchs/:id/players', loadbatch, getPlayers, (req, res, next) => {
      if (!req.batch || !req.players) { return next() }
      res.json(req.players)
    })

    .post('/batchs/:id/players', authenticate, loadbatch, (req, res, next) => {
      if (!req.batch) { return next() }

      const userId = req.account._id

      if (req.batch.players.filter((p) => p.userId.toString() === userId.toString()).length > 0) {
        const error = Error.new('You already joined this batch!')
        error.status = 401
        return next(error)
      }

      // Add the user to the players
      req.batch.players.push({ userId, pairs: [] })

      req.batch.save()
        .then((batch) => {
          req.batch = batch
          next()
        })
        .catch((error) => next(error))
    },
    // Fetch new player data
    getPlayers,
    // Respond with new player data in JSON and over socket
    (req, res, next) => {
      io.emit('action', {
        type: 'batch_PLAYERS_UPDATED',
        payload: {
          batch: req.batch,
          players: req.players
        }
      })
      res.json(req.players)
    })

    .delete('/batchs/:id/players', authenticate, (req, res, next) => {
      if (!req.batch) { return next() }

      const userId = req.account._id
      const currentPlayer = req.batch.players.filter((p) => p.userId.toString() === userId.toString())[0]

      if (!currentPlayer) {
        const error = Error.new('You are not a player of this batch!')
        error.status = 401
        return next(error)
      }

      req.batch.players = req.batch.players.filter((p) => p.userId.toString() !== userId.toString())
      req.batch.save()
        .then((batch) => {
          req.batch = batch
          next()
        })
        .catch((error) => next(error))

    },
    // Fetch new player data
    getPlayers,
    // Respond with new player data in JSON and over socket
    (req, res, next) => {
      io.emit('action', {
        type: 'batch_PLAYERS_UPDATED',
        payload: {
          batch: req.batch,
          players: req.players
        }
      })
      res.json(req.players)
    })

  return router
}
