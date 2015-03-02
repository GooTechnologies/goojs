define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10482);
    function LogicNodeSub() {
        LogicNode.call(this);
        __touch(10493);
        this.logicInterface = LogicNodeSub.logicInterface;
        __touch(10494);
        this.type = 'LogicNodeSub';
        __touch(10495);
    }
    __touch(10483);
    LogicNodeSub.prototype = Object.create(LogicNode.prototype);
    __touch(10484);
    LogicNodeSub.editorName = 'Sub';
    __touch(10485);
    LogicNodeSub.prototype.onInputChanged = function (instDesc) {
        var out = LogicLayer.readPort(instDesc, LogicNodeSub.inportX) - LogicLayer.readPort(instDesc, LogicNodeSub.inportY);
        __touch(10496);
        LogicLayer.writeValue(this.logicInstance, LogicNodeSub.outportSum, out);
        __touch(10497);
    };
    __touch(10486);
    LogicNodeSub.logicInterface = new LogicInterface();
    __touch(10487);
    LogicNodeSub.outportSum = LogicNodeSub.logicInterface.addOutputProperty('sum', 'float');
    __touch(10488);
    LogicNodeSub.inportX = LogicNodeSub.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10489);
    LogicNodeSub.inportY = LogicNodeSub.logicInterface.addInputProperty('y', 'float', 0);
    __touch(10490);
    LogicNodes.registerType('LogicNodeSub', LogicNodeSub);
    __touch(10491);
    return LogicNodeSub;
    __touch(10492);
});
__touch(10481);