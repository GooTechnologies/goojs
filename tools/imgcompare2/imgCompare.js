var exec = require('child_process').exec;

var regex = /\((\d+(?:\.\d+)?)\)/;

function extractNumber(string) {
	if (!regex.test(string)) {
		console.error('Imagemagick\'s compare method failed');
		console.error(string);
		return Infinity;
	}

	var match = string.match(regex);
	return +match[1];
}

function compare(actual, expected, callback) {
	var cmd = 'compare -metric RMSE ' + actual + ' ' + expected + ' ' + actual + '-diff.png';

	exec(cmd, function (error, stdout, stderr) {
		callback(extractNumber(stderr));
	});
}

exports.compare = compare;