define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10464);
    function LogicNodeSine() {
        LogicNode.call(this);
        __touch(10475);
        this.logicInterface = LogicNodeSine.logicInterface;
        __touch(10476);
        this.type = 'LogicNodeSine';
        __touch(10477);
        this._time = 0;
        __touch(10478);
    }
    __touch(10465);
    LogicNodeSine.prototype = Object.create(LogicNode.prototype);
    __touch(10466);
    LogicNodeSine.editorName = 'Sine';
    __touch(10467);
    LogicNodeSine.prototype.onInputChanged = function (instDesc, portID, value) {
        LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportSin, Math.sin(value));
        __touch(10479);
        LogicLayer.writeValue(this.logicInstance, LogicNodeSine.outportCos, Math.cos(value));
        __touch(10480);
    };
    __touch(10468);
    LogicNodeSine.logicInterface = new LogicInterface();
    __touch(10469);
    LogicNodeSine.outportSin = LogicNodeSine.logicInterface.addOutputProperty('Sine', 'float');
    __touch(10470);
    LogicNodeSine.outportCos = LogicNodeSine.logicInterface.addOutputProperty('Cosine', 'float');
    __touch(10471);
    LogicNodeSine.inportPhase = LogicNodeSine.logicInterface.addInputProperty('Phase', 'float', 0);
    __touch(10472);
    LogicNodes.registerType('LogicNodeSine', LogicNodeSine);
    __touch(10473);
    return LogicNodeSine;
    __touch(10474);
});
__touch(10463);