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
		function LogicNodeInt() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeInt.logicInterface;
			this.type = "LogicNodeInt";
			this.defValue = 0;
			this.value = 0;
		}

		LogicNodeInt.prototype = Object.create(LogicNode.prototype);
		LogicNodeInt.editorName = "Int";

		LogicNodeInt.prototype.onConfigure = function(newConfig)
		{
			if (newConfig.config !== undefined && newConfig.config.value !== undefined)
				this.defValue = newConfig.config.value;

			this.value = this.defValue;				
			LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
		}
		
		LogicNodeInt.prototype.onEvent = function(evt, args)
		{
			if (evt == LogicNodeInt.ineventIncrease)
				this.value = this.value + 1;
			else if (evt == LogicNodeInt.ineventDecrease)
				this.value = this.value - 1;
			else
				this.value = this.defValue;
				
			LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
		}

		LogicNodeInt.prototype.onSystemStarted = function() {
			LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
		}
		
		LogicNodeInt.prototype.onSystemStopped = function(stopForPause) {
		}

		LogicNodes.registerType("LogicNodeInt", LogicNodeInt);

		LogicNodeInt.logicInterface = new LogicInterface();
		LogicNodeInt.ineventReset = LogicNodeInt.logicInterface.addInputEvent("reset");
		LogicNodeInt.ineventIncrease = LogicNodeInt.logicInterface.addInputEvent("increase");
		LogicNodeInt.ineventDecrease = LogicNodeInt.logicInterface.addInputEvent("decrease");
		LogicNodeInt.outportInt = LogicNodeInt.logicInterface.addOutputProperty("value", "int");
		LogicNodeInt.logicInterface.addConfigEntry({name: 'value', type: 'int', label: 'Value'});
		
		return LogicNodeInt;
	}
);