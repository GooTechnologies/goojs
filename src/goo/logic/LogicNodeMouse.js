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
		function LogicNodeMouse() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeMouse.logicInterface;
			this.type = "LogicNodeMouse";

			this.eventMouseMove = function(event) {
				var mx = event.clientX;
				var my = event.clientY;
				var dx = mx - this.x;
				var dy = my - this.y;
				LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portX, mx);
				LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portY, my);
				LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDX, dx);
				LogicLayer.writeValue(this.logicInstance, LogicNodeMouse.portDY, dy);
			}.bind(this);
		}

		LogicNodeMouse.prototype = Object.create(LogicNode.prototype);
		LogicNodeMouse.editorName = "Mouse";

		LogicNodeMouse.prototype.onSystemStarted = function() {
			this.x = 0;
			this.y = 0;
			document.addEventListener('mousemove', this.eventMouseMove, false);
		};

		LogicNodeMouse.prototype.onSystemStopped = function(stopForPause) {
			document.removeEventListener('mousemove', this.eventMouseMove);
		};

		LogicNodeMouse.logicInterface = new LogicInterface();
		LogicNodeMouse.portX = LogicNodeMouse.logicInterface.addOutputProperty("x", "float", 0);
		LogicNodeMouse.portY = LogicNodeMouse.logicInterface.addOutputProperty("y", "float", 0);
		LogicNodeMouse.portDX = LogicNodeMouse.logicInterface.addOutputProperty("dx", "float", 0);
		LogicNodeMouse.portDY = LogicNodeMouse.logicInterface.addOutputProperty("dy", "float", 0);

		LogicNodes.registerType("LogicNodeMouse", LogicNodeMouse);

		return LogicNodeMouse;
	});