// models/batch.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const studentSchema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  batch_id: { type: String, required: true },
  evaluations: [{ type: Schema.Types.ObjectId, ref: 'evaluations'}],
});

module.exports = mongoose.model('students', studentSchema)
