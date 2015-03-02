define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10110);
    function LogicNodeAdd() {
        LogicNode.call(this);
        __touch(10121);
        this.logicInterface = LogicNodeAdd.logicInterface;
        __touch(10122);
        this.type = 'LogicNodeAdd';
        __touch(10123);
    }
    __touch(10111);
    LogicNodeAdd.prototype = Object.create(LogicNode.prototype);
    __touch(10112);
    LogicNodeAdd.editorName = 'Add';
    __touch(10113);
    LogicNodeAdd.prototype.onInputChanged = function (instDesc) {
        var out = LogicLayer.readPort(instDesc, LogicNodeAdd.inportX) + LogicLayer.readPort(instDesc, LogicNodeAdd.inportY);
        __touch(10124);
        LogicLayer.writeValue(this.logicInstance, LogicNodeAdd.outportSum, out);
        __touch(10125);
    };
    __touch(10114);
    LogicNodeAdd.logicInterface = new LogicInterface();
    __touch(10115);
    LogicNodeAdd.outportSum = LogicNodeAdd.logicInterface.addOutputProperty('sum', 'float');
    __touch(10116);
    LogicNodeAdd.inportX = LogicNodeAdd.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10117);
    LogicNodeAdd.inportY = LogicNodeAdd.logicInterface.addInputProperty('y', 'float', 0);
    __touch(10118);
    LogicNodes.registerType('LogicNodeAdd', LogicNodeAdd);
    __touch(10119);
    return LogicNodeAdd;
    __touch(10120);
});
__touch(10109);