define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10371);
    function LogicNodeMultiply() {
        LogicNode.call(this);
        __touch(10382);
        this.logicInterface = LogicNodeMultiply.logicInterface;
        __touch(10383);
        this.type = 'LogicNodeMultiply';
        __touch(10384);
        this._x = this._y = 0;
        __touch(10385);
    }
    __touch(10372);
    LogicNodeMultiply.prototype = Object.create(LogicNode.prototype);
    __touch(10373);
    LogicNodeMultiply.editorName = 'Multiply';
    __touch(10374);
    LogicNodeMultiply.prototype.onInputChanged = function (instDesc) {
        var x = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportX);
        __touch(10386);
        var y = LogicLayer.readPort(instDesc, LogicNodeMultiply.inportY);
        __touch(10387);
        LogicLayer.writeValue(instDesc, LogicNodeMultiply.outportProduct, x * y);
        __touch(10388);
    };
    __touch(10375);
    LogicNodeMultiply.logicInterface = new LogicInterface();
    __touch(10376);
    LogicNodeMultiply.outportProduct = LogicNodeMultiply.logicInterface.addOutputProperty('product', 'float');
    __touch(10377);
    LogicNodeMultiply.inportX = LogicNodeMultiply.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10378);
    LogicNodeMultiply.inportY = LogicNodeMultiply.logicInterface.addInputProperty('y', 'float', 0);
    __touch(10379);
    LogicNodes.registerType('LogicNodeMultiply', LogicNodeMultiply);
    __touch(10380);
    return LogicNodeMultiply;
    __touch(10381);
});
__touch(10370);