var LogicLayer = require('../../logic/LogicLayer');
var LogicNode = require('../../logic/LogicNode');
var LogicInterface = require('../../logic/LogicInterface');
var LogicNodes = require('../../logic/LogicNodes')

	function (LogicLayer, LogicNode, LogicInterface, LogicNodes) {
		'use strict';

		/**
		 * Logic node implementing a random value. Every frame a new random value is written
		 * to its output.
		 * @private
		 */
		function LogicNodeRandom() {
			LogicNode.call(this);
			this.wantsProcessCall = true;
			this.logicInterface = LogicNodeRandom.logicInterface;
			this.type = 'LogicNodeRandom';
		}

		// Logic interface set-up
		LogicNodeRandom.prototype = Object.create(LogicNode.prototype);
		LogicNodeRandom.editorName = 'Random';
		LogicNodeRandom.logicInterface = new LogicInterface();

		// ports
		LogicNodeRandom.outPropRandom = LogicNodeRandom.logicInterface.addOutputProperty('Random0_1', 'float');

		// Process
		LogicNodeRandom.prototype.processLogic = function () {
			LogicLayer.writeValue(this.logicInstance, LogicNodeRandom.outPropRandom, Math.random());
		};

		LogicNodes.registerType('LogicNodeRandom', LogicNodeRandom);

		return LogicNodeRandom;
	});