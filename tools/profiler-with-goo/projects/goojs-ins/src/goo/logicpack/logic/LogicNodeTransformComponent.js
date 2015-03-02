define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/entities/components/TransformComponent',
    'goo/math/Vector3',
    'goo/math/Matrix3x3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, TransformComponent, Vector3, Matrix3x3) {
    'use strict';
    __touch(10531);
    function LogicNodeTransformComponent() {
        LogicNode.call(this);
        __touch(10546);
        this.logicInterface = LogicNodeTransformComponent.logicInterface;
        __touch(10547);
        this.type = 'TransformComponent';
        __touch(10548);
    }
    __touch(10532);
    LogicNodeTransformComponent.prototype = Object.create(LogicNode.prototype);
    __touch(10533);
    LogicNodeTransformComponent.editorName = 'TransformComponent';
    __touch(10534);
    LogicNodeTransformComponent.prototype.onConfigure = function (config) {
        this.entityRef = config.entityRef;
        __touch(10549);
    };
    __touch(10535);
    LogicNodeTransformComponent.prototype.onInputChanged = function (instDesc, portID, value) {
        var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
        __touch(10550);
        var transformComponent = entity.transformComponent;
        __touch(10551);
        if (portID === LogicNodeTransformComponent.inportPos) {
            transformComponent.setTranslation(value);
            __touch(10554);
        } else if (portID === LogicNodeTransformComponent.inportRot) {
            transformComponent.setRotation(value[0], value[1], value[2]);
            __touch(10555);
        } else if (portID === LogicNodeTransformComponent.inportScale) {
            transformComponent.setScale(value);
            __touch(10556);
        }
        LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportPos, entity.transformComponent.transform.translation.clone());
        __touch(10552);
        LogicLayer.writeValue(this.logicInstance, LogicNodeTransformComponent.outportRot, entity.transformComponent.transform.rotation.clone());
        __touch(10553);
    };
    __touch(10536);
    LogicNodeTransformComponent.logicInterface = new LogicInterface('Transform');
    __touch(10537);
    LogicNodeTransformComponent.inportPos = LogicNodeTransformComponent.logicInterface.addInputProperty('position', 'Vector3', new Vector3(0, 0, 0));
    __touch(10538);
    LogicNodeTransformComponent.inportRot = LogicNodeTransformComponent.logicInterface.addInputProperty('rotation', 'Vector3', new Vector3(0, 0, 0));
    __touch(10539);
    LogicNodeTransformComponent.inportScale = LogicNodeTransformComponent.logicInterface.addInputProperty('scale', 'Vector3', new Vector3(1, 1, 1));
    __touch(10540);
    LogicNodeTransformComponent.outportPos = LogicNodeTransformComponent.logicInterface.addOutputProperty('outpos', 'Vector3', new Vector3());
    __touch(10541);
    LogicNodeTransformComponent.outportRot = LogicNodeTransformComponent.logicInterface.addOutputProperty('rotmat', 'Matrix3', new Matrix3x3());
    __touch(10542);
    LogicNodeTransformComponent.logicInterface.addConfigEntry({
        name: 'entityRef',
        type: 'entityRef',
        label: 'Entity'
    });
    __touch(10543);
    LogicNodes.registerType('TransformComponent', LogicNodeTransformComponent);
    __touch(10544);
    return LogicNodeTransformComponent;
    __touch(10545);
});
__touch(10530);