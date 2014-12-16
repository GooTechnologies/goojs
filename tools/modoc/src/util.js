'use strict';

var isWin = /^win/.test(process.platform);

var regex = isWin ? /\\?(\w+)\.js$/ : /\/?(\w+)\.js$/;

var getFileName = function (file) {
	return file.match(regex)[1];
};

var stringUntil = function (string, until) {
	return string.slice(0, string.indexOf(until));
};

var stringFrom = function (string, from) {
	return string.slice(string.indexOf(from) + 1);
};

exports.getFileName = getFileName;
exports.stringUntil = stringUntil;
exports.stringFrom = stringFrom;