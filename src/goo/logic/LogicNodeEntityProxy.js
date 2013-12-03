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
		 * @class Logic node that lets you access the logic layer of a different entity.
		 */
		function LogicNodeEntityProxy() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeEntityProxy.logicInterface;
			this.type = "LogicNodeEntityProxy";
		}

		LogicNodeEntityProxy.prototype = Object.create(LogicNode.prototype);
		LogicNodeEntityProxy.editorName = "EntityProxy";

		LogicNodeEntityProxy.prototype.onConfigure = function(config) {
			this.entityRef = config.entityRef;
		};

		LogicNodeEntityProxy.prototype.onPropertyWrite = function(portID, value) {};
		LogicNodeEntityProxy.prototype.onEvent = function(portID) {};

		// Empty.	
		LogicNodeEntityProxy.logicInterface = new LogicInterface("Component Proxy");
		LogicNodeEntityProxy.logicInterface.addConfigEntry({name: 'entityRef', type: 'entityRef', label: 'Entity'});

		LogicNodes.registerType("LogicNodeEntityProxy", LogicNodeEntityProxy);

		return LogicNodeEntityProxy;
	});
	