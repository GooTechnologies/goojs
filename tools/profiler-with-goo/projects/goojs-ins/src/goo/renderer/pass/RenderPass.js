define([
    'goo/renderer/Renderer',
    'goo/renderer/pass/Pass',
    'goo/math/Vector4'
], function (Renderer, Pass, Vector4) {
    'use strict';
    __touch(18502);
    function RenderPass(renderList, filter) {
        this.renderList = renderList;
        __touch(18508);
        this.filter = filter;
        __touch(18509);
        this.clearColor = new Vector4(0, 0, 0, 0);
        __touch(18510);
        this.oldClearColor = new Vector4();
        __touch(18511);
        this.renderToScreen = false;
        __touch(18512);
        this.overrideMaterial = null;
        __touch(18513);
        this.enabled = true;
        __touch(18514);
        this.clear = true;
        __touch(18515);
        this.needsSwap = false;
        __touch(18516);
    }
    __touch(18503);
    RenderPass.prototype = Object.create(Pass.prototype);
    __touch(18504);
    RenderPass.prototype.constructor = RenderPass;
    __touch(18505);
    RenderPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta, maskActive, camera, lights, clearColor) {
        camera = camera || Renderer.mainCamera;
        __touch(18517);
        if (!camera) {
            return;
            __touch(18520);
        }
        lights = lights || [];
        __touch(18518);
        if (clearColor && false) {
            this.oldClearColor.setv(renderer.clearColor);
            __touch(18521);
            renderer.setClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
            __touch(18522);
        }
        var renderList;
        __touch(18519);
        if (this.filter) {
            renderList = this.renderList.filter(this.filter);
            __touch(18523);
        } else {
            renderList = this.renderList;
            __touch(18524);
        }
        if (this.renderToScreen) {
            renderer.render(renderList, camera, lights, null, this.clear, this.overrideMaterial);
            __touch(18525);
        } else {
            renderer.render(renderList, camera, lights, readBuffer, this.clear, this.overrideMaterial);
            __touch(18526);
        }
        if (this.clearColor && false) {
            var oc = this.oldClearColor.data;
            __touch(18527);
            renderer.setClearColor(oc[0], oc[1], oc[2], oc[3]);
            __touch(18528);
        }
    };
    __touch(18506);
    return RenderPass;
    __touch(18507);
});
__touch(18501);