define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicInterface',
		'goo/logic/LogicNodes'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicInterface, LogicNodes) {
		'use strict';

		/**
		 * @class Logic node implementing a random value. Every frame a new random value is written
		 * to its output.
		 * @private
		 */
		function LogicNodeRandom() {
			LogicNode.call(this);
			this.wantsProcessCall = true;
			this.logicInterface = LogicNodeRandom.logicInterface;
			this.type = "LogicNodeRandom";
		}

		// Logic interface set-up	
		LogicNodeRandom.prototype = Object.create(LogicNode.prototype);
		LogicNodeRandom.editorName = "Random";
		LogicNodeRandom.logicInterface = new LogicInterface();

		// ports
		LogicNodeRandom.outPropRandom = LogicNodeRandom.logicInterface.addOutputProperty("Random0_1", "float");

		// Process
		LogicNodeRandom.prototype.processLogic = function() {
			LogicLayer.writeValue(this.logicInstance, LogicNodeRandom.outPropRandom, Math.random());
		};

		LogicNodes.registerType("LogicNodeRandom", LogicNodeRandom);

		return LogicNodeRandom;
	});