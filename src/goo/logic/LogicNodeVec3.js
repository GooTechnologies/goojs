define(
       [
       'goo/logic/LogicLayer',
       'goo/logic/LogicNode',
       'goo/logic/LogicNodes',
       'goo/logic/LogicInterface',
       'goo/math/Vector3'
       ]
       ,
	/** @lends */
	function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
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

	LogicNodeVec3.prototype.onPropertyWrite = function(portID, value)
	{
		if (portID == LogicNodeVec3.inportX)
			this._x = value;
		else if (portID == LogicNodeVec3.inportY)
			this._y = value;
		else if (portID == LogicNodeVec3.inportZ)
			this._z = value;
		
		LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportVec3, new Vector3(this._x, this._y, this._z));
	}
	
	LogicNodeVec3.logicInterface = new LogicInterface();
	LogicNodeVec3.outportVec3 = LogicNodeVec3.logicInterface.addOutputProperty("Vector3", "Vector3");
	LogicNodeVec3.inportX = LogicNodeVec3.logicInterface.addInputProperty("x", "float", 0);
	LogicNodeVec3.inportY = LogicNodeVec3.logicInterface.addInputProperty("y", "float", 0);
	LogicNodeVec3.inportZ = LogicNodeVec3.logicInterface.addInputProperty("z", "float", 0);
	
	LogicNodes.registerType("LogicNodeVec3", LogicNodeVec3);
	
	return LogicNodeVec3;
});
