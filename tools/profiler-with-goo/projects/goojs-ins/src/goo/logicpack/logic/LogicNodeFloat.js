define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10200);
    function LogicNodeFloat() {
        LogicNode.call(this);
        __touch(10211);
        this.logicInterface = LogicNodeFloat.logicInterface;
        __touch(10212);
        this.type = 'LogicNodeFloat';
        __touch(10213);
    }
    __touch(10201);
    LogicNodeFloat.prototype = Object.create(LogicNode.prototype);
    __touch(10202);
    LogicNodeFloat.editorName = 'Float';
    __touch(10203);
    LogicNodeFloat.prototype.onConfigure = function (newConfig) {
        if (newConfig.value !== undefined) {
            this.value = newConfig.value;
            __touch(10214);
            LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
            __touch(10215);
        }
    };
    __touch(10204);
    LogicNodeFloat.prototype.onSystemStarted = function () {
        LogicLayer.writeValue(this.logicInstance, LogicNodeFloat.outportFloat, this.value);
        __touch(10216);
    };
    __touch(10205);
    LogicNodes.registerType('LogicNodeFloat', LogicNodeFloat);
    __touch(10206);
    LogicNodeFloat.logicInterface = new LogicInterface();
    __touch(10207);
    LogicNodeFloat.outportFloat = LogicNodeFloat.logicInterface.addOutputProperty('value', 'float');
    __touch(10208);
    LogicNodeFloat.logicInterface.addConfigEntry({
        name: 'value',
        type: 'float',
        label: 'Value'
    });
    __touch(10209);
    return LogicNodeFloat;
    __touch(10210);
});
__touch(10199);