// routes/students.js
const router = require('express').Router()
const passport = require('../config/auth')
const { Batch, Student } = require('../models')

const authenticate = passport.authorize('jwt', { session: false })

const loadBatch = (req, res, next) => {
  const id = req.params.id

  Batch.findById(id)
    .then((batch) => {
      req.batch = batch
      next()
    })
    .catch((error) => next(error))
}

const getStudents = (req, res, next) => {
  Promise.all(req.batch.students.map(studentId => Student.findById(studentId)))
    .then((students) => {
      req.students = students
      next()
    })
    .catch((error) => next(error))
}

module.exports = io => {
  router
    .get('/batches/:id/students', loadBatch, getStudents, (req, res, next) => {
      if (!req.batch || !req.students) { return next() }
      res.json(req.students)
    })

    .get('/students', (req, res, next) => {
      Student.find()
        .then((students) => res.json(students))
        .catch((error) => next(error))
    })
    .get('/batches/:id/students/:id', (req, res, next) => {
      const id = req.params.id

      Student.findById(id)
        .then((student) => {
          if (!student) { return next() }
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .post('/batches/:id/students', loadBatch, (req, res, next) => {
      if (!req.batch) { return next() }

      const newStudent = {
        name: req.body.name,
        photo: req.body.photo,
        batch_id: req.batch._id,
      }

      Student.create(newStudent)
        .then((student) => {
          const studentId = student._id

          req.batch.students = [studentId].concat(req.batch.students)

          req.batch.save()
            .then((batch) => {
              req.batch = batch
              next()
            })
            .catch((error) => next(error))

          io.emit('action', {
            type: 'BATCH_STUDENTS_UPDATED',
            payload: student
          })
          res.json(student)
        })
        .catch((error) => next(error))
    },

    getStudents,

    (req, res, next) => {
      io.emit('action', {
        type: 'BATCH_STUDENTS_UPDATED',
        payload: {
          batch: req.batch,
          students: req.students
        }
      })
      res.json(req.students)
    })
    .put('/students/:id', (req, res, next) => {
      const id = req.params.id

      Student.findByIdAndUpdate(id, { $set: req.body}, { new: true })
        .then((student) => {
          io.emit('action', {
            type: 'STUDENT_UPDATED',
            payload: student
          })
          res.json(student)
        })
        .catch((error) => next(error))
    })

    .delete('/batches/:id/students', authenticate, (req, res, next) => {
      if (!req.batch) { return next() }

      const studentId = req.account._id
      req.batch.students = req.batch.students.filter((s) => studentId.toString())
      req.batch.save()
        .then((batch) => {
          req.batch = batch
          next()
        })
        .catch((error) => next(error))

    },

    getStudents,

    (req, res, next) => {
      io.emit('action', {
        type: 'BATCH_STUDENTS_UPDATED',
        payload: {
          batch: req.batch,
          student: req.students
        }
      })
      res.json(req.students)
    })

  return router
}
