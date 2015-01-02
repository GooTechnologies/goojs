'use strict';

var util = require('./util');

var SUPPORTED_TAGS = [
	'description', '@param', '@returns', '@example', '@example-link', '@readonly', '@type',
	'@default', '@deprecated', '@property', '@extends', '@hidden', '@private', '@target-class'
];

var stripStars = function (string) {
	var stripped = string.replace(/^[ \t\n]*\*?[ \t\n]*|[ \t\n]+$/g, '');
	return stripped.replace(/^[ \t]*\* ?/gm, '');
};

var partition = function (doc) {
	var tags = { description: [] };

	var currentTag = 'description';

	var lines = doc.split('\n');

	var partial = [];
	lines.forEach(function (line) {
		if (line[0] === '@') {
			tags[currentTag].push(partial);

			var indexOfSpace = line.indexOf(' ');
			if (indexOfSpace > -1) {
				currentTag = util.stringUntil(line, ' ');
				partial = [util.stringFrom(line, ' ')];
			} else {
				currentTag = line;
				partial = [];
			}

//			currentTag = currentTag.substring(1);

			if (!tags[currentTag]) {
				tags[currentTag] = [];
			}
		} else {
			partial.push(line);
		}
	});

	tags[currentTag].push(partial);


	Object.keys(tags).forEach(function (tagName) {
		tags[tagName] = tags[tagName].map(function (lines) {
			return lines.join('\n');
		});
	});

	return tags;
};

var warnOnRogueTags = function (tags) {
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		if (SUPPORTED_TAGS.indexOf(tag) === -1) {
			console.warn('Unsupported tag ' + tag);
		}
	}
};

var indexOfMatchingParen = function (string, offset, openParen, closeParen) {
	var i = offset;
	var parens = 1;

	while (i < string.length) {
		i++;
		if (string[i] === openParen) {
			parens++;
		} else if (string[i] === closeParen) {
			parens--;
			if (parens === 0) {
				return i;
			}
		}
	}

	return -1;
};

var extractType = function (string, offset) {
	var i = string.indexOf('{', offset);
	if (i === -1) { return { type: '', end: offset }; }

	var end = indexOfMatchingParen(string, i, '{', '}');

	return {
		end: end + 1,
		type: string.substring(i + 1, end)
	};
};

var extractName = function (string, offset) {
	var i = offset;
	while (string[i] === ' ') {
		i++;
	}

	var name, default_, optional = false, end;
	if (string[i] === '[') {
		optional = true;
		// should instead find the matching ']'
		var endParen = indexOfMatchingParen(string, i, '[', ']');
		end = endParen;
		var equals = string.indexOf('=', i);

		if (equals !== -1 && equals < endParen) {
			name = string.substring(i + 1, equals);
			default_ = string.substring(equals + 1, endParen);
		} else {
			name = string.substring(i + 1, endParen);
		}
		end += 2;
	} else {
		var space = string.indexOf(' ', i + 1);
		var newLine = string.length;

		end = space !== -1 ? space : newLine;
		name = string.substring(i, end);
		end += 1;
	}

	return {
		name: name,
		default_: default_,
		optional: optional,
		end: end
	};
};

var extractDescription = function (string, offset) {
	var i = offset;
	while (string[i] === ' ') {
		i++;
	}

	return {
		description: string.substring(i),
		end: string.length
	};
};

var extractUntil = function (string, until, offset) {
	var i = offset;
	while (string[i] === ' ') {
		i++;
	}

	var limit = string.indexOf(until, i);

	return {
		string: string.substring(i, limit),
		end: limit
	};
};

var extractTagParam = function (param) {
	var typeData = extractType(param, 0);
	var type = typeData.type;
	var offset = typeData.end;

	var nameData = extractName(param, offset);
	var name = nameData.name;
	var offset = nameData.end;
	var default_ = nameData.default_;
	var optional = nameData.optional;

	var descriptionData = extractDescription(param, offset);
	var description = descriptionData.description;

	return {
		type: type,
		name: name,
		default_: default_,
		optional: optional,
		description: description
	};
};

var extractTagProperty = extractTagParam; // same for now

var extractTagReturn = function (returns) {
	var typeData = extractType(returns, 0);
	var type = typeData.type;
	var offset = typeData.end;

	var descriptionData = extractDescription(returns, offset);
	var description = descriptionData.description;

	return {
		type: type,
		description: description
	};
};

var extractTagType = function (type) {
	var typeData = extractType(type, 0);

	return {
		type: typeData.type
	};
};

var extractTagDefault = function (default_) {
	// no processing required
	return {
		default_: default_
	};
};

var extractTagDeprecated = function (deprecated) {
	// no processing required
	return {
		description: deprecated
	};
};

var extractTagExtends = function (extends_) {
	// no processing required
	return {
		base: extends_
	};
};

var extractTagExampleLink = function (exampleLink) {
	var linkData = extractUntil(exampleLink, ' ', 0);
	var link = linkData.string;
	var offset = linkData.end;

	var textData = extractDescription(exampleLink, offset);

	var text = textData.description;

	return {
		link: link,
		text: text
	};
};

var extractTagTargetClass = function (targetClass) {
	// @target-class <class> <name> method|member|static-member|static-method
	var match = targetClass.match(/^\s*(\w+)\s+(\w+)\s+(method|member|static-method|static-member|constructor)/);
	if (!match) { throw new Error('malformed @target-class; got ' + targetClass); }
	return {
		className: match[1],
		itemName: match[2],
		itemType: match[3]
	};
};

var extractTagGroup = function (group) {
	// no processing required
	return {
		group: group
	};
};

var extractTagRequirePath = function (requirePath) {
	// no processing required
	return {
		requirePath: requirePath
	};
};

var extract = function (doc) {
	var stripped = stripStars(doc);

	var tags = partition(stripped);

	warnOnRogueTags(Object.keys(tags));

	tags['description'] = tags['description'][0];

	if (tags['@param']) {
		tags['@param'] = tags['@param'].map(extractTagParam);
	}

	if (tags['@returns']) {
		tags['@returns'] = extractTagReturn(tags['@returns'][0]);
	}

	if (tags['@example']) {
		tags['@example'] = tags['@example'][0];
	}

	if (tags['@example-link']) {
		tags['@example-link'] = extractTagExampleLink(tags['@example-link'][0]);
	}

	if (tags['@type']) {
		tags['@type'] = extractTagType(tags['@type'][0]);
	}

	if (tags['@default']) {
		tags['@default'] = extractTagDefault(tags['@default'][0]);
	}

	if (tags['@deprecated']) {
		tags['@deprecated'] = extractTagDeprecated(tags['@deprecated'][0]);
	}

	if (tags['@property']) {
		tags['@property'] = tags['@property'].map(extractTagProperty);
	}

	if (tags['@extends']) {
		tags['@extends'] = extractTagExtends(tags['@extends'][0]);
	}

	// --- only when @target-class is present ---
	if (tags['@target-class']) {
		tags['@target-class'] = extractTagTargetClass(tags['@target-class'][0]);
	}

	if (tags['@group']) {
		tags['@group'] = extractTagGroup(tags['@group'][0]);
	}

	if (tags['@require-path']) {
		tags['@require-path'] = extractTagRequirePath(tags['@require-path'][0]);
	}

	return tags;
};

exports._partition = partition;
exports._extractType = extractType;
exports._extractName = extractName;
exports._extractDescription = extractDescription;
exports._extractTagParam = extractTagParam;
exports._extractTagReturn = extractTagReturn;
exports._extractTagType = extractTagType;
exports._extractTagTargetClass = extractTagTargetClass;
exports.extract = extract;