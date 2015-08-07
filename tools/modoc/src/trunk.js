// jshint node:true
'use strict';

var fs = require('fs');
var glob = require('glob');
var _ = require('underscore');

var extractor = require('./extractor');
var jsdocProcessor = require('./jsdoc-processor');
var util = require('./util');


function getFiles(sourcePath, ignore) {
	if (/\.js$/.test(sourcePath)) {
		return [sourcePath];
	}

	return glob.sync(sourcePath + '/**/*.js').filter(function (file) {
		return ignore.every(function (term) {
			return file.indexOf(term) === -1;
		});
	});
}

function filterPrivates(class_) {
	var isPrivateOrHidden = function (entry) {
		return !entry.comment || !(entry.comment.private || entry.comment.hidden);
	};

	class_.members = class_.members.filter(isPrivateOrHidden);
	class_.staticMembers = class_.staticMembers.filter(isPrivateOrHidden);
	class_.methods = class_.methods.filter(isPrivateOrHidden);
	class_.staticMethods = class_.staticMethods.filter(isPrivateOrHidden);

	class_.hasMembers = class_.members.length > 0 || (class_.constructor.comment && class_.constructor.comment.property);
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

exports.getFiles = getFiles;
exports.filterPrivates = filterPrivates;
exports.compileDoc = compileDoc;