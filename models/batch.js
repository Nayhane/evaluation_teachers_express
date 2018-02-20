// models/batch.js
const mongoose = require('../config/database')
const { Schema } = mongoose


const studentSchema = new Schema({
  bacthId: { type: Schema.Types.ObjectId, ref: 'batches' },
  name: { type: String, required: true },
  photo: { type: String, required: true },
  color: { type: String, default: 'green' }
});


const batchSchema = new Schema({
  bathcId: {type: Number, required: true}
  studentId: [studentSchema],
  started: { type: Boolean, default: false },
  studentId: { type: Schema.Types.ObjectId, ref: 'students' },
  startedAt: { type: Date, default: Date.now },
  endAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('batches', batchSchema)
