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
		function LogicNodeVec3() {
			LogicNode.call(this);
			this.logicInterface = LogicNodeVec3.logicInterface;
			this.type = "LogicNodeVec3";
			this._x = this._y = this._z = 0;
		}

		LogicNodeVec3.prototype = Object.create(LogicNode.prototype);
		LogicNodeVec3.editorName = "Vec3";

		LogicNodeVec3.prototype.onPropertyWrite = function(portID, value) {
			if (portID == LogicNodeVec3.inportX)
				this._x = value;
			else if (portID == LogicNodeVec3.inportY)
				this._y = value;
			else if (portID == LogicNodeVec3.inportZ)
				this._z = value;
			else if (portID == LogicnodeVec3.inportVec3)
			{
				this._x = value.x;
				this._y = value.y;
				this._z = value.z;
			}

			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportVec3, new Vector3(this._x, this._y, this._z));
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportX, this._x);
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportY, this._y);
			LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportZ, this._z);
		}

		LogicNodeVec3.logicInterface = new LogicInterface();
		
		LogicNodeVec3.outportVec3 = LogicNodeVec3.logicInterface.addOutputProperty("xyz", "Vector3");
		LogicNodeVec3.inportVec3 = LogicNodeVec3.logicInterface.addInputProperty("xyz", "Vector3");
		LogicNodeVec3.inportX = LogicNodeVec3.logicInterface.addInputProperty("x", "float", 0);
		LogicNodeVec3.inportY = LogicNodeVec3.logicInterface.addInputProperty("y", "float", 0);
		LogicNodeVec3.inportZ = LogicNodeVec3.logicInterface.addInputProperty("z", "float", 0);
		LogicNodeVec3.outportX = LogicNodeVec3.logicInterface.addOutputProperty("x", "float", 0);
		LogicNodeVec3.outportY = LogicNodeVec3.logicInterface.addOutputProperty("y", "float", 0);
		LogicNodeVec3.outportZ = LogicNodeVec3.logicInterface.addOutputProperty("z", "float", 0);

		LogicNodes.registerType("LogicNodeVec3", LogicNodeVec3);

		return LogicNodeVec3;
	});