const mongoose = require('mongoose'),
	csv = require('fast-csv'),
	Forecast = mongoose.model('Forecast');

module.exports = {
	viewPage: (req, res) => {
		Forecast.find({})
			.sort({ weekISO: 1 })
			.exec((err, objs) => {
				if (err) res.send(err);

				var tableData = objs.map(i => {
					if (i.sales) i.sales = i.sales.toFixed(2);
					if (i.seasCoef)
						i.seasCoef = i.seasCoef.toFixed(2);
					if (i.clearSales)
						i.clearSales = i.clearSales.toFixed(2);
					if (i.trend) i.trend = i.trend.toFixed(2);
					if (i.forecast)
						i.forecast = i.forecast.toFixed(2);
					if (!isNaN(i.weightedAvg))
						i.weightedAvg = i.weightedAvg.toFixed(2);
					return i;
				});

				res.render('get-start', {
					title: 'Getting started',
					tableData,
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
				data.year = data.weekISO.substr(0, 4);
				data.weekNum = data.weekISO.substr(-2);
				arrToDb.push(data);
			})
			.on('end', () => {
				Forecast.create(arrToDb, (err, docs) => {
					if (err) res.send(err);
				});
				res.redirect('/get-start');
			});
	},
	calculate: (req, res) => {
		Forecast.find({})
			.sort({ weekISO: 1 })
			.exec((err, objs) => {
				objs.forEach((i, idx) => {
					//calculate period number
					Forecast.findOneAndUpdate(
						{ _id: objs[idx]._id },
						{ perNum: idx + 1 },
						(err, doc) => {
							if (err) console.log(err);
						}
					);

					//calculate weighted average
					if (idx > 25 && idx < objs.length - 26) {
						var a = objs[idx - 26].sales / 2;
						var b = objs[idx + 26].sales / 2;
						var c = 0;
						for (var i = idx - 25; i < idx; i++) {
							c += objs[i].sales;
						}
						var d = 0;
						for (var i = idx + 25; i > idx; i--) {
							d += objs[i].sales;
						}
						var weightedAvg = (a + b + c + d) / 52;
						Forecast.findOneAndUpdate(
							{ _id: objs[idx]._id },
							{ weightedAvg: weightedAvg },
							(err, doc) => {
								if (err) console.log(err);
							}
						);
					} else {
						Forecast.findOneAndUpdate(
							{ _id: objs[idx]._id },
							{ weightedAvg: 'No data' },
							(err, doc) => {
								if (err) console.log(err);
							}
						);
					}

					//calculate seasonal coefficient
					if (idx > 25 && idx < objs.length - 26) {
						var { sales, weightedAvg } = objs[idx];
						var seasCoef = sales / weightedAvg;
						Forecast.findOneAndUpdate(
							{ _id: objs[idx]._id },
							{ seasCoef: seasCoef },
							(err, doc) => {
								if (err) console.log(err);
							}
						);
					}
					if (idx < 26) {
						Forecast.find({
							year: objs[idx].year + 1,
							weekNum: objs[idx].weekNum,
						}).exec((err, docs) => {
							Forecast.findOneAndUpdate(
								{ _id: objs[idx]._id },
								{ seasCoef: docs[0].seasCoef },
								(err, doc) => {
									if (err) console.log(err);
								}
							);
						});
					}
					if (idx >= objs.length - 26) {
						Forecast.find({
							year: objs[idx].year - 1,
							weekNum: objs[idx].weekNum,
						}).exec((err, docs) => {
							Forecast.findOneAndUpdate(
								{ _id: objs[idx]._id },
								{ seasCoef: docs[0].seasCoef },
								(err, doc) => {
									if (err) console.log(err);
								}
							);
						});
					}
				});
			});
		res.redirect('/get-start');
	},
	clear: (req, res) => {
		Forecast.remove({}, (err, result) => {
			if (err) res.send(err);
			res.redirect('/get-start');
		});
	},
};
