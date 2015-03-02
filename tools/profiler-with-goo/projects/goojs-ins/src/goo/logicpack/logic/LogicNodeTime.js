define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicInterface',
    'goo/logic/LogicNodes'
], function (LogicLayer, LogicNode, LogicInterface, LogicNodes) {
    'use strict';
    __touch(10499);
    function LogicNodeTime() {
        LogicNode.call(this);
        __touch(10514);
        this.wantsProcessCall = true;
        __touch(10515);
        this.logicInterface = LogicNodeTime.logicInterface;
        __touch(10516);
        this.type = 'LogicNodeTime';
        __touch(10517);
        this._time = 0;
        __touch(10518);
        this._running = true;
        __touch(10519);
    }
    __touch(10500);
    LogicNodeTime.prototype = Object.create(LogicNode.prototype);
    __touch(10501);
    LogicNodeTime.editorName = 'Time';
    __touch(10502);
    LogicNodeTime.logicInterface = new LogicInterface();
    __touch(10503);
    LogicNodeTime.outPropTime = LogicNodeTime.logicInterface.addOutputProperty('Time', 'float');
    __touch(10504);
    LogicNodeTime.outEventReached1 = LogicNodeTime.logicInterface.addOutputEvent('>1');
    __touch(10505);
    LogicNodeTime.inEventStart = LogicNodeTime.logicInterface.addInputEvent('Start');
    __touch(10506);
    LogicNodeTime.inEventStop = LogicNodeTime.logicInterface.addInputEvent('Stop');
    __touch(10507);
    LogicNodeTime.inEventReset = LogicNodeTime.logicInterface.addInputEvent('Reset');
    __touch(10508);
    LogicNodeTime.prototype.onConfigure = function () {
        this._time = 0;
        __touch(10520);
        this._running = true;
        __touch(10521);
    };
    __touch(10509);
    LogicNodeTime.prototype.processLogic = function (tpf) {
        if (this._running) {
            var old = this._time;
            __touch(10522);
            this._time += tpf;
            __touch(10523);
            LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, this._time);
            __touch(10524);
            if (old < 1 && this._time >= 1) {
                LogicLayer.fireEvent(this.logicInstance, LogicNodeTime.outEventReached1);
                __touch(10525);
            }
        }
    };
    __touch(10510);
    LogicNodeTime.prototype.onEvent = function (instDesc, event) {
        if (event === LogicNodeTime.inEventStart) {
            this._running = true;
            __touch(10526);
        } else if (event === LogicNodeTime.inEventStop) {
            this._running = false;
            __touch(10527);
        } else if (event === LogicNodeTime.inEventReset) {
            this._time = 0;
            __touch(10528);
            LogicLayer.writeValue(this.logicInstance, LogicNodeTime.outPropTime, 0);
            __touch(10529);
        }
    };
    __touch(10511);
    LogicNodes.registerType('LogicNodeTime', LogicNodeTime);
    __touch(10512);
    return LogicNodeTime;
    __touch(10513);
});
__touch(10498);