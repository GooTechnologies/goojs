define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * @class Logic node that provides an integer.
		 * @private
		 */
		function LogicNodeInt() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeInt.logicInterface;
			this.type = "LogicNodeInt";
			this.defValue = 0;
			this.value = 0;
		}

		LogicNodeInt.prototype = Object.create(LogicNode.prototype);
		LogicNodeInt.editorName = "Int";

		LogicNodeInt.prototype.onConfigure = function(newConfig) {
			if (newConfig.value !== undefined) {
				this.defValue = newConfig.value;
			}

			this.value = this.defValue;
		};

		LogicNodeInt.prototype.onConnected = function(instDesc) {
			LogicLayer.writeValue(instDesc, LogicNodeInt.outportInt, this.value);
		};

		LogicNodeInt.prototype.onEvent = function(instDesc, evt) {

			if (evt === LogicNodeInt.ineventIncrease) {
				this.value = this.value + 1;
			} else if (evt === LogicNodeInt.ineventDecrease) {
				this.value = this.value - 1;
			} else {
				this.value = this.defValue;
			}

			LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
		};

		LogicNodeInt.prototype.onSystemStarted = function() {
			LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
		};

		LogicNodeInt.prototype.onSystemStopped = function() {};

		LogicNodes.registerType("LogicNodeInt", LogicNodeInt);

		LogicNodeInt.logicInterface = new LogicInterface();
		LogicNodeInt.ineventReset = LogicNodeInt.logicInterface.addInputEvent("reset");
		LogicNodeInt.ineventIncrease = LogicNodeInt.logicInterface.addInputEvent("increase");
		LogicNodeInt.ineventDecrease = LogicNodeInt.logicInterface.addInputEvent("decrease");
		LogicNodeInt.outportInt = LogicNodeInt.logicInterface.addOutputProperty("value", "int");
		LogicNodeInt.logicInterface.addConfigEntry({
			name: 'value',
			type: 'int',
			label: 'Value'
		});

		return LogicNodeInt;
	}
);