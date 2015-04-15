define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface'
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
		'use strict';

		/**
		 * Logic node handling WASD input.
		 * @private
		 */
		function LogicNodeWASD2() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeWASD2.logicInterface;
			this.type = "LogicNodeWASD2";

			var preventRepeat = {};
			this.eventListenerDown = function (event) {
				var character = String.fromCharCode(event.which).toLowerCase();
				if (preventRepeat[character]) {
					return;
				}
				var keyEvent = LogicNodeWASD2.downKeys[character];
				if (keyEvent) {
					preventRepeat[character] = true;
					LogicLayer.writeValue(this.logicInstance, keyEvent.port, keyEvent.value);
				}
			}.bind(this);
			this.eventListenerUp = function (event) {
				var character = String.fromCharCode(event.which).toLowerCase();
				if (preventRepeat[character]) {
					preventRepeat[character] = false;
				}
				var keyEvent = LogicNodeWASD2.downKeys[character];
				if (keyEvent) {
					LogicLayer.writeValue(this.logicInstance, keyEvent.port, 0);
				}
			}.bind(this);
		}

		LogicNodeWASD2.prototype = Object.create(LogicNode.prototype);
		LogicNodeWASD2.editorName = "WASD2";

		LogicNodeWASD2.prototype.onSystemStarted = function () {
			document.addEventListener('keydown', this.eventListenerDown);
			document.addEventListener('keyup', this.eventListenerUp);
		};

		LogicNodeWASD2.prototype.onSystemStopped = function () {
			document.removeEventListener('keydown', this.eventListenerDown);
			document.removeEventListener('keyup', this.eventListenerUp);
		};

		LogicNodeWASD2.logicInterface = new LogicInterface();
		LogicNodeWASD2.downKeys = {
			'w': {
				port: LogicNodeWASD2.logicInterface.addOutputProperty("W", "float", 0),
				value: 1
			},
			'a': {
				port: LogicNodeWASD2.logicInterface.addOutputProperty("A", "float", 0),
				value: 1
			},
			's': {
				port: LogicNodeWASD2.logicInterface.addOutputProperty("S", "float", 0),
				value: -1
			},
			'd': {
				port: LogicNodeWASD2.logicInterface.addOutputProperty("D", "float", 0),
				value: -1
			}
		};

		LogicNodes.registerType("LogicNodeWASD2", LogicNodeWASD2);

		return LogicNodeWASD2;
	});