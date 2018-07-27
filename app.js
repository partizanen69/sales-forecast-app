const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	lessMiddleware = require('less-middleware'),
	mongoose = require('mongoose'),
	app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(lessMiddleware(__dirname + '/public'));

//telling express to serve static objects from public folder
app.use(express.static(path.join(__dirname, 'public')));

//connecting to the db
require('./config/models/Demo');
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

app.use('/', router);

app.get('/', (req, res) => {
	res.render('home', { title: 'Sales forecast' });
});

app.get('/getting-started', (req, res) => {
	res.render('getting-started', { title: 'Getting started' });
});

//start server
app.listen(process.env.PORT, process.env.IP, () => {
	console.log('Server has started!!!');
});
