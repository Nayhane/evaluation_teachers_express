// models/batch.js
const mongoose = require('../config/database')
const { Schema } = mongoose


const studentSchema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  evaluation: { type: String, default: 'green', required: true }
});


const batchSchema = new Schema({
  bathcNumber: {type: Number, required: true},
  startAt: { type: Date, default: Date.now },
  endAt: { type: Date, default: Date.now },
    // students: [studentSchema],
});

module.exports = mongoose.model('batch', batchSchema)
