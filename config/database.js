var mongoose = require('mongoose');

module.exports = function(envConfig) {
	// register models
	require('./models/Demo');
	require('./models/Forecast');
	require('./models/Coefs');

	mongoose
		.connect(
			envConfig.database,
			{ useNewUrlParser: true }
		)
		.then(() => {
			console.log('Connected to the database!');
		})
		.catch(err => {
			console.log(err);
		});
};
