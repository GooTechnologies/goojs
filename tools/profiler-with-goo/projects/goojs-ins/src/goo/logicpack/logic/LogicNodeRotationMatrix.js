define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/math/Vector3',
    'goo/math/Matrix3x3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3x3) {
    'use strict';
    __touch(10445);
    function LogicNodeRotationMatrix() {
        LogicNode.call(this);
        __touch(10455);
        this.logicInterface = LogicNodeRotationMatrix.logicInterface;
        __touch(10456);
        this.type = 'LogicNodeRotationMatrix';
        __touch(10457);
        this.vec = new Vector3();
        __touch(10458);
    }
    __touch(10446);
    LogicNodeRotationMatrix.prototype = Object.create(LogicNode.prototype);
    __touch(10447);
    LogicNodeRotationMatrix.editorName = 'RotationMatrix';
    __touch(10448);
    LogicNodeRotationMatrix.prototype.onInputChanged = function (instDesc) {
        var vec = LogicLayer.readPort(instDesc, LogicNodeRotationMatrix.inportX);
        __touch(10459);
        var mat = new Matrix3x3();
        __touch(10460);
        mat.fromAngles(vec.x, vec.y, vec.z);
        __touch(10461);
        LogicLayer.writeValue(instDesc, LogicNodeRotationMatrix.outportProduct, mat);
        __touch(10462);
    };
    __touch(10449);
    LogicNodeRotationMatrix.logicInterface = new LogicInterface();
    __touch(10450);
    LogicNodeRotationMatrix.inportX = LogicNodeRotationMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
    __touch(10451);
    LogicNodeRotationMatrix.outportProduct = LogicNodeRotationMatrix.logicInterface.addOutputProperty('mat', 'Matrix3', new Matrix3x3());
    __touch(10452);
    LogicNodes.registerType('LogicNodeRotationMatrix', LogicNodeRotationMatrix);
    __touch(10453);
    return LogicNodeRotationMatrix;
    __touch(10454);
});
__touch(10444);