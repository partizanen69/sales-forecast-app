$(document).ready(init);

function init() {
	$('input:file').change(isUpload);
}

function isUpload() {
	const val = $(this).val();
	const isCSV = /.csv$/.test(val);
	if (val && isCSV) {
		$('#upload').attr('disabled', false);
		$('#msg').remove();
	}
	if (!isCSV) {
		$('#upload').after(
			'<p id="msg">Sorry, uploaded file is not CSV</p>'
		);
	}
}
