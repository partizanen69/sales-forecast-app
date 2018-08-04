var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var coefsSchema = new Schema({
    sigmaForc: Number,
    sigmaSales: Number,
    mape: Number,
});

mongoose.model('Coefs', coefsSchema);
