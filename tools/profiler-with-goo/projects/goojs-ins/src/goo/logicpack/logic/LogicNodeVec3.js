define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/math/Vector3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3) {
    'use strict';
    __touch(10558);
    function LogicNodeVec3() {
        LogicNode.call(this);
        __touch(10574);
        this.logicInterface = LogicNodeVec3.logicInterface;
        __touch(10575);
        this.type = 'LogicNodeVec3';
        __touch(10576);
        this._x = this._y = this._z = 0;
        __touch(10577);
    }
    __touch(10559);
    LogicNodeVec3.prototype = Object.create(LogicNode.prototype);
    __touch(10560);
    LogicNodeVec3.editorName = 'Vec3';
    __touch(10561);
    LogicNodeVec3.prototype.onInputChanged = function (instDesc) {
        var x = LogicLayer.readPort(instDesc, LogicNodeVec3.inportX);
        __touch(10578);
        var y = LogicLayer.readPort(instDesc, LogicNodeVec3.inportY);
        __touch(10579);
        var z = LogicLayer.readPort(instDesc, LogicNodeVec3.inportZ);
        __touch(10580);
        var xyz = LogicLayer.readPort(instDesc, LogicNodeVec3.inportVec3);
        __touch(10581);
        if (xyz !== null) {
            x = xyz.x;
            __touch(10586);
            y = xyz.y;
            __touch(10587);
            z = xyz.z;
            __touch(10588);
        }
        LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportVec3, new Vector3(x, y, z));
        __touch(10582);
        LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportX, x);
        __touch(10583);
        LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportY, y);
        __touch(10584);
        LogicLayer.writeValue(this.logicInstance, LogicNodeVec3.outportZ, z);
        __touch(10585);
    };
    __touch(10562);
    LogicNodeVec3.logicInterface = new LogicInterface();
    __touch(10563);
    LogicNodeVec3.outportVec3 = LogicNodeVec3.logicInterface.addOutputProperty('xyz', 'Vector3');
    __touch(10564);
    LogicNodeVec3.inportVec3 = LogicNodeVec3.logicInterface.addInputProperty('xyz', 'Vector3', null);
    __touch(10565);
    LogicNodeVec3.inportX = LogicNodeVec3.logicInterface.addInputProperty('x', 'float', 0);
    __touch(10566);
    LogicNodeVec3.inportY = LogicNodeVec3.logicInterface.addInputProperty('y', 'float', 0);
    __touch(10567);
    LogicNodeVec3.inportZ = LogicNodeVec3.logicInterface.addInputProperty('z', 'float', 0);
    __touch(10568);
    LogicNodeVec3.outportX = LogicNodeVec3.logicInterface.addOutputProperty('x', 'float', 0);
    __touch(10569);
    LogicNodeVec3.outportY = LogicNodeVec3.logicInterface.addOutputProperty('y', 'float', 0);
    __touch(10570);
    LogicNodeVec3.outportZ = LogicNodeVec3.logicInterface.addOutputProperty('z', 'float', 0);
    __touch(10571);
    LogicNodes.registerType('LogicNodeVec3', LogicNodeVec3);
    __touch(10572);
    return LogicNodeVec3;
    __touch(10573);
});
__touch(10557);