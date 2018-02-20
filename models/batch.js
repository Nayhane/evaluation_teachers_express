// models/batch.js
const mongoose = require('../config/database')
const { Schema } = mongoose

const batchSchema = new Schema({
  students: [{ type: Schema.Types.ObjectId, ref: 'students'}],
  batchNumber: {type: Number, required: true},
  startAt: { type: Date, default: Date.now, required: true },
  endAt: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model('batches', batchSchema)
