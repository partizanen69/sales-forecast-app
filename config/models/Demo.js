var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// todo model
var demoSchema = new Schema({
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

mongoose.model('Demo', demoSchema);
