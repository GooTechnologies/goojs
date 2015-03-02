define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicInterface',
    'goo/logic/LogicNodes'
], function (LogicLayer, LogicNode, LogicInterface, LogicNodes) {
    'use strict';
    __touch(10430);
    function LogicNodeRandom() {
        LogicNode.call(this);
        __touch(10439);
        this.wantsProcessCall = true;
        __touch(10440);
        this.logicInterface = LogicNodeRandom.logicInterface;
        __touch(10441);
        this.type = 'LogicNodeRandom';
        __touch(10442);
    }
    __touch(10431);
    LogicNodeRandom.prototype = Object.create(LogicNode.prototype);
    __touch(10432);
    LogicNodeRandom.editorName = 'Random';
    __touch(10433);
    LogicNodeRandom.logicInterface = new LogicInterface();
    __touch(10434);
    LogicNodeRandom.outPropRandom = LogicNodeRandom.logicInterface.addOutputProperty('Random0_1', 'float');
    __touch(10435);
    LogicNodeRandom.prototype.processLogic = function () {
        LogicLayer.writeValue(this.logicInstance, LogicNodeRandom.outPropRandom, Math.random());
        __touch(10443);
    };
    __touch(10436);
    LogicNodes.registerType('LogicNodeRandom', LogicNodeRandom);
    __touch(10437);
    return LogicNodeRandom;
    __touch(10438);
});
__touch(10429);