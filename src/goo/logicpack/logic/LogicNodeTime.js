define(
	[
		'goo/logic/LogicLayer',
		'goo/logic/LogicNode',
		'goo/logic/LogicInterface',
		'goo/logic/LogicNodes'
	],

	function(LogicLayer, LogicNode, LogicInterface, LogicNodes) {
		'use strict';

		/**
		 * Logic node implementing a time counter. Processed every frame and time is increased. Output
		 * can be read through the "Time" port
		 * @private
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
		LogicNodeTime.outEventReached1 = LogicNodeTime.logicInterface.addOutputEvent(">1");
		LogicNodeTime.inEventStart = LogicNodeTime.logicInterface.addInputEvent("Start");
		LogicNodeTime.inEventStop = LogicNodeTime.logicInterface.addInputEvent("Stop");
		LogicNodeTime.inEventReset = LogicNodeTime.logicInterface.addInputEvent("Reset");

		LogicNodeTime.prototype.onConfigure = function() {
			this._time = 0;
			this._running = true;
		};

		// Process
		LogicNodeTime.prototype.processLogic = function(tpf) {
			if (this._running) {
				var old = this._time;
				this._time += tpf;
				LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, this._time);

				if (old < 1 && this._time >= 1) {
					LogicLayer.fireEvent(this.logicInstance, LogicNodeTime.outEventReached1);
				}
			}
		};

		// should they have args too?
		LogicNodeTime.prototype.onEvent = function(instDesc, event) {
			if (event === LogicNodeTime.inEventStart) {
				this._running = true;
			} else if (event === LogicNodeTime.inEventStop) {
				this._running = false;
			} else if (event === LogicNodeTime.inEventReset) {
				this._time = 0;
				LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, 0);
			}
		};

		LogicNodes.registerType("LogicNodeTime", LogicNodeTime);

		return LogicNodeTime;
	});