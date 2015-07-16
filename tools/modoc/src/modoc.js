// jshint node:true
'use strict';

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
var childProcess = require('child_process');
var glob = require('glob');
var handlebars = require('handlebars');
var marked = require('marked');
var _ = require('underscore');

var extractor = require('./extractor');
var jsdocProcessor = require('./jsdoc-processor');
var indexBuilder = require('./index-builder');
var util = require('./util');


function processArguments() {
	if (process.argv.length < 6) {
		console.log('Usage: node modoc.js <sourcePath> <templatesPath> <staticsPath> <outPath>');
	}

	var sourcePath = process.argv[2];
	var templatesPath = process.argv[3];
	var staticsPath = process.argv[4];
	var outPath = process.argv[5];

	return {
		sourcePath: sourcePath,
		templatesPath: templatesPath,
		staticsPath: staticsPath,
		outPath: outPath
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

function copyStaticFiles(callback) {
	childProcess.exec(
		'cp -r ' + args.staticsPath + '/. ' + args.outPath,
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			callback();
		});
}

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
		console.log('compiling doc for ' + util.getFileName(file));

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

function resolveRequirePaths(classes, index) {
	index.forEach(function (group) {
		group.classes.forEach(function (entry) {
			var className = entry.name;
			var class_ = classes[className];

			if (!class_.requirePath) {
				class_.requirePath = entry.requirePath;
			}
		});
	});
}

function buildClasses(classes) {
	// var classTemplate = fs.readFileSync(
	// 	args.templatesPath + util.PATH_SEPARATOR + 'class.mustache', { encoding: 'utf8' });

	// var classesArray = Object.keys(classes).map(function (className) {
	// 	return classes[className];
	// });

	// var result = handlebars.compile(classTemplate)({ classes: classesArray });

	// fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'everything.html', result);

	// TernJS
	// var classTemplate = fs.readFileSync(
	// 	args.templatesPath + util.PATH_SEPARATOR + 'ternjs.mustache', { encoding: 'utf8' });

	var classesArray = Object.keys(classes).map(function (className) {
		return classes[className];
	});

	// var result = handlebars.compile(classTemplate)({ classes: classesArray });

//	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'tern.json', result);
	// fs.writeFileSync('D:\\Dropbox (Personligt)\\Public\\tern\\tern.json', result);	

	function cleanLink(type) {
		var reg = />(\w+)<\/a>/g;
		var myArray = reg.exec(type);
		if (myArray) {
			type = '+goo.' + myArray[1];
		}
		var ind = type.indexOf("|");
		if (ind > 0) {
			type = type.substring(0, ind);
		}
		type = type.trim();
		if (type.indexOf('[]', type.length - '[]'.length) !== -1) {
			type = '[' + type.substring(0, type.length - 2) + ']';
		}
		if (type === "boolean") {
			type = "bool";
		}
		if (type === "String") {
			type = "string";
		}
		if (type === "Number") {
			type = "number";
		}
		if (type === "Object") {
			type = "object";
		}
		if (type === "*") {
			type = "object";
		}
		if (type === "Enum") {
			type = "string";
		}
		if (type === "Array") {
			type = "[?]";
		}
		if (type === "") {
			type = "object";
		}
		return type;
	}

	function generateParams(val) {
		var params = "";
		if (val.comment && val.comment.param) {
			for (var i = 0; i < val.comment.param.length; i++) {
				var param = val.comment.param[i];
				if (param.name.length === 0 || param.name.indexOf(".") !== -1) {
					continue;
				}
				if (params.length > 0) {
					params += ', ';
				}
				var name = param.name;
				var ind = name.indexOf("\n");
				if (ind > 0) {
					name = name.substring(0, ind);
				}
				ind = name.indexOf("\t");
				if (ind > 0) {
					name = name.substring(0, ind);
				}
				params += name;
				var type = param.type;
				type = cleanLink(type);
				if (type.indexOf('function') !== -1) {
					continue;
				}
				if (type.indexOf('{') !== -1) {
					continue;
				}

				if (param.optional) {
					params += "?";					
				}
				params += ": " + type;
			}
		}
		return params;
	}

	function getRetStr(val) {
		return "-> ?";
	}

	var root = {
	};
	var top = {
		"!name": "goo",
		"!define": {
			"Context": {
			  "entity": "+goo.Entity",
			  "world": "+goo.World",
			  "entityData": "+object",
			  "worldData": "+object",
			  "domElement": "+Element",
			  "viewportWidth ": "number",
			  "viewportHeight": "number",
			  "activeCameraEntity": "+goo.Entity"
			}
		},
		"ctx": "Context",
		"goo": root
	};
	for (var c in classesArray) {
		var obj = classesArray[c];
		var constructor = obj.constructor;

		var cons = root[constructor.name] = {};
		var params = generateParams(constructor);
		cons["!type"] = "fn("+params+") -> ?";
		cons["!url"] = "http://code.gooengine.com/latest/docs/index.html?c="+constructor.name;
		cons["!doc"] = constructor.comment && constructor.comment.description ? constructor.comment.description : "";

		if (obj.members.length > 0) {
			var proto = cons["prototype"] = cons["prototype"] || {};
			for (var j = 0; j < obj.members.length; j++) {
				var member = obj.members[j];

				var met = proto[member.name] = {};
				met["!type"] = member.comment && member.comment.type && member.comment.type.type ? cleanLink(member.comment.type.type) : "?";
				met["!url"] = "http://code.gooengine.com/latest/docs/index.html?c=_met_"+constructor.name+"_"+member.name;
				met["!doc"] = member.comment && member.comment.description ? member.comment.description : "";
			}
		}
		if (obj.methods.length > 0) {
			var proto = cons["prototype"] = cons["prototype"] || {};
			for (var j = 0; j < obj.methods.length; j++) {
				var method = obj.methods[j];

				var met = proto[method.name] = {};
				var params = generateParams(method);
				met["!type"] = "fn("+params+")" + getRetStr(met);
				met["!url"] = "http://code.gooengine.com/latest/docs/index.html?c=_met_"+constructor.name+"_"+method.name;
				met["!doc"] = method.comment && method.comment.description ? method.comment.description : "";
			}
		}

		if (obj.staticMethods.length > 0) {
			for (var j = 0; j < obj.staticMethods.length; j++) {
				var method = obj.staticMethods[j];

				var met = cons[method.name] = {};
				var params = generateParams(method);
				met["!type"] = "fn("+params+")" + getRetStr(met);
				met["!url"] = "http://code.gooengine.com/latest/docs/index.html?c=_met_"+constructor.name+"_"+method.name;
				met["!doc"] = method.comment && method.comment.description ? method.comment.description : "";
			}
		}
	}
	fs.writeFileSync('D:\\Dropbox (Personligt)\\Public\\tern\\goo2.json', JSON.stringify(top, null, "\t"));	
	// fs.writeFileSync('D:\\Dropbox (Personligt)\\Public\\tern\\fulldef.json', JSON.stringify(classes, null, "\t"));	
}

function buildIndex(index) {
	var navTemplate = fs.readFileSync(
		args.templatesPath + util.PATH_SEPARATOR + 'nav.mustache', { encoding: 'utf8' });

	var result = handlebars.compile(navTemplate)({ index: index });

	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'index.html', result);
}

