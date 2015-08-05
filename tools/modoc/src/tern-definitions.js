// jshint node:true
'use strict';

/*
 tern definition generator - shared a lot of code with modoc
 will have to refactor the common parts out
 */

var fs = require('fs');
var _ = require('underscore');

var util = require('./util');
var trunk = require('./trunk');

var typeParser = require('./type-expressions/type-parser');
var ternSerializer = require('./type-expressions/tern-serializer');

var defaultTernDefinitions = require('./default-tern-definitions');


function processArguments() {
	if (process.argv.length < 4) {
		console.log('Usage: node tern.js <sourcePath> <outPath>');
	}

	return {
		sourcePath: process.argv[2],
		outPath: process.argv[3]
	};
}

// --- tern related ---
var convertParameters = function (parameters) {
	return parameters.filter(function (parameter) {
		// filter out sub-parameters of the form `settings.something`
		return parameter.name.indexOf('.') === -1;
	}).map(function (parameter) {
		return parameter.rawType ?
			parameter.name + ': ' + convert(parameter.rawType) :
			parameter.name;
	}).join(', ');
};

var DOC_BASE_URL = 'http://code.gooengine.com/latest/docs/index.html?';

function compileFunction(fun, urlParameter) {
	var ternDefinition = {
		'!url': DOC_BASE_URL + urlParameter
	};

	// just for debugging
	try {
		if (fun.comment) {
			ternDefinition['!doc'] = fun.comment.description || '';
			if (fun.comment.param) {
				var ending = fun.comment.returns && fun.comment.returns.rawType ?
					') -> ' + convert(fun.comment.returns.rawType) :
					')';

				ternDefinition['!type'] = 'fn(' + convertParameters(fun.comment.param) + ending;
			}
		}
	} catch (e) {
		console.log(urlParameter);
		throw e;
	}

	return ternDefinition;
}

function compileMember(member, urlParameter) {
	var ternDefinition = {
		'!url': DOC_BASE_URL + urlParameter
	};

	// just for debugging
	try {
		if (member.comment) {
			ternDefinition['!doc'] = member.comment.description || '';
			if (member.comment.type) {
				ternDefinition['!type'] = convert(member.comment.type.rawType);
			}
		}
	} catch (e) {
		console.log(urlParameter);
		throw e;
	}

	return ternDefinition;
}

// this creates more trouble than it's worth
function compileProperty(property, urlParameter) {
	var ternDefinition = {
		'!url': DOC_BASE_URL + urlParameter
	};

	// just for debugging
	try {
		ternDefinition['!doc'] = property.description || '';
		if (property.type) {
			ternDefinition['!type'] = convert(property.type);
		}
	} catch (e) {
		console.log(urlParameter);
		throw e;
	}

	return ternDefinition;
}

function compileClass(class_) {
	var className = class_.constructor.name;

	// constructor
	var ternConstructor = compileFunction(class_.constructor, 'c=' + className);

	// static methods
	class_.staticMethods.forEach(function (staticMethod) {
		var id = 'h=_smet_' + className + '_' + staticMethod.name;
		ternConstructor[staticMethod.name] = compileFunction(staticMethod, id);
	});

	// static members
	class_.staticMembers.forEach(function (staticMember) {
		var id = 'h=_smbr_' + className + '_' + staticMember.name;
		ternConstructor[staticMember.name] = compileMember(staticMember, id);
	});

	ternConstructor.prototype = {};

	// methods
	class_.methods.forEach(function (method) {
		var id = 'h=_met_' + className + '_' + method.name;
		ternConstructor.prototype[method.name] = compileFunction(method, id);
	});

	// members
	// they sit on the prototype in tern because...
	class_.members.forEach(function (member) {
		var id = 'h=_mbr_' + className + '_' + member.name;
		ternConstructor.prototype[member.name] = compileMember(member, id);
	});

	// members provided as properties to the constructor
	// these generate a lot of trouble
	if (class_.constructor.comment && class_.constructor.comment.property) {
		class_.constructor.comment.property.forEach(function (property) {
			var id = 'h=_mbr_' + className + '_' + property.name;
			ternConstructor.prototype[property.name] = compileProperty(property, id);
		});
	}

	return ternConstructor;
}

function makeConverter(classNames, definitions) {
	var typesRegexStr = '\\b(' + classNames.join('|') + ')\\b';
	var typesRegex = new RegExp(typesRegexStr, 'g');

	return function (closureType) {
		var parsed = typeParser.parse(closureType);
		var ternType = ternSerializer.serialize(parsed);

		// perform the substitutions after the conversion as this inflates the string with `goo.` prefixes
		// should this prefixing be done on the expression in parsed form instead? why?

		_.forEach(ternType.definitions, function (definition, key) {
			definitions[key] = _.mapObject(definition, function (member) {
				return member.replace(typesRegex, 'goo.$1');
			});
		});

		return ternType.serialized.replace(typesRegex, 'goo.$1');
	};
}

// this is a bit of a hack
var convert;

function buildClasses(classes) {
	var additionalDefinitions = {};

	var ternDefinitions = {
		'!name': 'goo',
		'!define': additionalDefinitions,
		'Context': defaultTernDefinitions['Context'],
		'Arguments': defaultTernDefinitions['Arguments']
	};

	convert = makeConverter(Object.keys(classes), additionalDefinitions);

	ternDefinitions.goo = _.mapObject(classes, compileClass);

	var result = JSON.stringify(ternDefinitions, null, '\t');

	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'tern-defs.json', result);
}


var args = processArguments();

var IGNORE_FILES = ['goo.js', 'pack.js', 'logicpack', 'soundmanager', '+'];

(function () {
	var files = trunk.getFiles(args.sourcePath, IGNORE_FILES);

	var classes = trunk.compileDoc(files);

	buildClasses(classes);

	console.log('tern definitions built');
})();