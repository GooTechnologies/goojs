var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicNodes = require('../../logic/LogicNodes');
var LogicInterface = require('../../logic/LogicInterface')

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node that calculates sin & cos.
		 * @private
		 */
		function LogicNodeSine() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeSine.logicInterface;
			this.type = 'LogicNodeSine';
			this._time = 0;
		}

		LogicNodeSine.prototype = Object.create(LogicNode.prototype);
		LogicNodeSine.editorName = 'Sine';

		LogicNodeSine.prototype.onInputChanged = function (instDesc, portID, value) {
			LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportSin, Math.sin(value));
			LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportCos, Math.cos(value));
		};

		LogicNodeSine.logicInterface = new LogicInterface();
		LogicNodeSine.outportSin = LogicNodeSine.logicInterface.addOutputProperty('Sine', 'float');
		LogicNodeSine.outportCos = LogicNodeSine.logicInterface.addOutputProperty('Cosine', 'float');
		LogicNodeSine.inportPhase = LogicNodeSine.logicInterface.addInputProperty('Phase', 'float', 0);

		LogicNodes.registerType('LogicNodeSine', LogicNodeSine);

		return LogicNodeSine;
	});