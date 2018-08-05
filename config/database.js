var mongoose = require('mongoose');

module.exports = function(envConfig) {
	// register models
	require('./models/Demo');
	require('./models/Forecast');
	require('./models/Coefs');

	// connect to database
	mongoose.connect(
		envConfig.database,
		() => {
			console.log('Connected to the database!');
		}
	);
};
