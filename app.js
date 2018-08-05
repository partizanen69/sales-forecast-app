const express = require('express'),
	app = express();

// Environments
var env = process.env.NODE_ENV || 'development';
var envConfig = require('./config/env')[env];

// Express configuration
require('./config/config')(app, envConfig);

// Database
require('./config/database')(envConfig);

// Routes
require('./config/routes')(app);

//Start server
app.listen(envConfig.port, () => {
	console.log('Server has started!!!');
});
