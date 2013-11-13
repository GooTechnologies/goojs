define(
       [
       'goo/logic/LogicLayer',
       'goo/logic/LogicNode',
       'goo/logic/LogicInterface'
       ]
       ,
	/** @lends */
	function (LogicLayer, LogicNode, LogicInterface) {
	"use strict";

	/**
	 * @class Logic node that calculates sine
	 */
	function LogicNodeSine() {
                LogicNode.call(this);
                this.logicInterface = LogicNodeSine.logicInterface;
                this.type = "LogicNodeSine";
                this._time = 0;
	}
	
	LogicNodeSine.prototype = Object.create(LogicNode.prototype);
        LogicNodeSine.editorName = "Sine";

	LogicNodeSine.prototype.onPropertyWrite = function(portID, value)
	{
		LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportSine, Math.sin(value));
	}
	
	LogicNodeSine.logicInterface = new LogicInterface();
	LogicNodeSine.outportSine = LogicNodeSine.logicInterface.addOutputProperty("Sine", "float");
	LogicNodeSine.inportPhase = LogicNodeSine.logicInterface.addInputProperty("Phase", "float", 0);
	
	return LogicNodeSine;
});
