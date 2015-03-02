define([
    'goo/loaders/handlers/ComponentHandler',
    'goo/entities/components/MeshDataComponent',
    'goo/renderer/bounds/BoundingBox',
    'goo/util/ShapeCreatorMemoized',
    'goo/util/rsvp',
    'goo/util/ObjectUtil',
    'goo/util/StringUtil'
], function (ComponentHandler, MeshDataComponent, BoundingBox, ShapeCreatorMemoized, RSVP, _, StringUtil) {
    'use strict';
    __touch(9140);
    function MeshDataComponentHandler() {
        ComponentHandler.apply(this, arguments);
        __touch(9150);
        this._type = 'MeshDataComponent';
        __touch(9151);
    }
    __touch(9141);
    MeshDataComponentHandler.prototype = Object.create(ComponentHandler.prototype);
    __touch(9142);
    MeshDataComponentHandler.prototype.constructor = MeshDataComponentHandler;
    __touch(9143);
    ComponentHandler._registerClass('meshData', MeshDataComponentHandler);
    __touch(9144);
    MeshDataComponentHandler.prototype._prepare = function (config) {
        return _.defaults(config, {});
        __touch(9152);
    };
    __touch(9145);
    MeshDataComponentHandler.prototype._create = function () {
        return new MeshDataComponent();
        __touch(9153);
    };
    __touch(9146);
    MeshDataComponentHandler.prototype._remove = function (entity) {
        if (entity.meshDataComponent && entity.meshDataComponent.meshData && this.world.gooRunner) {
            entity.meshDataComponent.meshData.destroy(this.world.gooRunner.renderer.context);
            __touch(9155);
        }
        entity.clearComponent('MeshDataComponent');
        __touch(9154);
    };
    __touch(9147);
    MeshDataComponentHandler.prototype.update = function (entity, config, options) {
        var that = this;
        __touch(9156);
        return ComponentHandler.prototype.update.call(this, entity, config, options).then(function (component) {
            if (!component) {
                return;
                __touch(9158);
            }
            if (config.shape) {
                var shapeCreator = ShapeCreatorMemoized['create' + StringUtil.capitalize(config.shape)];
                __touch(9159);
                if (shapeCreator) {
                    component.meshData = shapeCreator(config.shapeOptions, component.meshData);
                    __touch(9160);
                    component.autoCompute = true;
                    __touch(9161);
                    return component;
                    __touch(9162);
                }
            } else if (config.meshRef) {
                var promises = [];
                __touch(9163);
                promises.push(that._load(config.meshRef, options).then(function (meshData) {
                    component.meshData = meshData;
                    __touch(9166);
                    if (meshData.boundingBox) {
                        var min = meshData.boundingBox.min;
                        __touch(9167);
                        var max = meshData.boundingBox.max;
                        __touch(9168);
                        var size = [
                            max[0] - min[0],
                            max[1] - min[1],
                            max[2] - min[2]
                        ];
                        __touch(9169);
                        var center = [
                            (max[0] + min[0]) * 0.5,
                            (max[1] + min[1]) * 0.5,
                            (max[2] + min[2]) * 0.5
                        ];
                        __touch(9170);
                        var bounding = new BoundingBox();
                        __touch(9171);
                        bounding.xExtent = size[0] / 2;
                        __touch(9172);
                        bounding.yExtent = size[1] / 2;
                        __touch(9173);
                        bounding.zExtent = size[2] / 2;
                        __touch(9174);
                        bounding.center.seta(center);
                        __touch(9175);
                        component.modelBound = bounding;
                        __touch(9176);
                        component.autoCompute = false;
                        __touch(9177);
                    }
                }));
                __touch(9164);
                if (config.poseRef) {
                    promises.push(that._load(config.poseRef, options).then(function (pose) {
                        component.currentPose = pose;
                        __touch(9179);
                    }));
                    __touch(9178);
                } else {
                    component.currentPose = null;
                    __touch(9180);
                }
                return RSVP.all(promises).then(function () {
                    return component;
                    __touch(9181);
                });
                __touch(9165);
            } else {
                console.warn('MeshDataComponent config does not contain a primitive spec or a reference to a mesh');
                __touch(9182);
            }
        });
        __touch(9157);
    };
    __touch(9148);
    return MeshDataComponentHandler;
    __touch(9149);
});
__touch(9139);