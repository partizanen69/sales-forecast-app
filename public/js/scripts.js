$(document).ready(init);

function init() {
	$('input:file').change(isUpload);
	$('.chart-btn').click(showChart);
	$('.table-btn').click(showTable);
	buildChart();
}

function showTable() {
	$('.demo-table-wrapper').removeClass('hidden');
	$('#container').addClass('hidden');
	$('.table-btn').addClass('active');
	$('.chart-btn').removeClass('active');
}

function showChart() {
	$('.demo-table-wrapper').addClass('hidden');
	$('#container').removeClass('hidden');
	$('.table-btn').removeClass('active');
	$('.chart-btn').addClass('active');
}

function isUpload() {
	const val = $(this).val();
	const isCSV = /.csv$/.test(val);
	const isResult = $('#result-table td').length;
	if (val && isCSV && !isResult) {
		$('#upload').attr('disabled', false);
		$('.msg-upload').html('1 file has been uploaded correctly');
	}
	if (!isCSV) {
		$('.msg-upload').html(
			'<span>Sorry, uploaded file is not CSV</span>'
		);
	}
	if (isResult) {
		$('.msg-upload').html(
			'<span>Please clear existing data first</span>'
		);
	}
}

function buildChart() {
	$(function() {
		var myChart = Highcharts.chart('container', {
			chart: {
				type: 'areaspline',
			},
			title: {
				text:
					'Actual sales within specified period and forecasted sales',
			},
			legend: {
				layout: 'vertical',
				align: 'left',
				verticalAlign: 'top',
				x: 150,
				y: 100,
				floating: true,
				borderWidth: 1,
				backgroundColor:
					(Highcharts.theme &&
						Highcharts.theme.legendBackgroundColor) ||
					'#FFFFFF',
			},
			xAxis: {
				categories: data.cats,
				plotBands: [
					{
						// visualize the weekend
						from: 4.5,
						to: 6.5,
						color: 'rgba(68, 170, 213, .2)',
					},
				],
			},
			yAxis: {
				title: {
					text: 'Sales, UAH',
				},
			},
			tooltip: {
				shared: true,
				valueSuffix: ' UAH',
			},
			credits: {
				enabled: false,
			},
			plotOptions: {
				areaspline: {
					fillOpacity: 0.5,
				},
			},
			series: [
				{
					name: 'Actual Sales',
					data: data.sales,
				},
				{
					name: 'Forecast',
					data: data.forecast,
				},
			],
		});
	});
}
