define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface'
	],

	function(LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node that writes output to the console.
		 * @private
		 */
		function LogicNodeDebug() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeDebug.logicInterface;
			this.type = "LogicNodeDebug";
			this._time = 0;
		}

		LogicNodeDebug.prototype = Object.create(LogicNode.prototype);
		LogicNodeDebug.editorName = "Debug";

		LogicNodeDebug.prototype.onInputChanged = function(instDesc, portID, value) {
			console.log("LogicNodeDebug (" + this.logicInstance.name + ") value port " + portID + " = [" + value + "]");
		};

		LogicNodeDebug.prototype.onEvent = function(instDesc, portID) {
			console.log("LogicNodeDebug (" + this.logicInstance.name + ") event on port " + portID);
		};

		LogicNodeDebug.logicInterface = new LogicInterface();
		LogicNodeDebug.inportEvent = LogicNodeDebug.logicInterface.addInputEvent("Event");
		LogicNodeDebug.inportFloat = LogicNodeDebug.logicInterface.addInputProperty("FloatValue", "float", 0);

		LogicNodes.registerType("LogicNodeDebug", LogicNodeDebug);

		return LogicNodeDebug;
	});