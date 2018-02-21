const mongoose = require('../config/database')
const { Schema } = mongoose

const evaluationSchema = new Schema({
  color: { type: String, required: true },
  remark: { type: String },
  student_id: { type: String, required: true },
});

module.exports = mongoose.model('evaluations', evaluationSchema)
