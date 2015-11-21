define(
	[var LogicLayer = require('goo/logic/LogicLayer');
var LogicNode = require('goo/logic/LogicNode');
var LogicNodes = require('goo/logic/LogicNodes');
var LogicInterface = require('goo/logic/LogicInterface');
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node to add values.
		 * @private
		 */
		function LogicNodeAdd() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeAdd.logicInterface;
			this.type = 'LogicNodeAdd';
		}

		LogicNodeAdd.prototype = Object.create(LogicNode.prototype);
		LogicNodeAdd.editorName = 'Add';

		LogicNodeAdd.prototype.onInputChanged = function (instDesc) {
			var out = LogicLayer.readPort(instDesc, LogicNodeAdd.inportX) +
				LogicLayer.readPort(instDesc, LogicNodeAdd.inportY);

			LogicLayer.writeValue(this.logicInstance, LogicNodeAdd.outportSum, out);
		};

		LogicNodeAdd.logicInterface = new LogicInterface();
		LogicNodeAdd.outportSum = LogicNodeAdd.logicInterface.addOutputProperty('sum', 'float');
		LogicNodeAdd.inportX = LogicNodeAdd.logicInterface.addInputProperty('x', 'float', 0);
		LogicNodeAdd.inportY = LogicNodeAdd.logicInterface.addInputProperty('y', 'float', 0);

		LogicNodes.registerType('LogicNodeAdd', LogicNodeAdd);

		return LogicNodeAdd;
	});