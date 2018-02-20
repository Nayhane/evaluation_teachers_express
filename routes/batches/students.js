// routes/students.js
const router = require('express').Router()
const passport = require('../../config/auth')
const { student, User } = require('../../models')

const authenticate = passport.authorize('jwt', { session: false })

module.exports = io => {
  router
    .get('/students', (req, res, next) => {
      student.find()
        // Newest students first
        .sort({ startedAt: -1 })
        // Send the data in JSON format
        .then((students) => res.json(students))
        // Throw a 500 error if something goes wrong
        .catch((error) => next(error))
    })
    .get('/students/:id', (req, res, next) => {
      const id = req.params.id

      student.findById(id)
        .then((student) => {
          if (!student) { return next() }
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .post('/students', authenticate, (req, res, next) => {
      const newstudent = {
        userId: req.account._id,
      }

      student.create(newstudent)
        .then((student) => {
          io.emit('action', {
            type: 'STUDENT_CREATED',
            payload: student
          })
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .put('/students/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const updatedstudent = req.body

      student.findByIdAndUpdate(id, { $set: updatedstudent }, { new: true })
        .then((student) => {
          io.emit('action', {
            type: 'STUDENT_UPDATED',
            payload: student
          })
          res.json(student)
        })
        .catch((error) => next(error))
    })
    .patch('/students/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      const patchForstudent = req.body

      student.findById(id)
        .then((student) => {
          if (!student) { return next() }

          const updatedstudent = { ...student, ...patchForstudent }

          student.findByIdAndUpdate(id, { $set: updatedstudent }, { new: true })
            .then((student) => {
              io.emit('action', {
                type: 'STUDENT_UPDATED',
                payload: student
              })
              res.json(student)
            })
            .catch((error) => next(error))
        })
        .catch((error) => next(error))
    })
    .delete('/students/:id', authenticate, (req, res, next) => {
      const id = req.params.id
      student.findByIdAndRemove(id)
        .then(() => {
          io.emit('action', {
            type: 'STUDENT_REMOVED',
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
