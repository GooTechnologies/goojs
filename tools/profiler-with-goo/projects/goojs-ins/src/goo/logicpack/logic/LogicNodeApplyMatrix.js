define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/math/Vector3',
    'goo/math/Matrix3x3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, Vector3, Matrix3x3) {
    'use strict';
    __touch(10127);
    function LogicNodeApplyMatrix() {
        LogicNode.call(this);
        __touch(10138);
        this.logicInterface = LogicNodeApplyMatrix.logicInterface;
        __touch(10139);
        this.type = 'LogicNodeApplyMatrix';
        __touch(10140);
        this.vec = new Vector3();
        __touch(10141);
    }
    __touch(10128);
    LogicNodeApplyMatrix.prototype = Object.create(LogicNode.prototype);
    __touch(10129);
    LogicNodeApplyMatrix.editorName = 'ApplyMatrix';
    __touch(10130);
    LogicNodeApplyMatrix.prototype.onInputChanged = function (instDesc) {
        var vec = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportX);
        __touch(10142);
        var mat = LogicLayer.readPort(instDesc, LogicNodeApplyMatrix.inportY);
        __touch(10143);
        this.vec.copy(vec);
        __touch(10144);
        mat.applyPost(this.vec);
        __touch(10145);
        LogicLayer.writeValue(this.logicInstance, LogicNodeApplyMatrix.outportProduct, this.vec);
        __touch(10146);
    };
    __touch(10131);
    LogicNodeApplyMatrix.logicInterface = new LogicInterface();
    __touch(10132);
    LogicNodeApplyMatrix.outportProduct = LogicNodeApplyMatrix.logicInterface.addOutputProperty('product', 'Vector3');
    __touch(10133);
    LogicNodeApplyMatrix.inportX = LogicNodeApplyMatrix.logicInterface.addInputProperty('vec', 'Vector3', new Vector3());
    __touch(10134);
    LogicNodeApplyMatrix.inportY = LogicNodeApplyMatrix.logicInterface.addInputProperty('mat', 'Matrix3', new Matrix3x3());
    __touch(10135);
    LogicNodes.registerType('LogicNodeApplyMatrix', LogicNodeApplyMatrix);
    __touch(10136);
    return LogicNodeApplyMatrix;
    __touch(10137);
});
__touch(10126);