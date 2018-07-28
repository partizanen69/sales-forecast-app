const mongoose = require('mongoose'),
	csv = require('fast-csv'),
	Forecast = mongoose.model('Forecast');

module.exports = {
	viewPage: (req, res) => {
		Forecast.countDocuments({}, (err, num) => {
			if (err) res.send(err);
			res.render('get-start', {
				title: 'Getting started',
				numDocs: num,
			});
		});
	},
	upload: (req, res) => {
		if (!req.files)
			res.status(400).send('No files were uploaded');
		var importFile = req.files.csv;
		var arrToDb = [];
		csv.fromString(importFile.data.toString(), {
			headers: true,
			ignoreEmpty: true,
			delimiter: ';',
		})
			.on('data', data => {
				arrToDb.push(data);
			})
			.on('end', () => {
				Forecast.create(arrToDb, (err, docs) => {
					if (err) res.send(err);
				});
				res.redirect('/get-start');
			});
	},
	clear: (req, res) => {
		Forecast.remove({}, (err, result) => {
			if (err) res.send(err);
			res.redirect('/get-start');
		});
	},
};