function buildChangelog(file) {
	var changelog = fs.readFileSync(file, { encoding: 'utf8' });
	var formatted = marked(changelog);

	var changelogTemplate = fs.readFileSync(args.templatesPath + util.PATH_SEPARATOR + 'changelog.mustache', { encoding: 'utf8' });

	var result = handlebars.compile(changelogTemplate)({ content: formatted });

	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'changelog.html', result);
}

function compileDeprecated(classes) {
	var constructors = [], methods = [], staticMethods = [], members = [], staticMembers = [];

	Object.keys(classes).forEach(function (className) {
		var class_ = classes[className];

		var getEntry = function (item) {
			return {
				class_: className,
				item: item
			};
		};

		if (!class_.constructor || !class_.constructor.comment) {
			return;
		}

		if (class_.constructor.comment.deprecated) {
			constructors.push(getEntry(class_.constructor));
		}

		class_.methods.forEach(function (method) {
			if (method.comment.deprecated) {
				methods.push(getEntry(method));
			}
		});

		class_.staticMethods.forEach(function (staticMethod) {
			if (staticMethod.comment.deprecated) {
				staticMethods.push(getEntry(staticMethod));
			}
		});

		class_.members.forEach(function (member) {
			if (member.comment.deprecated) {
				members.push(getEntry(member));
			}
		});

		class_.staticMembers.forEach(function (staticMember) {
			if (staticMember.comment.deprecated) {
				staticMembers.push(getEntry(staticMember));
			}
		});
	});

	return {
		constructors: constructors,
		hasConstructors: constructors.length > 0,
		methods: methods,
		hasMethods: methods.length > 0,
		staticMethods: staticMethods,
		hasStaticMethods: staticMethods.length > 0,
		members: members,
		hasMembers: members.length > 0,
		staticMembers: staticMembers,
		hasStaticMembers: staticMembers.length > 0
	};
}

function buildDeprecated(classes) {
	var deprecatedTemplate = fs.readFileSync(
		args.templatesPath + util.PATH_SEPARATOR + 'deprecated.mustache', { encoding: 'utf8' });

	var data = compileDeprecated(classes);

	var result = handlebars.compile(deprecatedTemplate)(data);

	fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'deprecated.html', result);
}

copyStaticFiles(function () {
	var classes = compileDoc(files);
	var index = indexBuilder.getIndex(classes, 'goo');
	resolveRequirePaths(classes, index);

	buildClasses(classes);
	buildIndex(index);


	buildChangelog('CHANGES');
	buildDeprecated(classes);

	console.log('documentation built');
});