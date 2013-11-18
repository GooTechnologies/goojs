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
		function LogicNodeAdd() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeAdd.logicInterface;
			this.type = "LogicNodeAdd";
			this._x = this._y = 0;
		}

		LogicNodeAdd.prototype = Object.create(LogicNode.prototype);
		LogicNodeAdd.editorName = "Add";

		LogicNodeAdd.prototype.onPropertyWrite = function(portID, value) {
			if (portID == LogicNodeAdd.inportX)
				this._x = value;
			else if (portID == LogicNodeAdd.inportY)
				this._y = value;

			LogicLayer.writeValue(this.logicInstance, LogicNodeAdd.outportProduct, this._x + this._y);
		}

		LogicNodeAdd.logicInterface = new LogicInterface();
		LogicNodeAdd.outportProduct = LogicNodeAdd.logicInterface.addOutputProperty("product", "float");
		LogicNodeAdd.inportX = LogicNodeAdd.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeAdd.inportY = LogicNodeAdd.logicInterface.addInputProperty("y", "float", 0);

		LogicNodes.registerType("LogicNodeAdd", LogicNodeAdd);

		return LogicNodeAdd;
	});