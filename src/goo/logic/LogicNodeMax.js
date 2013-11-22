define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
		"use strict";

		/**
		 * @class Logic node that calculates sine
		 */
		function LogicNodeMax() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMax.logicInterface;
			this.type = "LogicNodeMax";
		}

		LogicNodeMax.prototype = Object.create(LogicNode.prototype);
		LogicNodeMax.editorName = "Max";

		LogicNodeMax.prototype.onInputChanged = function(instDesc, portID, value) {
			var val1 = LogicLayer.readPort(instDesc, LogicNodeMax.inportX);
			var val2 = LogicLayer.readPort(instDesc, LogicNodeMax.inportY);
			var out = Math.max(val1, val2);
			
			LogicLayer.writeValue(this.logicInstance, LogicNodeMax.outportSum, out);
		};

		LogicNodeMax.logicInterface = new LogicInterface();
		LogicNodeMax.outportSum = LogicNodeMax.logicInterface.addOutputProperty("max", "float");
		LogicNodeMax.inportX = LogicNodeMax.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeMax.inportY = LogicNodeMax.logicInterface.addInputProperty("y", "float", 0);

		LogicNodes.registerType("LogicNodeMax", LogicNodeMax);

		return LogicNodeMax;
	});