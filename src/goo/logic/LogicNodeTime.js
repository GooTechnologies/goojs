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
	 * @class Logic node implementing a time counter. Processed every frame and time is increased. Output
	 *        can be read through the "Time" port
	 */
	function LogicNodeTime() {
                LogicNode.call(this);
                this.wantsProcessCall = true;
                this.logicInterface = LogicNodeTime.logicInterface;
                this._time = 0;
	}

	// Logic interface set-up	
	LogicNodeTime.prototype = Object.create(LogicNode.prototype);
	LogicNodeTime.logicInterface = new LogicInterface();
	LogicNodeTime.outportTime = LogicNodeTime.logicInterface.addOutputProperty("Time", "float");
	
	// Process
	LogicNodeTime.prototype.processLogic = function(tpf) {
	        this._time += tpf;
	        LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outportTime, this._time);
	}
	
	return LogicNodeTime;
});
