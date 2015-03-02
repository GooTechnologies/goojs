define([
    'goo/entities/components/Component',
    'goo/renderer/pass/RenderTarget'
], function (Component, RenderTarget) {
    'use strict';
    __touch(4879);
    function PortalComponent(camera, height, options, overrideMaterial) {
        height = height || 200;
        __touch(4884);
        this.options = options || {};
        __touch(4885);
        this.options.preciseRecursion = !!this.options.preciseRecursion;
        __touch(4886);
        this.options.autoUpdate = this.options.autoUpdate !== false;
        __touch(4887);
        this.options.alwaysRender = !!this.options.alwaysRender;
        __touch(4888);
        this.overrideMaterial = overrideMaterial;
        __touch(4889);
        this.doUpdate = true;
        __touch(4890);
        var aspect = camera.aspect;
        __touch(4891);
        this.type = 'PortalComponent';
        __touch(4892);
        this.camera = camera;
        __touch(4893);
        this.target = new RenderTarget(height, height / aspect);
        __touch(4894);
        if (this.options.preciseRecursion) {
            this.secondaryTarget = new RenderTarget(height, height / aspect);
            __touch(4895);
        }
    }
    __touch(4880);
    PortalComponent.prototype = Object.create(Component.prototype);
    __touch(4881);
    PortalComponent.prototype.requestUpdate = function () {
        this.doUpdate = true;
        __touch(4896);
    };
    __touch(4882);
    return PortalComponent;
    __touch(4883);
});
__touch(4878);