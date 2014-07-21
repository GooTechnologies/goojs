var exec = require('child_process').exec;

var regex = /\((\d+(?:\.\d+)?)\)/;

function extractNumber(string) {
	var match = string.match(regex);
//	console.log(string, match);
	return +match[1];
}

function compare(actual, expected, callback) {
	var cmd = 'compare -metric RMSE ' + actual + ' ' + expected + ' ' + actual + '-diff.png';

	exec(cmd, function (error, stdout, stderr) {
		callback(extractNumber(stderr));
	});
}

exports.compare = compare;