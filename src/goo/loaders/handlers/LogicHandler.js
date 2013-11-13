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
		_.defaults(config, { });
	};

	LogicHandler.prototype._create = function(ref) {
		// it is not known what logic node type it's going to be yet, so can't create it.	
		console.log("LogicHandler:create");
		return { is_dummy_of_unknown_type: true };
	};

	LogicHandler.prototype.update = function(ref, config) {
		
		console.log("LogicHandler:update");
		var obj;
		switch (config.type)
		{
			case "LogicNodeTime": obj = new LogicNodeTime(config); break;
			case "LogicNodeSine": obj = new LogicNodeSine(config); break;
			default:
				console.warn("unknown logic node type " + config.type);
				return;
		}
		
		// Special way of just reconfiguring the objects without needing to re-create them.
		var that = this;
		return PromiseUtil.createDummyPromise().then(function() {
			console.log("upp dating");
			that._objects[ref] = obj;
		}, function() {
		
		});
	};

	LogicHandler.prototype.remove = function(ref) {
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