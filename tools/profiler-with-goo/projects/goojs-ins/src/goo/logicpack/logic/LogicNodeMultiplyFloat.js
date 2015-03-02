define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10390);
    function LogicNodeMultiplyFloat() {
        LogicNode.call(this);
        __touch(10402);
        this.logicInterface = LogicNodeMultiplyFloat.logicInterface;
        __touch(10403);
        this.type = 'LogicNodeMultiplyFloat';
        __touch(10404);
        this._x = this._y = 0;
        __touch(10405);
    }
    __touch(10391);
    LogicNodeMultiplyFloat.prototype = Object.create(LogicNode.prototype);
    __touch(10392);
    LogicNodeMultiplyFloat.editorName = 'MultiplyFloat';
    __touch(10393);
    LogicNodeMultiplyFloat.prototype.onConfigure = function (newConfig) {
        if (newConfig.value !== undefined) {
            this.value = newConfig.value;
            __touch(10406);
        }
    };
    __touch(10394);
    LogicNodeMultiplyFloat.prototype.onInputChanged = function (instDesc) {
        var x = LogicLayer.readPort(instDesc, LogicNodeMultiplyFloat.inportX);
        __touch(10407);
        var y = this.value;
        __touch(10408);
        LogicLayer.writeValue(instDesc, LogicNodeMultiplyFloat.outportProduct, x * y);
        __touch(10409);
    };
    __touch(10395);
    LogicNodeMultiplyFloat.logicInterface = new LogicInterface();
    __touch(10396);
    LogicNodeMultiplyFloat.outportProduct = LogicNodeMultiplyFloat.logicInterface.addOutputProperty('product', 'float');
    __touch(10397);
    LogicNodeMultiplyFloat.inportX = LogicNodeMultiplyFloat.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10398);
    LogicNodeMultiplyFloat.logicInterface.addConfigEntry({
        name: 'value',
        type: 'float',
        label: 'Value'
    });
    __touch(10399);
    LogicNodes.registerType('LogicNodeMultiplyFloat', LogicNodeMultiplyFloat);
    __touch(10400);
    return LogicNodeMultiplyFloat;
    __touch(10401);
});
__touch(10389);