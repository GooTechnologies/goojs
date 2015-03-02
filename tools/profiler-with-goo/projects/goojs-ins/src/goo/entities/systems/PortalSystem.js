define(['goo/entities/systems/System'], function (System) {
    'use strict';
    __touch(5569);
    function PortalSystem(renderer, renderSystem) {
        System.call(this, 'PortalSystem', [
            'MeshRendererComponent',
            'MeshDataComponent',
            'PortalComponent'
        ]);
        __touch(5575);
        this.renderer = renderer;
        __touch(5576);
        this.renderSystem = renderSystem;
        __touch(5577);
        this.renderList = [];
        __touch(5578);
    }
    __touch(5570);
    PortalSystem.prototype = Object.create(System.prototype);
    __touch(5571);
    PortalSystem.prototype.process = function (entities) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            __touch(5579);
            var portalComponent = entity.portalComponent;
            __touch(5580);
            if (portalComponent.options.autoUpdate || portalComponent.doUpdate) {
                portalComponent.doUpdate = false;
                __touch(5581);
                var camera = portalComponent.camera;
                __touch(5582);
                var target = portalComponent.target;
                __touch(5583);
                var secondaryTarget = portalComponent.secondaryTarget;
                __touch(5584);
                var overrideMaterial = portalComponent.overrideMaterial;
                __touch(5585);
                if (portalComponent.alwaysRender || entity.isVisible) {
                    this.render(this.renderer, camera, target, overrideMaterial);
                    __touch(5586);
                    var material = entity.meshRendererComponent.materials[0];
                    __touch(5587);
                    material.setTexture('DIFFUSE_MAP', target);
                    __touch(5588);
                    if (portalComponent.options.preciseRecursion) {
                        var tmp = target;
                        __touch(5589);
                        portalComponent.target = secondaryTarget;
                        __touch(5590);
                        portalComponent.secondaryTarget = tmp;
                        __touch(5591);
                    }
                }
            }
        }
    };
    __touch(5572);
    PortalSystem.prototype.render = function (renderer, camera, target, overrideMaterial) {
        renderer.updateShadows(this.renderSystem.partitioner, this.renderSystem.entities, this.renderSystem.lights);
        __touch(5592);
        for (var i = 0; i < this.renderSystem.preRenderers.length; i++) {
            var preRenderer = this.renderSystem.preRenderers[i];
            __touch(5594);
            preRenderer.process(renderer, this.renderSystem.entities, this.renderSystem.partitioner, camera, this.renderSystem.lights);
            __touch(5595);
        }
        this.renderSystem.partitioner.process(camera, this.renderSystem.entities, this.renderList);
        __touch(5593);
        if (this.renderSystem.composers.length > 0) {
            for (var i = 0; i < this.renderSystem.composers.length; i++) {
                var composer = this.renderSystem.composers[i];
                __touch(5596);
                composer.render(renderer, this.renderSystem.currentTpf, camera, this.renderSystem.lights, null, true);
                __touch(5597);
            }
        } else {
            renderer.render(this.renderList, camera, this.renderSystem.lights, target, true, overrideMaterial);
            __touch(5598);
        }
    };
    __touch(5573);
    return PortalSystem;
    __touch(5574);
});
__touch(5568);