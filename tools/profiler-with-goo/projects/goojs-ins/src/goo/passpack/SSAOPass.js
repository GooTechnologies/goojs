define([
    'goo/renderer/Material',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/Util',
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderFragment',
    'goo/renderer/pass/RenderPass',
    'goo/renderer/pass/FullscreenPass',
    'goo/passpack/BlurPass',
    'goo/passpack/ShaderLibExtra',
    'goo/renderer/pass/Pass'
], function (Material, RenderTarget, Util, MeshData, Shader, ShaderFragment, RenderPass, FullscreenPass, BlurPass, ShaderLibExtra, Pass) {
    'use strict';
    __touch(15087);
    function SSAOPass(renderList) {
        this.depthPass = new RenderPass(renderList);
        __touch(15095);
        this.depthPass.clearColor.set(1, 1, 1, 1);
        __touch(15096);
        var packDepthMaterial = new Material(packDepth);
        __touch(15097);
        this.depthPass.overrideMaterial = packDepthMaterial;
        __touch(15098);
        this.downsampleAmount = 4;
        __touch(15099);
        var width = window.innerWidth || 1024;
        __touch(15100);
        var height = window.innerHeight || 1024;
        __touch(15101);
        this.updateSize({
            x: 0,
            y: 0,
            width: width,
            height: height
        });
        __touch(15102);
        this.enabled = true;
        __touch(15103);
        this.clear = false;
        __touch(15104);
        this.needsSwap = true;
        __touch(15105);
    }
    __touch(15088);
    SSAOPass.prototype = Object.create(Pass.prototype);
    __touch(15089);
    SSAOPass.prototype.constructor = SSAOPass;
    __touch(15090);
    SSAOPass.prototype.updateSize = function (size) {
        var width = Math.floor(size.width / this.downsampleAmount);
        __touch(15106);
        var height = Math.floor(size.height / this.downsampleAmount);
        __touch(15107);
        var shader = Util.clone(ShaderLibExtra.ssao);
        __touch(15108);
        shader.uniforms.size = [
            width,
            height
        ];
        __touch(15109);
        this.outPass = new FullscreenPass(shader);
        __touch(15110);
        this.outPass.useReadBuffer = false;
        __touch(15111);
        this.blurPass = new BlurPass({
            sizeX: width,
            sizeY: height
        });
        __touch(15112);
        this.depthTarget = new RenderTarget(width, height, {
            magFilter: 'NearestNeighbor',
            minFilter: 'NearestNeighborNoMipMaps'
        });
        __touch(15113);
        console.log('UPDATE SSAOPASS: ', width, height);
        __touch(15114);
    };
    __touch(15091);
    SSAOPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
        this.depthPass.render(renderer, null, this.depthTarget, delta);
        __touch(15115);
        this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
        __touch(15116);
        this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
        __touch(15117);
        this.outPass.render(renderer, writeBuffer, readBuffer, delta);
        __touch(15118);
    };
    __touch(15092);
    var packDepth = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'void main(void) {',
            '\tgl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            ShaderFragment.methods.packDepth,
            'void main(void) {',
            '\tgl_FragColor = packDepth(gl_FragCoord.z);',
            '}'
        ].join('\n')
    };
    __touch(15093);
    return SSAOPass;
    __touch(15094);
});
__touch(15086);