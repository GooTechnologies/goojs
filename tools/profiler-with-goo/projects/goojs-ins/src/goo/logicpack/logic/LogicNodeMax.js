define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10287);
    function LogicNodeMax() {
        LogicNode.call(this);
        __touch(10298);
        this.logicInterface = LogicNodeMax.logicInterface;
        __touch(10299);
        this.type = 'LogicNodeMax';
        __touch(10300);
    }
    __touch(10288);
    LogicNodeMax.prototype = Object.create(LogicNode.prototype);
    __touch(10289);
    LogicNodeMax.editorName = 'Max';
    __touch(10290);
    LogicNodeMax.prototype.onInputChanged = function (instDesc) {
        var val1 = LogicLayer.readPort(instDesc, LogicNodeMax.inportX);
        __touch(10301);
        var val2 = LogicLayer.readPort(instDesc, LogicNodeMax.inportY);
        __touch(10302);
        var out = Math.max(val1, val2);
        __touch(10303);
        LogicLayer.writeValue(instDesc, LogicNodeMax.outportSum, out);
        __touch(10304);
    };
    __touch(10291);
    LogicNodeMax.logicInterface = new LogicInterface();
    __touch(10292);
    LogicNodeMax.outportSum = LogicNodeMax.logicInterface.addOutputProperty('max', 'float');
    __touch(10293);
    LogicNodeMax.inportX = LogicNodeMax.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10294);
    LogicNodeMax.inportY = LogicNodeMax.logicInterface.addInputProperty('y', 'float', 0);
    __touch(10295);
    LogicNodes.registerType('LogicNodeMax', LogicNodeMax);
    __touch(10296);
    return LogicNodeMax;
    __touch(10297);
});
__touch(10286);