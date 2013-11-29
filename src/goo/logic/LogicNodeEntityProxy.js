define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/entities/components/LightComponent',
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, LightComponent) {
		"use strict";

		/**
		 * @class Logic node that calculates sine
		 */
		function LogicEntityProxy() {
			LogicNode.call(this);
			this.logicInterface = LogicEntityProxy.logicInterface;
			this.type = "LogicNodeEntityProxy";
			this._time = 0;
		}

		LogicEntityProxy.prototype = Object.create(LogicNode.prototype);
		LogicEntityProxy.editorName = "EntityProxy";

		LogicEntityProxy.prototype.onConfigure = function(config) {
			this.entityRef = config.entityRef;
		};

		LogicEntityProxy.prototype.onPropertyWrite = function(portID, value) {};
		LogicEntityProxy.prototype.onEvent = function(portID) {};

		// Empty.	
		LogicEntityProxy.logicInterface = new LogicInterface("Component Proxy");

		LogicNodes.registerType("LogicNodeEntityProxy", LogicEntityProxy);

		return LogicEntityProxy;
	});
	