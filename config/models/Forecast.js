var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var forecastSchema = new Schema({
    weekISO: Number,
    year: Number,
    weekNum: Number,
    sales: Number,
    weigtedAvg: Number,
    seasCoef: Number,
    perNum: Number,
    clearSales: Number,
    trend: Number,
    forecast: Number,
});

mongoose.model('Forecast', forecastSchema);
