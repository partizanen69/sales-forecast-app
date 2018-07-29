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
		const one = new Promise((resolve, reject) => {
			Forecast.find()
				.sort({ weekISO: 1 })
				.exec((err, objs) => {
					objs.forEach((i, idx) => {
						//calculate period number
						i.perNum = idx + 1;

						//calculate weighted average
						if (idx > 25 && idx < objs.length - 26) {
							var a = objs[idx - 26].sales / 2;
							var b = objs[idx + 26].sales / 2;
							var c = 0;
							for (var z = idx - 25; z < idx; z++) {
								c += objs[z].sales;
							}
							var d = 0;
							for (var z = idx + 25; z > idx; z--) {
								d += objs[z].sales;
							}
							var weightedAvg = (a + b + c + d) / 52;
							i.weightedAvg = weightedAvg;
						} else {
							i.weightedAvg = 'No data';
						}

						//calculate seasonal coefficient for weeks > 26
						if (idx > 25 && idx < objs.length - 26) {
							var { sales, weightedAvg } = objs[idx];
							var seasCoef = sales / weightedAvg;
							i.seasCoef = seasCoef;
						}
						if (idx >= objs.length - 26) {
							var relValue = objs.find(
								elem =>
									elem.year ===
										objs[idx].year - 1 &&
									elem.weekNum === objs[idx].weekNum
							);
							i.seasCoef = relValue.seasCoef;
						}
					});
					resolve(objs);
				});
		});

		const two = objs => {
			//calculate seasonal coefficient first 26 weeks
			objs.forEach((i, idx) => {
				if (idx < 26) {
					var relValue = objs.find(
						elem =>
							elem.year === objs[idx].year + 1 &&
							elem.weekNum === objs[idx].weekNum
					);
					i.seasCoef = relValue.seasCoef;
				}
			});
			return Promise.resolve(objs);
		};

		const three = objs => {
			//calculate cleared sales
			objs.forEach((i, idx) => {
				i.clearSales = i.sales / i.seasCoef;
				i.xTimesY = i.perNum * i.clearSales;
				i.xSqr = Math.pow(i.perNum, 2);
			});
			return Promise.resolve(objs);
		};

		const four = objs => {
			//sum x*y
			var c = objs.reduce((sum, item) => {
				return sum + item.xTimesY;
			}, 0);
			console.log('c', c);

			// average of sum of periods
			var d =
				objs.reduce((sum, item) => {
					return sum + item.perNum;
				}, 0) / objs.length;
			console.log('d', d);

			//average cleared sales
			var e =
				objs.reduce((sum, item) => {
					return sum + item.clearSales;
				}, 0) / objs.length;
			console.log('e', e);

			//sum of x^2
			var f = objs.reduce((sum, item) => {
				return sum + item.xSqr;
			}, 0);
			console.log('f', f);
			console.log('objs[199].xSqr', objs[199].xSqr);
			console.log('objs[199].perNum', objs[199].perNum);

			g = objs.length * d * e;
			h = objs.length * Math.pow(d, 2);
			b = (c + g) / (f - h);

			console.log('b', b);

			return Promise.resolve(objs);
		};

		one.then(two)
			.then(three)
			.then(four)
			.then(objs => {
				objs.forEach((item, idx) => {
					Forecast.findOneAndUpdate(
						{ _id: item._id },
						{
							perNum: item.perNum,
							weightedAvg: item.weightedAvg,
							seasCoef: item.seasCoef,
							clearSales: item.clearSales,
						},
						(err, doc) => {
							if (err) console.log(err);
						}
					);
				});
			});

		res.redirect('/get-start');

		// one.then(two)
		// 	.then(three)
		// 	.then(four)
		// 	.catch(err => console.log(err.message));
	},
	clear: (req, res) => {
		Forecast.remove({}, (err, result) => {
			if (err) res.send(err);
			res.redirect('/get-start');
		});
	},
};
