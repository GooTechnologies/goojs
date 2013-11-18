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
		function LogicNodeWASD() {
			LogicNode.call(this);
			this.wantsProcessCall = true;
			this.logicInterface = LogicNodeWASD.logicInterface;
			this.type = "LogicNodeWASD";
			this._running = true;

			this.WIsDown = false;
			this.AIsDown = false;
			this.eventListenerDown = function(event) {
				if (event.which === 87) {
					this.WIsDown = true;
				}
				if (event.which === 65) {
					this.AIsDown = true;
				}
			}.bind(this);
			this.eventListenerUp = function(event) {
				if (event.which === 87) {
					this.WIsDown = false;
				}
				if (event.which === 65) {
					this.AIsDown = false;
				}
			}.bind(this);
		}

		LogicNodeWASD.prototype = Object.create(LogicNode.prototype);
		LogicNodeWASD.editorName = "WASD";

		LogicNodeWASD.prototype.onConfigure = function(config) {
			this._running = true;
		};
		
		LogicNodeWASD.prototype.onSystemStarted = function()
		{
			console.log("WASD: Adding event listeners");
			document.addEventListener('keydown', this.eventListenerDown);
			document.addEventListener('keyup', this.eventListenerUp);
		}
		
		LogicNodeWASD.prototype.onSystemStopped = function(stopForPause)
		{
			console.log("WASD: Removing event listeners");
			document.removeEventListener('keydown', this.eventListenerDown);
			document.removeEventListener('keyup', this.eventListenerUp);
		}

		// Process
		LogicNodeWASD.prototype.processLogic = function(tpf) {
			if (this._running) {
				if (this.WIsDown) {
					LogicLayer.writeValue(this.logicInstance, LogicNodeWASD.outportW, 1);
				} else {
					LogicLayer.writeValue(this.logicInstance, LogicNodeWASD.outportW, 0);
				}
				if (this.AIsDown) {
					LogicLayer.writeValue(this.logicInstance, LogicNodeWASD.outportA, -1);
				} else {
					LogicLayer.writeValue(this.logicInstance, LogicNodeWASD.outportA, 0);
				}
			}
		};

		LogicNodeWASD.logicInterface = new LogicInterface();
		LogicNodeWASD.outportW = LogicNodeWASD.logicInterface.addOutputProperty("W", "float");
		LogicNodeWASD.outportS = LogicNodeWASD.logicInterface.addOutputProperty("S", "float");
		LogicNodeWASD.outportA = LogicNodeWASD.logicInterface.addOutputProperty("A", "float");
		LogicNodeWASD.outportD = LogicNodeWASD.logicInterface.addOutputProperty("D", "float");

		LogicNodes.registerType("LogicNodeWASD", LogicNodeWASD);

		return LogicNodeWASD;
	});