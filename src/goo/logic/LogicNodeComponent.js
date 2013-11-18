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
		function LogicNodeComponent() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeComponent.logicInterface;
			this.type = "LogicNodeComponent";
			this._time = 0;
		}

		LogicNodeComponent.prototype = Object.create(LogicNode.prototype);
		LogicNodeComponent.editorName = "Entity";

		LogicNodeComponent.prototype.onConfigure = function(config) {
			this.entityRef = config.entityRef;
		};

		LogicNodeComponent.prototype.onPropertyWrite = function(portID, value) {};

		LogicNodeComponent.prototype.onEvent = function(portID) {};

		// Empty.	
		LogicNodeComponent.logicInterface = new LogicInterface("Component Proxy");

		LogicNodes.registerType("LogicNodeComponent", LogicNodeComponent);

		return LogicNodeComponent;
	});