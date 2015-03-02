define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/MeshRendererComponent',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/util/rsvp',
    'goo/util/PromiseUtil',
    'goo/util/ObjectUtil'
], function (ComponentHandler, MeshRendererComponent, Material, ShaderLib, RSVP, pu, _) {
    'use strict';
    __touch(9249);
    function MeshRendererComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9259);
        this._type = 'MeshRendererComponent';
        __touch(9260);
    }
    __touch(9250);
    MeshRendererComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9251);
    MeshRendererComponentHandler.prototype.constructor = MeshRendererComponentHandler;
    __touch(9252);
    ComponentHandler._registerClass('meshRenderer', MeshRendererComponentHandler);
    __touch(9253);
    MeshRendererComponentHandler.DEFAULT_MATERIAL = new Material(ShaderLib.uber, 'Default material');
    __touch(9254);
    MeshRendererComponentHandler.prototype._prepare = function (config) {
        return _.defaults(config, {
            cullMode: 'Dynamic',
            castShadows: true,
            receiveShadows: true,
            reflectable: true
        });
        __touch(9261);
    };
    __touch(9255);
    MeshRendererComponentHandler.prototype._create = function () {
        return new MeshRendererComponent();
        __touch(9262);
    };
    __touch(9256);
    MeshRendererComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(9263);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(9273);
            }
            component.cullMode = config.cullMode;
            __touch(9265);
            component.castShadows = config.castShadows;
            __touch(9266);
            component.receiveShadows = config.receiveShadows;
            __touch(9267);
            component.isReflectable = config.reflectable;
            __touch(9268);
            var materials = config.materials;
            __touch(9269);
            if (!materials || !Object.keys(materials).length) {
                var selectionMaterial = component.materials.filter(function (material) {
                    return material.name === 'gooSelectionIndicator';
                    __touch(9277);
                });
                __touch(9274);
                component.materials = [MeshRendererComponentHandler.DEFAULT_MATERIAL].concat(selectionMaterial);
                __touch(9275);
                return component;
                __touch(9276);
            }
            var promises = [];
            __touch(9270);
            _.forEach(materials, function (item) {
                promises.push(that._load(item.materialRef, options));
                __touch(9278);
            }, null, 'sortValue');
            __touch(9271);
            return RSVP.all(promises).then(function (materials) {
                var selectionMaterial = component.materials.filter(function (material) {
                    return material.name === 'gooSelectionIndicator';
                    __touch(9282);
                });
                __touch(9279);
                component.materials = materials.concat(selectionMaterial);
                __touch(9280);
                return component;
                __touch(9281);
            });
            __touch(9272);
        });
        __touch(9264);
    };
    __touch(9257);
    return MeshRendererComponentHandler;
    __touch(9258);
});
__touch(9248);