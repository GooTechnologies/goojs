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
		function LogicNodeFloat() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeFloat.logicInterface;
			this.type = "LogicNodeFloat";
		}

		LogicNodeFloat.prototype = Object.create(LogicNode.prototype);
		LogicNodeFloat.editorName = "Float";

		LogicNodeFloat.prototype.onConfigure = function(newConfig)
		{
			if (newConfig.config !== undefined)
			{
				this.value = newConfig.config.value;
				LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
			}
		}		

		LogicNodeFloat.prototype.onSystemStarted = function() {
			LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
		}
		
		LogicNodeFloat.prototype.onSystemStopped = function(stopForPause) {
		}

		LogicNodes.registerType("LogicNodeFloat", LogicNodeFloat);

		LogicNodeFloat.logicInterface = new LogicInterface();
		LogicNodeFloat.outportFloat = LogicNodeFloat.logicInterface.addOutputProperty("value", "float");
		LogicNodeFloat.logicInterface.addConfigEntry({name: 'value', type: 'float', label: 'Value'});
		
		
		return LogicNodeFloat;
	}
);