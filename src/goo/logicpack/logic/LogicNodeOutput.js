var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicNodes = require('../../logic/LogicNodes');
var LogicInterface = require('../../logic/LogicInterface')

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node to be used as layer output.
		 * @private
		 */
		function LogicNodeOutput() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeOutput.logicInterface;
			this.type = 'LogicNodeOutput';
			this.realOutport = null;
		}

		LogicNodeOutput.prototype = Object.create(LogicNode.prototype);
		LogicNodeOutput.editorName = 'Output';

		LogicNodeOutput.prototype.onInputChanged = function (instDesc, portID, value) {
			LogicLayer.writeValueToLayerOutput(instDesc, this.realOutport, value);
		};

		LogicNodeOutput.prototype.onEvent = function () { };

		// Configure new output.
		LogicNode.prototype.onConfigure = function (newConfig) {
			this.realOutport = LogicInterface.createDynamicOutput(newConfig.Name);
		};

		LogicNodes.registerType('LogicNodeOutput', LogicNodeOutput);

		LogicNodeOutput.logicInterface = new LogicInterface();
		LogicNodeOutput.inportOutput = LogicNodeOutput.logicInterface.addInputProperty('Output', 'any');
		LogicNodeOutput.logicInterface.addConfigEntry({ name: 'Name', type: 'string', label: 'Name'});
		return LogicNodeOutput;
	}
);
