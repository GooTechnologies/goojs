define(['goo/math/Vector2'], function (Vector2) {
    'use strict';
    __touch(18530);
    function RenderTarget(width, height, options) {
        this.glTexture = null;
        __touch(18536);
        this._glRenderBuffer = null;
        __touch(18537);
        this._glFrameBuffer = null;
        __touch(18538);
        this.width = Math.floor(width);
        __touch(18539);
        this.height = Math.floor(height);
        __touch(18540);
        options = options || {};
        __touch(18541);
        this.wrapS = options.wrapS !== undefined ? options.wrapS : 'EdgeClamp';
        __touch(18542);
        this.wrapT = options.wrapT !== undefined ? options.wrapT : 'EdgeClamp';
        __touch(18543);
        this.magFilter = options.magFilter !== undefined ? options.magFilter : 'Bilinear';
        __touch(18544);
        this.minFilter = options.minFilter !== undefined ? options.minFilter : 'BilinearNoMipMaps';
        __touch(18545);
        this.anisotropy = options.anisotropy !== undefined ? options.anisotropy : 1;
        __touch(18546);
        this.format = options.format !== undefined ? options.format : 'RGBA';
        __touch(18547);
        this.type = options.type !== undefined ? options.type : 'UnsignedByte';
        __touch(18548);
        this.variant = '2D';
        __touch(18549);
        this.offset = new Vector2(0, 0);
        __touch(18550);
        this.repeat = new Vector2(1, 1);
        __touch(18551);
        this.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
        __touch(18552);
        this.premultiplyAlpha = options.premultiplyAlpha !== undefined ? options.premultiplyAlpha : false;
        __touch(18553);
        this.unpackAlignment = options.unpackAlignment !== undefined ? options.unpackAlignment : 1;
        __touch(18554);
        this.flipY = options.flipY !== undefined ? options.flipY : true;
        __touch(18555);
        this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
        __touch(18556);
        this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
        __touch(18557);
    }
    __touch(18531);
    RenderTarget.prototype.clone = function () {
        var tmp = new RenderTarget(this.width, this.height);
        __touch(18558);
        tmp.wrapS = this.wrapS;
        __touch(18559);
        tmp.wrapT = this.wrapT;
        __touch(18560);
        tmp.magFilter = this.magFilter;
        __touch(18561);
        tmp.minFilter = this.minFilter;
        __touch(18562);
        tmp.anisotropy = this.anisotropy;
        __touch(18563);
        tmp.format = this.format;
        __touch(18564);
        tmp.type = this.type;
        __touch(18565);
        tmp.variant = this.variant;
        __touch(18566);
        tmp.offset.copy(this.offset);
        __touch(18567);
        tmp.repeat.copy(this.repeat);
        __touch(18568);
        tmp.generateMipmaps = this.generateMipmaps;
        __touch(18569);
        tmp.premultiplyAlpha = this.premultiplyAlpha;
        __touch(18570);
        tmp.unpackAlignment = this.unpackAlignment;
        __touch(18571);
        tmp.flipY = this.flipY;
        __touch(18572);
        tmp.depthBuffer = this.depthBuffer;
        __touch(18573);
        tmp.stencilBuffer = this.stencilBuffer;
        __touch(18574);
        return tmp;
        __touch(18575);
    };
    __touch(18532);
    RenderTarget.prototype.getSizeInMemory = function () {
        var size = this.width * this.height * 4;
        __touch(18576);
        if (this.generateMipmaps) {
            size = Math.ceil(size * 4 / 3);
            __touch(18578);
        }
        return size;
        __touch(18577);
    };
    __touch(18533);
    RenderTarget.prototype.destroy = function (context) {
        if (this.glTexture) {
            context.deleteTexture(this.glTexture);
            __touch(18579);
            this.glTexture = null;
            __touch(18580);
        }
        if (this._glRenderBuffer) {
            context.deleteRenderbuffer(this._glRenderBuffer);
            __touch(18581);
            this._glRenderBuffer = null;
            __touch(18582);
        }
        if (this._glFrameBuffer) {
            context.deleteFramebuffer(this._glFrameBuffer);
            __touch(18583);
            this._glFrameBuffer = null;
            __touch(18584);
        }
    };
    __touch(18534);
    return RenderTarget;
    __touch(18535);
});
__touch(18529);