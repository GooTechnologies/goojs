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

var pipe = function (f, g) {
	return function () {
		return g(f.apply(null, arguments));
	};
};

// underscore doesn't have it
// NB! this is not a general-purpose deepClone
var deepClone = function (obj) {
	if (obj instanceof Array) {
		return obj.map(deepClone);
	} else if (typeof obj === 'object') {
		var clone = {};
		Object.keys(obj).forEach(function (key) {
			clone[key] = deepClone(obj[key]);
		});
		return clone;
	} else {
		return obj;
	}
};

exports.getFileName = getFileName;
exports.stringUntil = stringUntil;
exports.stringFrom = stringFrom;
exports.pipe = pipe;
exports.deepClone = deepClone;