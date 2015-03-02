define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/math/Vector3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
    'use strict';
    __touch(10590);
    function LogicNodeVec3Add() {
        LogicNode.call(this);
        __touch(10601);
        this.logicInterface = LogicNodeVec3Add.logicInterface;
        __touch(10602);
        this.type = 'LogicNodeVec3Add';
        __touch(10603);
    }
    __touch(10591);
    LogicNodeVec3Add.prototype = Object.create(LogicNode.prototype);
    __touch(10592);
    LogicNodeVec3Add.editorName = 'AddVec3';
    __touch(10593);
    LogicNodeVec3Add.prototype.onInputChanged = function (instDesc) {
        var vec1 = LogicLayer.readPort(instDesc, LogicNodeVec3Add.inportX);
        __touch(10604);
        var vec2 = LogicLayer.readPort(instDesc, LogicNodeVec3Add.inportY);
        __touch(10605);
        var vec = new Vector3();
        __touch(10606);
        vec.copy(vec1).add(vec2);
        __touch(10607);
        LogicLayer.writeValue(this.logicInstance, LogicNodeVec3Add.outportSum, vec);
        __touch(10608);
    };
    __touch(10594);
    LogicNodeVec3Add.logicInterface = new LogicInterface();
    __touch(10595);
    LogicNodeVec3Add.outportSum = LogicNodeVec3Add.logicInterface.addOutputProperty('sum', 'Vector3');
    __touch(10596);
    LogicNodeVec3Add.inportX = LogicNodeVec3Add.logicInterface.addInputProperty('vec1', 'Vector3', new Vector3());
    __touch(10597);
    LogicNodeVec3Add.inportY = LogicNodeVec3Add.logicInterface.addInputProperty('vec2', 'Vector3', new Vector3());
    __touch(10598);
    LogicNodes.registerType('LogicNodeVec3Add', LogicNodeVec3Add);
    __touch(10599);
    return LogicNodeVec3Add;
    __touch(10600);
});
__touch(10589);