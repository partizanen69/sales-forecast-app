var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// todo model
var demoSchema = new Schema({
    weekISO: Number,
    year: Number,
    weekNumber: Number,
    sales: Number,
    weigtedAverage: Number,
    seasonalCoefficient: Number,
    periodNumber: Number,
    salesClearedFromSeasonality: Number,
    trend: Number,
    forecast: Number
})

mongoose.model('Demo', demoSchema);