define([
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/pass/FullscreenPass',
    'goo/renderer/shaders/ShaderLib',
    'goo/entities/SystemBus'
], function (RenderTarget, FullscreenPass, ShaderLib, SystemBus) {
    'use strict';
    __touch(18394);
    var WebGLRenderingContext = window.WebGLRenderingContext;
    __touch(18395);
    function Composer(renderTarget) {
        this._passedWriteBuffer = !!renderTarget;
        __touch(18406);
        this.writeBuffer = renderTarget;
        __touch(18407);
        if (this.writeBuffer === undefined) {
            var width = window.innerWidth || 1;
            __touch(18416);
            var height = window.innerHeight || 1;
            __touch(18417);
            this.writeBuffer = new RenderTarget(width, height);
            __touch(18418);
        }
        this.readBuffer = this.writeBuffer.clone();
        __touch(18408);
        this.passes = [];
        __touch(18409);
        this._clearColor = [
            0,
            0,
            0,
            1
        ];
        __touch(18410);
        this.copyPass = new FullscreenPass(ShaderLib.copy);
        __touch(18411);
        this.size = null;
        __touch(18412);
        this.dirty = false;
        __touch(18413);
        this._viewportResizeHandler = function (size) {
            this.dirty = true;
            __touch(18419);
            this.size = size;
            __touch(18420);
        }.bind(this);
        __touch(18414);
        SystemBus.addListener('goo.viewportResize', this._viewportResizeHandler, true);
        __touch(18415);
    }
    __touch(18396);
    Composer.prototype.destroy = function (renderer) {
        this.deallocateBuffers(renderer);
        __touch(18421);
        for (var i = 0; i < this.passes.length; i++) {
            var pass = this.passes[i];
            __touch(18423);
            pass.destroy(renderer);
            __touch(18424);
        }
        SystemBus.removeListener('goo.viewportResize', this._viewportResizeHandler);
        __touch(18422);
    };
    __touch(18397);
    Composer.prototype.deallocateBuffers = function (renderer) {
        if (this.writeBuffer && !this._passedWriteBuffer) {
            this.writeBuffer.destroy(renderer.context);
            __touch(18426);
        }
        if (this.readBuffer) {
            this.readBuffer.destroy(renderer.context);
            __touch(18427);
        }
        this.copyPass.destroy(renderer);
        __touch(18425);
    };
    __touch(18398);
    Composer.prototype.swapBuffers = function () {
        var tmp = this.readBuffer;
        __touch(18428);
        this.readBuffer = this.writeBuffer;
        __touch(18429);
        this.writeBuffer = tmp;
        __touch(18430);
    };
    __touch(18399);
    Composer.prototype._checkPassResize = function (pass, size) {
        if (!pass.viewportSize || pass.viewportSize.x !== size.x || pass.viewportSize.y !== size.y || pass.viewportSize.width !== size.width || pass.viewportSize.height !== size.height) {
            return true;
            __touch(18432);
        }
        return false;
        __touch(18431);
    };
    __touch(18400);
    Composer.prototype.addPass = function (pass, renderer) {
        this.passes.push(pass);
        __touch(18433);
        if (pass.updateSize && this.size && this._checkPassResize(pass, this.size)) {
            pass.updateSize(this.size, renderer);
            __touch(18434);
            pass.viewportSize = this.size;
            __touch(18435);
        }
    };
    __touch(18401);
    Composer.prototype.setClearColor = function (color) {
        this._clearColor[0] = color[0];
        __touch(18436);
        this._clearColor[1] = color[1];
        __touch(18437);
        this._clearColor[2] = color[2];
        __touch(18438);
        this._clearColor[3] = color[3];
        __touch(18439);
    };
    __touch(18402);
    Composer.prototype.updateSize = function (renderer) {
        var size = this.size;
        __touch(18440);
        if (!size) {
            return;
            __touch(18446);
        }
        var width = size.width;
        __touch(18441);
        var height = size.height;
        __touch(18442);
        this.deallocateBuffers(renderer);
        __touch(18443);
        this.writeBuffer = new RenderTarget(width, height);
        __touch(18444);
        this.readBuffer = this.writeBuffer.clone();
        __touch(18445);
        for (var i = 0, il = this.passes.length; i < il; i++) {
            var pass = this.passes[i];
            __touch(18447);
            if (pass.updateSize && this._checkPassResize(pass, size)) {
                pass.updateSize(size, renderer);
                __touch(18448);
                pass.viewportSize = size;
                __touch(18449);
            }
        }
    };
    __touch(18403);
    Composer.prototype.render = function (renderer, delta, camera, lights) {
        if (this.dirty) {
            this.updateSize(renderer);
            __touch(18452);
            this.dirty = false;
            __touch(18453);
        }
        var maskActive = false;
        __touch(18450);
        var pass, i, il = this.passes.length;
        __touch(18451);
        for (i = 0; i < il; i++) {
            pass = this.passes[i];
            __touch(18454);
            if (!pass.enabled) {
                continue;
                __touch(18456);
            }
            pass.render(renderer, this.writeBuffer, this.readBuffer, delta, maskActive, camera, lights, this._clearColor);
            __touch(18455);
            if (pass.needsSwap) {
                if (maskActive) {
                    var context = this.renderer.context;
                    __touch(18458);
                    context.stencilFunc(WebGLRenderingContext.NOTEQUAL, 1, 4294967295);
                    __touch(18459);
                    this.copyPass.render(renderer, this.writeBuffer, this.readBuffer, delta, camera, lights);
                    __touch(18460);
                    context.stencilFunc(WebGLRenderingContext.EQUAL, 1, 4294967295);
                    __touch(18461);
                }
                this.swapBuffers();
                __touch(18457);
            }
        }
    };
    __touch(18404);
    return Composer;
    __touch(18405);
});
__touch(18393);