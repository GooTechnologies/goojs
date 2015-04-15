define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface'
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node that multiplies two floats.
		 * @private
		 */
		function LogicNodeMultiplyFloat() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMultiplyFloat.logicInterface;
			this.type = "LogicNodeMultiplyFloat";
			this._x = this._y = 0; // REVIEW: unused?
		}

		LogicNodeMultiplyFloat.prototype = Object.create(LogicNode.prototype);
		LogicNodeMultiplyFloat.editorName = "MultiplyFloat";

		LogicNodeMultiplyFloat.prototype.onConfigure = function (newConfig) {
			if (newConfig.value !== undefined) {
				this.value = newConfig.value;
			}
		};

		LogicNodeMultiplyFloat.prototype.onInputChanged = function (instDesc) {
			var x = LogicLayer.readPort(instDesc, LogicNodeMultiplyFloat.inportX);
			var y = this.value;
			LogicLayer.writeValue(instDesc, LogicNodeMultiplyFloat.outportProduct, x * y);
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