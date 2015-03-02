define(function () {
    'use strict';
    __touch(17141);
    function RendererRecord() {
        this.currentBuffer = {
            'ArrayBuffer': {
                buffer: null,
                valid: false
            },
            'ElementArrayBuffer': {
                buffer: null,
                valid: false
            }
        };
        __touch(17145);
        this.currentFrameBuffer = null;
        __touch(17146);
        this.clippingTestValid = false;
        __touch(17147);
        this.clippingTestEnabled = false;
        __touch(17148);
        this.clips = [];
        __touch(17149);
        this.enabledTextures = 0;
        __touch(17150);
        this.texturesValid = false;
        __touch(17151);
        this.currentTextureArraysUnit = 0;
        __touch(17152);
        this.textureRecord = [];
        __touch(17153);
        this.usedProgram = null;
        __touch(17154);
        this.boundAttributes = [];
        __touch(17155);
        this.enabledAttributes = [];
        __touch(17156);
        this.newlyEnabledAttributes = [];
        __touch(17157);
        this.depthRecord = {};
        __touch(17158);
        this.cullRecord = {};
        __touch(17159);
        this.blendRecord = {};
        __touch(17160);
        this.offsetRecord = {};
        __touch(17161);
        this.lineRecord = {};
        __touch(17162);
        this.pointRecord = {};
        __touch(17163);
        this.shaderCache = {};
        __touch(17164);
    }
    __touch(17142);
    RendererRecord.prototype.invalidateBuffer = function (target) {
        this.currentBuffer[target].buffer = null;
        __touch(17165);
        this.currentBuffer[target].valid = false;
        __touch(17166);
    };
    __touch(17143);
    return RendererRecord;
    __touch(17144);
});
__touch(17140);