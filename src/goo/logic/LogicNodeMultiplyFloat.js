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
		function LogicNodeMultiplyFloat() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMultiplyFloat.logicInterface;
			this.type = "LogicNodeMultiplyFloat";
			this._x = this._y = 0;
		}

		LogicNodeMultiplyFloat.prototype = Object.create(LogicNode.prototype);
		LogicNodeMultiplyFloat.editorName = "MultiplyFloat";

		LogicNodeMultiplyFloat.prototype.onConfigure = function(newConfig) {
			if (newConfig.value !== undefined) {
				this.value = newConfig.value;
			}
		};

		LogicNodeMultiplyFloat.prototype.onInputChanged = function(instDesc, portID, value) {
			var x = LogicLayer.readPort(this.logicInstance, LogicNodeMultiplyFloat.inportX);
			var y = this.value;
			LogicLayer.writeValue(this.logicInstance, LogicNodeMultiplyFloat.outportProduct, x * y);
		};

		LogicNodeMultiplyFloat.logicInterface = new LogicInterface();
		LogicNodeMultiplyFloat.outportProduct = LogicNodeMultiplyFloat.logicInterface.addOutputProperty("product", "float");
		LogicNodeMultiplyFloat.inportX = LogicNodeMultiplyFloat.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeMultiplyFloat.logicInterface.addConfigEntry({
			name: 'value',
			type: 'float',
			label: 'Value'
		});

		LogicNodes.registerType("LogicNodeMultiplyFloat", LogicNodeMultiplyFloat);

		return LogicNodeMultiplyFloat;
	});