define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/logic/LogicNodeTime',
	'goo/logic/LogicNodeSine',
	'goo/util/rsvp',
	'goo/util/PromiseUtil',
	'goo/util/ObjectUtil'
], function(
	ConfigHandler,
	LogicNodeTime,
	LogicNodeSine,
	RSVP,
	PromiseUtil,
	_
) {
	"use strict";

	function LogicHandler() {
		ConfigHandler.apply(this, arguments);
		this._objects = {};
	}

	LogicHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('logicnode', LogicHandler);
	LogicHandler.prototype.constructor = LogicHandler;

	LogicHandler.prototype._prepare = function(config) {
		// there are no defaults for this.
		console.log("Prepare bananan");
		_.defaults(config, { });
	};

	LogicHandler.prototype._create = function(ref) {
		return null;
	};

	LogicHandler.prototype.update = function(ref, config) {
		console.log("Creating " + ref + " with config " + config);
	};

	LogicHandler.prototype.remove = function(ref) {
		// this._objects[ref].stop();
		delete this._objects[ref];
	};

	function isEqual(a, b) {
		var len = a.length;
		if (len !== b.length) {
			return false;
		}
		while (len--) {
			if(a[len] !== b[len]) {
				return false;
			}
		}
		return true;
	}

	return LogicHandler;
});