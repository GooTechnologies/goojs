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
		function LogicNodeMultiply() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMultiply.logicInterface;
			this.type = "LogicNodeMultiply";
			this._x = this._y = 0;
		}

		LogicNodeMultiply.prototype = Object.create(LogicNode.prototype);
		LogicNodeMultiply.editorName = "Multiply";

		LogicNodeMultiply.prototype.onPropertyWrite = function(portID, value) {
			if (portID == LogicNodeMultiply.inportX)
				this._x = value;
			else if (portID == LogicNodeMultiply.inportY)
				this._y = value;

			LogicLayer.writeValue(this.logicInstance, LogicNodeMultiply.outportProduct, this._x * this._y);
		}

		LogicNodeMultiply.logicInterface = new LogicInterface();
		LogicNodeMultiply.outportProduct = LogicNodeMultiply.logicInterface.addOutputProperty("product", "float");
		LogicNodeMultiply.inportX = LogicNodeMultiply.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeMultiply.inportY = LogicNodeMultiply.logicInterface.addInputProperty("y", "float", 0);

		LogicNodes.registerType("LogicNodeMultiply", LogicNodeMultiply);
		
		

		return LogicNodeMultiply;
	});