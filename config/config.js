const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	lessMiddleware = require('less-middleware'),
	mongoose = require('mongoose'),
	fileUpload = require('express-fileupload'),
	session = require('express-session');

module.exports = (app, envConfig) => {
	//view engine setup
	app.set('views', path.join(envConfig.rootPath, 'views'));
	app.set('view engine', 'jade');

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(fileUpload());
	app.use(lessMiddleware(envConfig.rootPath + '/public'));
	app.use(session({ secret: 'ssshhhhh' }));

	//telling express to serve static objects from public folder
	app.use(express.static(path.join(envConfig.rootPath, 'public')));
};
