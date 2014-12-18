'use strict';

/**
 Builds the index used to generate the nav bar
 */

var _ = require('underscore');
var util = require('./util');

var HTML_SUFFIX = '-doc.html';

function getDifferentiatorIndex(strings) {
	var minLength = strings.reduce(function (prev, cur) {
		return Math.min(prev, cur.length);
	}, strings[0].length);

	for (var i = 0; i < minLength; i++) {
		for (var j = 0; j < strings.length; j++) {
			var string = strings[j];
			if (string[i] !== strings[0][i]) {
				return i;
			}
		}
	}
}

function getIndex(files) {
	var differentiator = getDifferentiatorIndex(files);

	var groups = _.groupBy(files, function (file) {
		return file.substring(differentiator, file.indexOf('/', differentiator));
	});

	var mapping = {};
	var index = Object.keys(groups).map(function (name) {
		var group = groups[name];
		return {
			name: name,
			classes: group.map(function (file) {
				var fileName = util.getFileName(file);
				var path = file.substring(differentiator, file.length - 3);
				var entry = {
					name: fileName,
					path: path,
					link: fileName + HTML_SUFFIX
				};
				mapping[file] = entry;
				return entry;
			})
		};
	});

	return {
		index: index,
		mapping: mapping
	};
}


exports.getIndex = getIndex;