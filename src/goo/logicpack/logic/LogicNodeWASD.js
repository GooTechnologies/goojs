define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface'
	],
	/** @lends */
	function(LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * @class Logic node handling WASD input.
		 * @private
		 */
		function LogicNodeWASD() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeWASD.logicInterface;
			this.type = "LogicNodeWASD";

			var preventRepeat = {};
			this.eventListenerDown = function(event) {
				var character = String.fromCharCode(event.which).toLowerCase();
				if (preventRepeat[character]) {
					return;
				}
				var keyEvent = LogicNodeWASD.downKeys[character];
				if (keyEvent) {
					preventRepeat[character] = true;
					LogicLayer.fireEvent(this.logicInstance, keyEvent);
				}
			}.bind(this);
			this.eventListenerUp = function(event) {
				var character = String.fromCharCode(event.which).toLowerCase();
				if (preventRepeat[character]) {
					preventRepeat[character] = false;
				}
				var keyEvent = LogicNodeWASD.upKeys[character];
				if (keyEvent) {
					LogicLayer.fireEvent(this.logicInstance, keyEvent);
				}
			}.bind(this);
		}

		LogicNodeWASD.prototype = Object.create(LogicNode.prototype);
		LogicNodeWASD.editorName = "WASD";

		LogicNodeWASD.prototype.onSystemStarted = function() {
			document.addEventListener('keydown', this.eventListenerDown);
			document.addEventListener('keyup', this.eventListenerUp);
		};

		LogicNodeWASD.prototype.onSystemStopped = function() {
			document.removeEventListener('keydown', this.eventListenerDown);
			document.removeEventListener('keyup', this.eventListenerUp);
		};

		LogicNodeWASD.logicInterface = new LogicInterface();
		LogicNodeWASD.downKeys = {
			'w': LogicNodeWASD.logicInterface.addOutputEvent("W-down"),
			'a': LogicNodeWASD.logicInterface.addOutputEvent("A-down"),
			's': LogicNodeWASD.logicInterface.addOutputEvent("S-down"),
			'd': LogicNodeWASD.logicInterface.addOutputEvent("D-down")
		};
		LogicNodeWASD.upKeys = {
			'w': LogicNodeWASD.logicInterface.addOutputEvent("W-up"),
			'a': LogicNodeWASD.logicInterface.addOutputEvent("A-up"),
			's': LogicNodeWASD.logicInterface.addOutputEvent("S-up"),
			'd': LogicNodeWASD.logicInterface.addOutputEvent("D-up")
		};

		LogicNodes.registerType("LogicNodeWASD", LogicNodeWASD);

		return LogicNodeWASD;
	});