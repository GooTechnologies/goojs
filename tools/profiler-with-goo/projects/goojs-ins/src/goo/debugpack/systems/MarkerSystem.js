define([
    'goo/entities/systems/System',
    'goo/renderer/Material',
    'goo/renderer/shaders/ShaderLib',
    'goo/debugpack/components/MarkerComponent',
    'goo/renderer/Renderer',
    'goo/math/Transform'
], function (System, Material, ShaderLib, MarkerComponent, Renderer, Transform) {
    'use strict';
    __touch(3793);
    function MarkerSystem(goo) {
        System.call(this, 'MarkerSystem', ['MarkerComponent']);
        __touch(3798);
        this.material = new Material(ShaderLib.simpleColored);
        __touch(3799);
        this.material.depthState.enabled = false;
        __touch(3800);
        this.material.shader.uniforms.color = [
            0,
            1,
            0
        ];
        __touch(3801);
        this.goo = goo;
        __touch(3802);
        this.renderer = this.goo.renderer;
        __touch(3803);
        this.entities = [];
        __touch(3804);
        this.goo.callbacks.push(function () {
            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];
                __touch(3806);
                if (entity.hasComponent('MarkerComponent')) {
                    var transform = new Transform();
                    __touch(3807);
                    transform.copy(entity.transformComponent.worldTransform);
                    __touch(3808);
                    transform.setRotationXYZ(0, 0, 0);
                    __touch(3809);
                    transform.scale.setd(1, 1, 1);
                    __touch(3810);
                    transform.update();
                    __touch(3811);
                    var renderableMarker = {
                        meshData: entity.markerComponent.meshData,
                        materials: [this.material],
                        transform: transform
                    };
                    __touch(3812);
                    this.goo.renderer.render(renderableMarker, Renderer.mainCamera, [], null, false);
                    __touch(3813);
                }
            }
        }.bind(this));
        __touch(3805);
    }
    __touch(3794);
    MarkerSystem.prototype = Object.create(System.prototype);
    __touch(3795);
    MarkerSystem.prototype.process = function (entities) {
        this.entities = entities;
        __touch(3814);
    };
    __touch(3796);
    return MarkerSystem;
    __touch(3797);
});
__touch(3792);