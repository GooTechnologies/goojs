define(
	[var LogicLayer = require('goo/logic/LogicLayer');
var LogicNode = require('goo/logic/LogicNode');
var LogicNodes = require('goo/logic/LogicNodes');
var LogicInterface = require('goo/logic/LogicInterface');
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node to be used as Layer input.
		 * @private
		 */
		function LogicNodeInput() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeInput.logicInterface;
			this.type = 'LogicNodeInput';
			this.dummyInport = null;
		}

		LogicNodeInput.prototype = Object.create(LogicNode.prototype);
		LogicNodeInput.editorName = 'Input';

		// Configure new input.
		LogicNodeInput.prototype.onConfigure = function (newConfig) {
			this.dummyInport = LogicInterface.createDynamicInput(newConfig.Name);
		};

		LogicNodeInput.prototype.onInputChanged = function (instDesc, portID, value) {
			// this will be the dummy inport getting values written.
			LogicLayer.writeValue(this.logicInstance, LogicNodeInput.outportInput, value);
		};

		LogicNodes.registerType('LogicNodeInput', LogicNodeInput);

		LogicNodeInput.logicInterface = new LogicInterface();

		// TODO: This should be a both, not property/event.
		LogicNodeInput.outportInput = LogicNodeInput.logicInterface.addOutputProperty('Input', 'any');

		LogicNodeInput.logicInterface.addConfigEntry({
			name: 'Name',
			type: 'string',
			label: 'Name'
		});
		return LogicNodeInput;
	}
);