// routes/students.js
const router = require('express').Router()
const passport = require('../config/auth')
const { Student, Evaluation } = require('../models')

const authenticate = passport.authorize('jwt', { session: false })

const loadStudent = (req, res, next) => {
  const id = req.params.id

  Student.findById(id)
    .then((student) => {
      req.student = student
      next()
    })
    .catch((error) => next(error))
}

const getEvaluations = (req, res, next) => {
  Promise.all(req.student.evaluations.map(evaluationId => Evaluation.findById(evaluationId)))
    .then((evaluations) => {
      req.evaluations = evaluations
      next()
    })
    .catch((error) => next(error))
}

module.exports = io => {
  router
    .get('/students/:id/evaluations', loadStudent, getEvaluations, (req, res, next) => {
      if (!req.student || !req.evaluations) { return next() }
      res.json(req.evaluations)
    })

    .get('/evaluations', (req, res, next) => {
      Evaluation.find()
        .then((evaluations) => res.json(evaluations))
        .catch((error) => next(error))
    })
    .get('/students/:id/evaluations/:id', (req, res, next) => {
      const id = req.params.id

      Evaluation.findById(id)
        .then((evaluation) => {
          if (!evaluation) { return next() }
          res.json(evaluation)
        })
        .catch((error) => next(error))
    })
    .post('/students/:id/evaluations', loadStudent, (req, res, next) => {
      if (!req.student) { return next() }

      const newEvaluation = {
        color: req.body.color,
        remark: req.body.remark,
        student_id: req.student._id,
      }

      Evaluation.create(newEvaluation)
        .then((evaluation) => {
          const evaluationId = evaluation._id

          req.student.evaluations = [evaluationId].concat(req.student.evaluations)

          req.student.save()
            .then((student) => {
              req.student = student
              next()
            })
            .catch((error) => next(error))

          io.emit('action', {
            type: 'STUDENT_CREATED',
            payload: evaluation
          })
          res.json(evaluation)
        })
        .catch((error) => next(error))
    },

    getEvaluations,

    (req, res, next) => {
      io.emit('action', {
        type: 'STUDENT_EVALUATION_UPDATED',
        payload: {
          student: req.student,
          evaluations: req.evaluations
        }
      })
      res.json(req.students)
    })

    .delete('/:id/students/evaluations', authenticate, (req, res, next) => {
      if (!req.student) { return next() }

      const evaluationId = req.account._id
      req.student.evaluations = req.student.evaluations.filter((s) => evaluationId.toString())
      req.student.save()
        .then((student) => {
          req.student = student
          next()
        })
        .catch((error) => next(error))

    },

    getEvaluations,

    (req, res, next) => {
      io.emit('action', {
        type: 'STUDENT_EVALUATION_UPDATED',
        payload: {
          student: req.student,
          evaluation: req.evaluations
        }
      })
      res.json(req.evaluations)
    })

  return router
}
