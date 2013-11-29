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
		function LogicNodeInput() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeInput.logicInterface;
			this.type = "LogicNodeInput";
		}

		LogicNodeInput.prototype = Object.create(LogicNode.prototype);
		LogicNodeInput.editorName = "Input";

		LogicNodes.registerType("LogicNodeInput", LogicNodeInput);

		LogicNodeInput.logicInterface = new LogicInterface();
		LogicNodeInput.outportInput = LogicNodeInput.logicInterface.addOutputProperty("Input", "any");
		LogicNodeInput.logicInterface.addConfigEntry({name: 'Name', type: 'string', label: 'Name'});
		return LogicNodeInput;
	}
);