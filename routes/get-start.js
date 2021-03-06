const mongoose = require('mongoose'),
	csv = require('fast-csv'),
	Forecast = mongoose.model('Forecast'),
	Coefs = mongoose.model('Coefs');

module.exports = {
	viewPage: (req, res) => {
		const one = new Promise((resolve, reject) => {
			Forecast.find({})
				.sort({ weekISO: 1 })
				.exec((err, objs) => {
					if (err) console.log(err);
					resolve(objs);
				});
		});

		const two = objs => {
			return new Promise((resolve, reject) => {
				var cats = [];
				var sales = [];
				var forecast = [];

				var tableData = objs.map((i, idx) => {
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

					cats.push(i.weekISO);
					i.sales ? sales.push(i.sales) : sales.push(0);
					idx < objs.length - 52
						? forecast.push(0)
						: forecast.push(i.forecast);
					return i;
				});

				var uploadErr = req.session.uploadErr;
				req.session.uploadErr = null;
				var calcErr = req.session.calcErr;
				req.session.calcErr = null;

				var obj = {
					tableData,
					chartData: JSON.stringify({
						cats: cats,
						sales: sales,
						forecast: forecast,
					}),
					uploadErr,
					calcErr,
					title: 'Getting started',
				};
				resolve(obj);
			});
		};

		const three = obj => {
			return new Promise((resolve, reject) => {
				Coefs.find({}, (err, docs) => {
					if (err) console.log(err);
					if (docs[0]) {
						const {
							sigmaForc,
							sigmaSales,
							mape,
						} = docs[0];
						var objToRender = Object.assign(obj, {
							sigmaForc,
							sigmaSales,
							mape,
						});
						resolve(objToRender);
						return true;
					}
					resolve(obj);
				});
			});
		};

		one.then(two)
			.then(three)
			.then(objToRender => {
				res.render('get-start', objToRender);
			})
			.catch(error => console.log(error));
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
				if (arrToDb.length > 101) {
					Forecast.create(arrToDb, (err, docs) => {
						if (err) res.send(err);
					});
				} else {
					req.session.uploadErr =
						'For precise forecast input data shall consist of at least 102 rows (2 years).';
				}
				res.redirect('/get-start');
			});
	},
	calculate: (req, res) => {
		Forecast.countDocuments({}, (err, count) => {
			if (count) {
				calculate();
			} else {
				req.session.calcErr =
					'You have no data to calculate. Upload file with initial data';
				res.redirect('/get-start');
			}
		});

		calculate = () => {
			one.then(two)
				.then(three)
				.then(four)
				.then(five)
				.then(objs => {
					for (var i = 0; i < objs.length - 52; i++) {
						Forecast.findOneAndUpdate(
							{ _id: objs[i]._id },
							{
								perNum: objs[i].perNum,
								weightedAvg: objs[i].weightedAvg,
								seasCoef: objs[i].seasCoef,
								clearSales: objs[i].clearSales,
								trend: objs[i].trend,
								forecast: objs[i].forecast,
							},
							(err, doc) => {
								if (err) console.log(err);
							}
						);
					}
					for (
						var i = objs.length - 52;
						i < objs.length;
						i++
					) {
						Forecast.findOneAndUpdate(
							{ _id: mongoose.Types.ObjectId() },
							{
								weekISO: objs[i].weekISO,
								year: objs[i].year,
								weekNum: objs[i].weekNum,
								perNum: objs[i].perNum,
								seasCoef: objs[i].seasCoef,
								trend: objs[i].trend,
								forecast: objs[i].forecast,
							},
							{ upsert: true },
							(err, docs) => {
								if (err) console.log(err);
							}
						);
					}
				})
				.then(() => {
					res.redirect('/get-start');
				})
				.catch(error => console.log(error));
		};

		const five = objs => {
			return new Promise((resolve, reject) => {
				var forecArr = objs.slice(objs.length - 52);
				var saleArr = objs.slice(0, objs.length - 52);

				//mean square deviation for forecasted sales last 52 weeks
				var avgForecast =
					forecArr.reduce(
						(sum, item) => sum + item.forecast,
						0
					) / 52;
				var forcDiffAvg = forecArr.map((item, idx) =>
					Math.pow(item.forecast - avgForecast, 2)
				);
				var sigmaForc = Math.sqrt(
					forcDiffAvg.reduce((sum, item) => sum + item, 0) /
						52
				);

				//mean square deviation for actual sales
				var avgSales =
					saleArr.reduce(
						(sum, item) => sum + item.sales,
						0
					) / saleArr.length;
				var saleDiffAvg = saleArr.map((item, idx) =>
					Math.pow(item.sales - avgSales, 2)
				);
				var sigmaSales = Math.sqrt(
					saleDiffAvg.reduce((sum, item) => sum + item, 0) /
						saleDiffAvg.length
				);

				//mean absolute percentage error
				var sumOfDiff = saleArr.reduce((sum, item) => {
					return (
						sum +
						Math.abs(
							(item.sales - item.forecast) / item.sales
						)
					);
				}, 0);
				var mape = (1 / saleArr.length) * sumOfDiff;

				Coefs.findOneAndUpdate(
					{ _id: mongoose.Types.ObjectId() },
					{
						sigmaForc: sigmaForc.toFixed(2),
						sigmaSales: sigmaSales.toFixed(2),
						mape: mape.toFixed(2),
					},
					{ upsert: true },
					(err, docs) => {
						if (err) console.log(err);
					}
				);

				resolve(objs);
			});
		};

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
			return new Promise((resolve, reject) => {
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
				resolve(objs);
			});
		};

		const three = objs => {
			return new Promise((resolve, reject) => {
				//calculate cleared sales
				objs.forEach((i, idx) => {
					i.clearSales = i.sales / i.seasCoef;
					i.xTimesY = i.perNum * i.clearSales;
					i.xSqr = Math.pow(i.perNum, 2);
				});
				resolve(objs);
			});
		};

		const four = objs => {
			return new Promise((resolve, reject) => {
				var c = 0,
					d = 0,
					e = 0,
					f = 0;
				for (var i = 0; i < objs.length; i++) {
					c += objs[i].xTimesY; //sum x*y
					d += objs[i].perNum;
					e += objs[i].clearSales;
					f += objs[i].xSqr; //sum of x^2
				}
				d /= objs.length; // average of sum of periods
				e /= objs.length; //average cleared sales
				b =
					(c - objs.length * d * e) /
					(f - objs.length * Math.pow(d, 2)); //b value of linear regression
				a = e - b * d; //a value of linear regression

				//add weekISO values for new 52 weeks
				var lastWeek = objs[objs.length - 1].weekISO;
				var lastPerNum = objs[objs.length - 1].perNum;
				for (var i = 0; i < 52; i++) {
					lastWeek += 1;
					var qq = String(lastWeek).substr(-2);
					if (qq <= 52) {
						objs.push({ weekISO: lastWeek });
					} else {
						lastWeek =
							100 *
								(Number(
									String(lastWeek).substr(0, 4)
								) +
									1) +
							1;
						objs.push({ weekISO: lastWeek });
					}
				}

				//add year, weekNum and period num for new 52 weeks
				for (var i = objs.length - 52; i < objs.length; i++) {
					objs[i].year = Number(
						String(objs[i].weekISO).substr(0, 4)
					);
					objs[i].weekNum = Number(
						String(objs[i].weekISO).substr(-2)
					);
					lastPerNum += 1;
					objs[i].perNum = lastPerNum;
				}

				//add seas coeff for new 52 weeks
				for (var i = objs.length - 52; i < objs.length; i++) {
					var relValue1 = objs.find(elem => {
						return (
							objs[i].year - 1 === elem.year &&
							objs[i].weekNum === elem.weekNum
						);
					});

					var relValue2 = objs.find(elem => {
						return (
							objs[i].year - 2 === elem.year &&
							objs[i].weekNum === elem.weekNum
						);
					});

					objs[i].seasCoef =
						(relValue1.seasCoef + relValue2.seasCoef) / 2;
				}

				//calc trend and forecast based on a and b values
				objs.forEach((item, idx) => {
					item.trend = a + b * item.perNum;
					item.forecast = item.trend * item.seasCoef;
				});

				resolve(objs);
			});
		};
	},
	clear: (req, res) => {
		Forecast.remove({}, (err, result) => {
			if (err) res.send(err);
		});
		Coefs.remove({}, (err, result) => {
			if (err) res.send(err);
		});
		res.redirect('/get-start');
	},
};
