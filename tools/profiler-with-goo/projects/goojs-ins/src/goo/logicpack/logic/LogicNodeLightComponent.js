define([
    'goo/logic/LogicLayer',
    'goo/logic/LogicNode',
    'goo/logic/LogicNodes',
    'goo/logic/LogicInterface'
], function (LogicLayer, LogicNode, LogicNodes, LogicInterface) {
    'use strict';
    __touch(10267);
    function LogicNodeLightComponent() {
        LogicNode.call(this);
        __touch(10279);
        this.logicInterface = LogicNodeLightComponent.logicInterface;
        __touch(10280);
        this.type = 'LightComponent';
        __touch(10281);
    }
    __touch(10268);
    LogicNodeLightComponent.prototype = Object.create(LogicNode.prototype);
    __touch(10269);
    LogicNodeLightComponent.editorName = 'LightComponent';
    __touch(10270);
    LogicNodeLightComponent.prototype.onConfigure = function (config) {
        this.entityRef = config.entityRef;
        __touch(10282);
    };
    __touch(10271);
    LogicNodeLightComponent.logicInterface = new LogicInterface('LightComponent');
    __touch(10272);
    LogicNodeLightComponent.inportIntensity = LogicNodeLightComponent.logicInterface.addInputProperty('Intensity', 'float');
    __touch(10273);
    LogicNodeLightComponent.inportRange = LogicNodeLightComponent.logicInterface.addInputProperty('Range', 'float');
    __touch(10274);
    LogicNodeLightComponent.prototype.onInputChanged = function (instDesc, propID, value) {
        var entity = LogicLayer.resolveEntityRef(instDesc, this.entityRef);
        __touch(10283);
        if (propID === LogicNodeLightComponent.inportIntensity) {
            entity.lightComponent.light.intensity = value;
            __touch(10284);
        } else if (propID === LogicNodeLightComponent.inportRange) {
            entity.lightComponent.light.range = value;
            __touch(10285);
        }
    };
    __touch(10275);
    LogicNodeLightComponent.logicInterface.addConfigEntry({
        name: 'entityRef',
        type: 'entityRef',
        label: 'Entity'
    });
    __touch(10276);
    LogicNodes.registerType('LightComponent', LogicNodeLightComponent);
    __touch(10277);
    return LogicNodeLightComponent;
    __touch(10278);
});
__touch(10266);