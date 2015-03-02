define([
    'goo/entities/components/Component',
    'goo/renderer/Material'
], function (Component, Material) {
    'use strict';
    __touch(4782);
    function MeshRendererComponent(materials) {
        this.type = 'MeshRendererComponent';
        __touch(4790);
        this.materials = Array.isArray(materials) ? materials : materials ? [materials] : [];
        __touch(4791);
        this.worldBound = null;
        __touch(4792);
        this.cullMode = 'Dynamic';
        __touch(4793);
        this.castShadows = true;
        __touch(4794);
        this.receiveShadows = true;
        __touch(4795);
        this.isPickable = true;
        __touch(4796);
        this.isReflectable = true;
        __touch(4797);
        this.hidden = false;
        __touch(4798);
        this._renderDistance = 0;
        __touch(4799);
    }
    __touch(4783);
    MeshRendererComponent.prototype = Object.create(Component.prototype);
    __touch(4784);
    MeshRendererComponent.prototype.constructor = MeshRendererComponent;
    __touch(4785);
    MeshRendererComponent.prototype.api = {
        setDiffuse: function () {
            var material = this.meshRendererComponent.materials[0];
            __touch(4800);
            if (!material.uniforms.materialDiffuse) {
                material.uniforms.materialDiffuse = [
                    0,
                    0,
                    0,
                    1
                ];
                __touch(4802);
            }
            var diffuse = material.uniforms.materialDiffuse;
            __touch(4801);
            if (arguments.length >= 3) {
                diffuse[0] = arguments[0];
                __touch(4803);
                diffuse[1] = arguments[1];
                __touch(4804);
                diffuse[2] = arguments[2];
                __touch(4805);
                diffuse[3] = arguments.length === 3 ? 1 : arguments[3];
                __touch(4806);
            } else {
                var arg = arguments[0];
                __touch(4807);
                if (arg instanceof Array) {
                    diffuse[0] = arg[0];
                    __touch(4808);
                    diffuse[1] = arg[1];
                    __touch(4809);
                    diffuse[2] = arg[2];
                    __touch(4810);
                    diffuse[3] = arg.length === 3 ? 1 : arg[3];
                    __touch(4811);
                } else if (arg.r !== undefined && arg.g !== undefined && typeof arg.b !== undefined) {
                    diffuse[0] = arg.r;
                    __touch(4812);
                    diffuse[1] = arg.g;
                    __touch(4813);
                    diffuse[2] = arg.b;
                    __touch(4814);
                    diffuse[3] = arg.a === undefined ? 1 : arg.a;
                    __touch(4815);
                }
            }
        },
        getDiffuse: function () {
            return this.meshRendererComponent.materials[0].uniforms.materialDiffuse;
            __touch(4816);
        }
    };
    __touch(4786);
    MeshRendererComponent.prototype.updateBounds = function (bounding, transform) {
        this.worldBound = bounding.transform(transform, this.worldBound);
        __touch(4817);
    };
    __touch(4787);
    MeshRendererComponent.applyOnEntity = function (obj, entity) {
        var meshRendererComponent = entity.meshRendererComponent;
        __touch(4818);
        if (!meshRendererComponent) {
            meshRendererComponent = new MeshRendererComponent();
            __touch(4820);
        }
        var matched = false;
        __touch(4819);
        if (obj instanceof Material) {
            meshRendererComponent.materials.push(obj);
            __touch(4821);
            matched = true;
            __touch(4822);
        }
        if (matched) {
            entity.setComponent(meshRendererComponent);
            __touch(4823);
            return true;
            __touch(4824);
        }
    };
    __touch(4788);
    return MeshRendererComponent;
    __touch(4789);
});
__touch(4781);