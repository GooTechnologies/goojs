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
                this.type = "LogicNodeTime";
                this._time = 0;
                this._running = true;
	}

	// Logic interface set-up	
	LogicNodeTime.prototype = Object.create(LogicNode.prototype);

	LogicNodeTime.editorName = "Time";
	LogicNodeTime.logicInterface = new LogicInterface();
	
	// ports
	LogicNodeTime.outPropTime = LogicNodeTime.logicInterface.addOutputProperty("Time", "float");
	
	// events
	LogicNodeTime.outEventReached1 = LogicNodeTime.logicInterface.addOutputEvent("Reached1");
	LogicNodeTime.inEventStart = LogicNodeTime.logicInterface.addInputEvent("Start");
	LogicNodeTime.inEventStop = LogicNodeTime.logicInterface.addInputEvent("Sop");
	LogicNodeTime.inEventReset = LogicNodeTime.logicInterface.addInputEvent("Reset");
	
	// Process
	LogicNodeTime.prototype.processLogic = function(tpf) {
		if (this._running)
		{
			var old = this._time;
		        this._time += tpf;
		        LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, this._time);

		        if (old < 1 && this._time >= 1)
		        {
		        	LogicLayer.fireEvent(this.logicInstance, LogicNodeTime.outEventReached1);
		        	console.log("LogicNodeTime fired reached1 event");
			}
		}
	}
	
	// should they have args too?
	LogicNodeTime.prototype.onEvent = function(event) {
		if (event == LogicNodeTime.inEventStart)
		{
			this._running = true;
		}
		else if (event == LogicNodeTime.inEventStop)
		{
			this._running = false;
		}
		else if (event == LogicNodeTime.inEventReset)
		{
			console.log("LogicNodeTime got reset event");
			this._time = 0;
			LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, 0);
		}
	}
	
	return LogicNodeTime;
});
