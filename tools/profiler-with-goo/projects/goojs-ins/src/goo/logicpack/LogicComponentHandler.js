define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/LogicComponent',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/logic/LogicNodeEntityProxy',
    'goo/logic/LogicNodeTransformComponent',
    'goo/logic/LogicNodeMeshRendererComponent',
    'goo/logic/LogicNodeLightComponent',
    'goo/logic/LogicNodeDebug',
    'goo/logic/LogicNodeRandom',
    'goo/logic/LogicNodeTime',
    'goo/logic/LogicNodeSine',
    'goo/logic/LogicNodeVec3',
    'goo/logic/LogicNodeMultiply',
    'goo/logic/LogicNodeWASD',
    'goo/logic/LogicNodeWASD2',
    'goo/logic/LogicNodeMouse',
    'goo/logic/LogicNodeAdd',
    'goo/logic/LogicNodeSub',
    'goo/logic/LogicNodeFloat',
    'goo/logic/LogicNodeApplyMatrix',
    'goo/logic/LogicNodeConstVec3',
    'goo/logic/LogicNodeVec3Add',
    'goo/logic/LogicNodeRotationMatrix',
    'goo/logic/LogicNodeMultiplyFloat',
    'goo/logic/LogicNodeMax',
    'goo/logic/LogicNodeInt',
    'goo/logic/LogicNodeInput',
    'goo/logic/LogicNodeOutput'
], function (ComponentHandler, LogicComponent, RSVP, PromiseUtil) {
    'use strict';
    __touch(9858);
    function LogicComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9866);
    }
    __touch(9859);
    LogicComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9860);
    LogicComponentHandler.prototype.constructor = LogicComponentHandler;
    __touch(9861);
    ComponentHandler._registerClass('logic', LogicComponentHandler);
    __touch(9862);
    LogicComponentHandler.prototype._create = function (entity, config) {
        var c = new LogicComponent(entity);
        __touch(9867);
        c.configure(config);
        __touch(9868);
        entity.setComponent(c);
        __touch(9869);
        return c;
        __touch(9870);
    };
    __touch(9863);
    LogicComponentHandler.prototype.update = function (entity, config) {
        var component = ComponentHandler.prototype.update.call(this, entity, config);
        __touch(9871);
        component.configure(config);
        __touch(9872);
        return PromiseUtil.resolve(component);
        __touch(9873);
    };
    __touch(9864);
    return LogicComponentHandler;
    __touch(9865);
});
__touch(9857);