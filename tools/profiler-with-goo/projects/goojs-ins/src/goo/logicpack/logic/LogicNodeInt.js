define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10236);
    function LogicNodeInt() {
        LogicNode.call(this);
        __touch(10253);
        this.logicInterface = LogicNodeInt.logicInterface;
        __touch(10254);
        this.type = 'LogicNodeInt';
        __touch(10255);
        this.defValue = 0;
        __touch(10256);
        this.value = 0;
        __touch(10257);
    }
    __touch(10237);
    LogicNodeInt.prototype = Object.create(LogicNode.prototype);
    __touch(10238);
    LogicNodeInt.editorName = 'Int';
    __touch(10239);
    LogicNodeInt.prototype.onConfigure = function (newConfig) {
        if (newConfig.value !== undefined) {
            this.defValue = newConfig.value;
            __touch(10259);
        }
        this.value = this.defValue;
        __touch(10258);
    };
    __touch(10240);
    LogicNodeInt.prototype.onConnected = function (instDesc) {
        LogicLayer.writeValue(instDesc, LogicNodeInt.outportInt, this.value);
        __touch(10260);
    };
    __touch(10241);
    LogicNodeInt.prototype.onEvent = function (instDesc, evt) {
        if (evt === LogicNodeInt.ineventIncrease) {
            this.value = this.value + 1;
            __touch(10262);
        } else if (evt === LogicNodeInt.ineventDecrease) {
            this.value = this.value - 1;
            __touch(10263);
        } else {
            this.value = this.defValue;
            __touch(10264);
        }
        LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
        __touch(10261);
    };
    __touch(10242);
    LogicNodeInt.prototype.onSystemStarted = function () {
        LogicLayer.writeValue(this.logicInstance, LogicNodeInt.outportInt, this.value);
        __touch(10265);
    };
    __touch(10243);
    LogicNodeInt.prototype.onSystemStopped = function () {
    };
    __touch(10244);
    LogicNodes.registerType('LogicNodeInt', LogicNodeInt);
    __touch(10245);
    LogicNodeInt.logicInterface = new LogicInterface();
    __touch(10246);
    LogicNodeInt.ineventReset = LogicNodeInt.logicInterface.addInputEvent('reset');
    __touch(10247);
    LogicNodeInt.ineventIncrease = LogicNodeInt.logicInterface.addInputEvent('increase');
    __touch(10248);
    LogicNodeInt.ineventDecrease = LogicNodeInt.logicInterface.addInputEvent('decrease');
    __touch(10249);
    LogicNodeInt.outportInt = LogicNodeInt.logicInterface.addOutputProperty('value', 'int');
    __touch(10250);
    LogicNodeInt.logicInterface.addConfigEntry({
        name: 'value',
        type: 'int',
        label: 'Value'
    });
    __touch(10251);
    return LogicNodeInt;
    __touch(10252);
});
__touch(10235);