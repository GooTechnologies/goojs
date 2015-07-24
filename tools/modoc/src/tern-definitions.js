// jshint node:true
'use strict';

/*
 tern definition generator - shared a lot of code with modoc
 will have to refactor the common parts out
 */

/**
 Main file
 + parses comment line args
 + gets the source files to be processed
 + gets data for the index (nav bar)
 + gets the processed documentation
 + generates every -doc file
 + generates an index file (in this case Entity.js)
 + generates the changelog in a pretty format
 */

var fs = require('fs');
var glob = require('glob');
var _ = require('underscore');

var extractor = require('./extractor');
var jsdocProcessor = require('./jsdoc-processor');
var util = require('./util');

var typeParser = require('./type-expressions/type-parser');
var ternSerializer = require('./type-expressions/tern-serializer');


function processArguments() {
	if (process.argv.length < 4) {
		console.log('Usage: node tern.js <sourcePath> <outPath>');
	}

	return {
		sourcePath: process.argv[2],
		outPath: process.argv[3]
	};
}

var getFiles = function (sourcePath, ignore) {
	if (/\.js$/.test(sourcePath)) {
		return [sourcePath];
	}

	return glob.sync(sourcePath + '/**/*.js').filter(function (file) {
		return ignore.every(function (term) {
			return file.indexOf(term) === -1;
		});
	});
};

var args = processArguments();

var files = getFiles(args.sourcePath, ['goo.js', 'pack.js', 'logicpack', 'soundmanager', '+']);

function filterPrivates(class_) {
	var predicate = function (entry) {
		return entry.comment && !(entry.comment.private || entry.comment.hidden);
	};

	class_.members = class_.members.filter(predicate);
	class_.staticMembers = class_.staticMembers.filter(predicate);
	class_.methods = class_.methods.filter(predicate);
	class_.staticMethods = class_.staticMethods.filter(predicate);

	class_.hasMembers = class_.members.length > 0;
	class_.hasStaticMethods = class_.staticMethods.length > 0;
	class_.hasStaticMembers = class_.staticMembers.length > 0;
	class_.hasMethods = class_.methods.length > 0;
}

function compileDoc(files) {
	var classes = {};
	var extraComments = [];

	// extract information from classes
	files.forEach(function (file) {
		console.log('compiling tern definitions for ' + util.getFileName(file));

		var source = fs.readFileSync(file, { encoding: 'utf8' });

		var class_ = extractor.extract(source, file);

		Array.prototype.push.apply(extraComments, class_.extraComments);

		if (class_.constructor) {
			jsdocProcessor.all(class_, files);

			filterPrivates(class_);

			class_.file = file;

			classes[class_.constructor.name] = class_;
		}
	});

	// --- should stay elsewhere
	var constructorFromComment = function (comment) {
		jsdocProcessor.link(comment);
		return {
			name: comment.targetClass.itemName,
			params: _.pluck(comment.param, 'name'),
			comment: comment
		};
	};

	var memberFromComment = function (comment) {
		jsdocProcessor.link(comment);
		return {
			name: comment.targetClass.itemName,
			comment: comment
		};
	};

	var methodFromComment = constructorFromComment;
	var staticMethodFromComment = constructorFromComment;
	var staticMemberFromComment = memberFromComment;
	// ---

	// copy over the extra info from other classes
	// adding extras mentioned in @target-class
	extraComments.map(jsdocProcessor.compileComment)
	.forEach(function (extraComment) {
		var targetClassName = extraComment.targetClass.className;
		var targetClass = classes[targetClassName];

		if (!targetClass) {
			targetClass = {
				constructor: null,
				staticMethods: [],
				staticMembers: [],
				methods: [],
				members: []
			};
			classes[targetClassName] = targetClass;
		}

		switch (extraComment.targetClass.itemType) {
			case 'constructor':
				targetClass.constructor = constructorFromComment(extraComment);
				targetClass.requirePath = extraComment.requirePath.requirePath;
				targetClass.group = extraComment.group.group;
				break;
			case 'member':
				targetClass.members.push(memberFromComment(extraComment));
				break;
			case 'method':
				targetClass.methods.push(methodFromComment(extraComment));
				break;
			case 'static-member':
				targetClass.staticMembers.push(staticMemberFromComment(extraComment));
				break;
			case 'static-method':
				targetClass.staticMethods.push(staticMethodFromComment(extraComment));
				break;
		}
	});

	return classes;
}

// --- tern related ---
var convert = _.compose(ternSerializer.serialize, typeParser.parse);

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

function compileFunction(fun, urlParameter) {
	var ternDefinition = {
		'!url': 'http://code.gooengine.com/latest/docs/index.html?' + urlParameter
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
		'!url': 'http://code.gooengine.com/latest/docs/index.html?' + urlParameter
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

function compileClass(class_) {
	var className = class_.constructor.name;

	// constructor
	var ternConstructor = compileFunction(class_.constructor, 'c=' + className);

	// static methods
	class_.staticMethods.forEach(function (staticMethod) {
		var id = 'h=_smet_' + className + '_' + staticMethod.name;
		ternConstructor[staticMethod.name] = compileFunction(staticMethod, id);
	});

	// static properties
	class_.staticMembers.forEach(function (staticMember) {
		var id = 'h=_smbr_' + className + '_' + staticMember.name;
		ternConstructor[staticMember.name] = compileMember(staticMember, id);
	});

	// methods
	ternConstructor.prototype = {};
	class_.methods.forEach(function (method) {
		var id = 'h=_met_' + className + '_' + method.name;
		ternConstructor.prototype[method.name] = compileFunction(method, id);
	});

	return ternConstructor;
}

function buildClasses(classes) {
	var classDefinitions = _.mapObject(classes, compileClass);

	var ternDefinition = {
		'!name': 'goo',
		'!define': {
			'Context': {
				'entity': '+goo.Entity',
				'world': '+goo.World',
				'entityData': '+object',
				'worldData': '+object',
				'domElement': '+Element',
				'viewportWidth ': 'number',
				'viewportHeight': 'number',
				'activeCameraEntity': '+goo.Entity'
			}
		},
		'args': '?',
		'ctx': 'Context',
		'goo': classDefinitions
	};

	var result = JSON.stringify(ternDefinition, null, '\t');

	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'tern-defs.json', result);
}

(function () {
	var classes = compileDoc(files);

	buildClasses(classes);

	console.log('tern definitions built');
})();