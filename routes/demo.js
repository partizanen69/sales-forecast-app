const mongoose = require('mongoose'),
    Demo = mongoose.model('Demo');

module.exports = {
    viewPage: (req, res) => {
        Demo.find({})
            .sort({ weekISO: 1 })
            .exec((err, objs) => {
                if (err) console.log(err);
                var tableData = objs.map(i => {
                    if (i.sales) i.sales = i.sales.toFixed(2);
                    if (i.seasCoef)
                        i.seasCoef = i.seasCoef.toFixed(2);
                    if (i.clearSales)
                        i.clearSales = i.clearSales.toFixed(2);
                    if (i.trend) i.trend = i.trend.toFixed(2);
                    if (i.forecast)
                        i.forecast = i.forecast.toFixed(2);
                    if (i.weigtedAvg)
                        i.weigtedAvg = i.weigtedAvg.toFixed(2);
                    return i;
                });

                var cats = objs.map(i => i.weekISO);
                var actSales = objs.map(i => i.sales);
                var cond = actSales.filter(Number).length;
                var forecast = objs.map(
                    (i, idx) => (idx < cond ? 0 : i.forecast)
                );

                res.render('demo', {
                    title: 'Demo',
                    tableData,
                    chartData: JSON.stringify({
                        cats: cats,
                        sales: actSales,
                        forecast: forecast,
                    }),
                });
            });
    },
};
