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
		function LogicNodeOutput() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeOutput.logicInterface;
			this.type = "LogicNodeOutput";
		}

		LogicNodeOutput.prototype = Object.create(LogicNode.prototype);
		LogicNodeOutput.editorName = "Output";

		LogicNodes.registerType("LogicNodeOutput", LogicNodeOutput);

		LogicNodeOutput.logicInterface = new LogicInterface();
		LogicNodeOutput.inportOutput = LogicNodeOutput.logicInterface.addInputProperty("Output", "any");
		LogicNodeOutput.logicInterface.addConfigEntry({name: 'Name', type: 'string', label: 'Name'});
		return LogicNodeOutput;
	}
);
