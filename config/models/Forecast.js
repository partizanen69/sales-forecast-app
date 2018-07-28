var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var forecastSchema = new Schema({
    weekISO: Number,
    year: Number,
    weekNum: Number,
    sales: Number,
    weightedAvg: Schema.Types.Mixed,
    seasCoef: Number,
    perNum: Number,
    clearSales: Number,
    trend: Number,
    forecast: Number,
});

mongoose.model('Forecast', forecastSchema);
