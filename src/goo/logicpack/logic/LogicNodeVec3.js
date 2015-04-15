define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicNodes',
		'goo/logic/LogicInterface',
		'goo/math/Vector3'
	],

	function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
		'use strict';

		/**
		 * Logic node that provides a Vec3.
		 * @private
		 */
		function LogicNodeVec3() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeVec3.logicInterface;
			this.type = "LogicNodeVec3";
			this._x = this._y = this._z = 0; // REVIEW: unused?
		}

		LogicNodeVec3.prototype = Object.create(LogicNode.prototype);
		LogicNodeVec3.editorName = "Vec3";

		LogicNodeVec3.prototype.onInputChanged = function (instDesc) {
			var x = LogicLayer.readPort(instDesc, LogicNodeVec3.inportX);
			var y = LogicLayer.readPort(instDesc, LogicNodeVec3.inportY);
			var z = LogicLayer.readPort(instDesc, LogicNodeVec3.inportZ);
			var xyz = LogicLayer.readPort(instDesc, LogicNodeVec3.inportVec3);
			if (xyz !== null) {
				x = xyz.x;
				y = xyz.y;
				z = xyz.z;
			}

			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportVec3, new Vector3(x, y, z));
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportX, x);
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportY, y);
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportZ, z);
		};

		LogicNodeVec3.logicInterface = new LogicInterface();

		LogicNodeVec3.outportVec3 = LogicNodeVec3.logicInterface.addOutputProperty("xyz", "Vector3");
		LogicNodeVec3.inportVec3 = LogicNodeVec3.logicInterface.addInputProperty("xyz", "Vector3", null);
		LogicNodeVec3.inportX = LogicNodeVec3.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeVec3.inportY = LogicNodeVec3.logicInterface.addInputProperty("y", "float", 0);
		LogicNodeVec3.inportZ = LogicNodeVec3.logicInterface.addInputProperty("z", "float", 0);
		LogicNodeVec3.outportX = LogicNodeVec3.logicInterface.addOutputProperty("x", "float", 0);
		LogicNodeVec3.outportY = LogicNodeVec3.logicInterface.addOutputProperty("y", "float", 0);
		LogicNodeVec3.outportZ = LogicNodeVec3.logicInterface.addOutputProperty("z", "float", 0);

		LogicNodes.registerType("LogicNodeVec3", LogicNodeVec3);

		return LogicNodeVec3;
	});