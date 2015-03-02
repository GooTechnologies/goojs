define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface',
    'goo/entities/components/MeshRendererComponent',
    'goo/math/Vector3'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface, MeshRendererComponent, Vector3) {
    'use strict';
    __touch(10306);
    function LogicNodeMeshRendererComponent() {
        LogicNode.call(this);
        __touch(10320);
        this.logicInterface = LogicNodeMeshRendererComponent.logicInterface;
        __touch(10321);
        this.type = 'MeshRendererComponent';
        __touch(10322);
    }
    __touch(10307);
    LogicNodeMeshRendererComponent.prototype = Object.create(LogicNode.prototype);
    __touch(10308);
    LogicNodeMeshRendererComponent.editorName = 'MeshRendererComponent';
    __touch(10309);
    LogicNodeMeshRendererComponent.prototype.onConfigure = function (config) {
        this.entityRef = config.entityRef;
        __touch(10323);
    };
    __touch(10310);
    LogicNodeMeshRendererComponent.prototype.onInputChanged = function (instDesc, portID, value) {
        var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
        __touch(10324);
        var comp = entity.meshRendererComponent;
        __touch(10325);
        if (portID === LogicNodeMeshRendererComponent.inportAmbient && comp.materials.length > 0) {
            comp.meshRendererComponent.materials[0].uniforms.materialAmbient[0] = value[0];
            __touch(10326);
            comp.materials[0].uniforms.materialAmbient[1] = value[1];
            __touch(10327);
            comp.materials[0].uniforms.materialAmbient[2] = value[2];
            __touch(10328);
        }
    };
    __touch(10311);
    LogicNodeMeshRendererComponent.prototype.onEvent = function (instDesc, event) {
        var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
        __touch(10329);
        var comp = entity.meshRendererComponent;
        __touch(10330);
        if (event === LogicNodeMeshRendererComponent.inportShadows) {
            comp.castShadows = !comp.castShadows;
            __touch(10331);
        } else if (event === LogicNodeMeshRendererComponent.inportHidden) {
            comp.hidden = !comp.hidden;
            __touch(10332);
        }
    };
    __touch(10312);
    LogicNodeMeshRendererComponent.logicInterface = new LogicInterface('Material');
    __touch(10313);
    LogicNodeMeshRendererComponent.inportShadows = LogicNodeMeshRendererComponent.logicInterface.addInputEvent('toggle-shadows');
    __touch(10314);
    LogicNodeMeshRendererComponent.inportHidden = LogicNodeMeshRendererComponent.logicInterface.addInputEvent('toggle-hidden');
    __touch(10315);
    LogicNodeMeshRendererComponent.inportAmbient = LogicNodeMeshRendererComponent.logicInterface.addInputProperty('ambient', 'Vector3', new Vector3(0.5, 0, 0));
    __touch(10316);
    LogicNodeMeshRendererComponent.logicInterface.addConfigEntry({
        name: 'entityRef',
        type: 'entityRef',
        label: 'Entity'
    });
    __touch(10317);
    LogicNodes.registerType('MeshRendererComponent', LogicNodeMeshRendererComponent);
    __touch(10318);
    return LogicNodeMeshRendererComponent;
    __touch(10319);
});
__touch(10305);