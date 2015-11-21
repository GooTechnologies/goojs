var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicNodes = require('../../logic/LogicNodes');
var LogicInterface = require('../../logic/LogicInterface')

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node that multiplies two inputs.
		 * @private
		 */
		function LogicNodeMultiply() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMultiply.logicInterface;
			this.type = 'LogicNodeMultiply';
			this._x = this._y = 0; // REVIEW: unused ?
		}

		LogicNodeMultiply.prototype = Object.create(LogicNode.prototype);
		LogicNodeMultiply.editorName = 'Multiply';

		LogicNodeMultiply.prototype.onInputChanged = function (instDesc) {
			var x = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportX);
			var y = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportY);
			LogicLayer.writeValue(instDesc, LogicNodeMultiply.outportProduct, x * y);
		};

		LogicNodeMultiply.logicInterface = new LogicInterface();
		LogicNodeMultiply.outportProduct = LogicNodeMultiply.logicInterface.addOutputProperty('product', 'float');
		LogicNodeMultiply.inportX = LogicNodeMultiply.logicInterface.addInputProperty('x', 'float', 0);
		LogicNodeMultiply.inportY = LogicNodeMultiply.logicInterface.addInputProperty('y', 'float', 0);

		LogicNodes.registerType('LogicNodeMultiply', LogicNodeMultiply);

		return LogicNodeMultiply;
	});