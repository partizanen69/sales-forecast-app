const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	lessMiddleware = require('less-middleware'),
	mongoose = require('mongoose'),
	fileUpload = require('express-fileupload'),
	session = require('express-session'),
	app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(lessMiddleware(__dirname + '/public'));
app.use(session({ secret: 'ssshhhhh' }));

//telling express to serve static objects from public folder
app.use(express.static(path.join(__dirname, 'public')));

//connecting to the db
require('./config/models/Demo');
require('./config/models/Forecast');
mongoose.connect(
	'mongodb://localhost/sales-forecast',
	() => {
		console.log('Connected to the database');
	}
);

//routes
var router = express.Router();

//routes for demo page
var demo = require('./routes/demo');
router.get('/demo', demo.viewPage);
router.post('/demo/create', demo.fillCollectionWithData);

//route for get-start page
var getStart = require('./routes/get-start');
router.get('/get-start', getStart.viewPage);
router.post('/get-start/upload', getStart.upload);
router.post('/get-start/clear', getStart.clear);
router.post('/get-start/calc', getStart.calculate);

app.use('/', router);

app.get('/', (req, res) => {
	res.render('home', { title: 'Sales forecast' });
});

//start server
app.listen(3000, () => {
	console.log('Server has started!!!');
});
