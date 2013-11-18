define(
	/** @lends */
	function(LogicNodes) {
		"use strict";

		/**
		 * @class Base class/module for all logic boxes
		 */
		function LogicNodes() {}


		LogicNodes.types = {};

		/**
		 */
		LogicNodes.registerType = function(name, fn) {
			LogicNodes.types[name] = {
				fn: fn,
				name: name,
				editorName: fn.editorName
			};
		};

		LogicNodes.getInterfaceByName = function(name) {
			return LogicNodes.types[name].fn.logicInterface;
		};

		LogicNodes.getClass = function(name) {
			if (LogicNodes.types[name] == undefined)
				return function() {
					console.err("LogicNode type [" + name + "] does not exist.");
					return null;
				}

			return LogicNodes.types[name].fn;
		};

		LogicNodes.getAllTypes = function() {
			var out = [];
			for (var n in LogicNodes.types)
				out.push(LogicNodes.types[n]);
			return out;
		};

		return LogicNodes;
	});