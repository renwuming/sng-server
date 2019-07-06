var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productionSchema = new Schema({
  name: String,
  blindTime: Number,
  levelList: Array,
  sumTime: Number,
  startAt: Number, // 开始比赛的时间
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

module.exports = mongoose.model('game', productionSchema)