define([
    'goo/entities/systems/System',
    'goo/entities/SystemBus',
    'goo/renderer/SimplePartitioner',
    'goo/renderer/MeshData',
    'goo/renderer/Material',
    'goo/renderer/Shader',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/Util',
    'goo/math/Transform',
    'goo/shapes/Grid',
    'goo/shapes/Quad'
], function (System, SystemBus, SimplePartitioner, MeshData, Material, Shader, ShaderLib, Util, Transform, Grid, Quad) {
    'use strict';
    __touch(5357);
    function GridRenderSystem() {
        System.call(this, 'GridRenderSystem', []);
        __touch(5366);
        this.renderList = [];
        __touch(5367);
        this.doRender = {
            grid: true,
            surface: true
        };
        __touch(5368);
        this.camera = null;
        __touch(5369);
        this.lights = [];
        __touch(5370);
        this.transform = new Transform();
        __touch(5371);
        this.transform.rotation.rotateX(-Math.PI / 2);
        __touch(5372);
        this.transform.scale.setd(1000, 1000, 1000);
        __touch(5373);
        this.transform.update();
        __touch(5374);
        var gridMaterial = new Material(gridShaderDef, 'Grid Material');
        __touch(5375);
        gridMaterial.depthState.write = true;
        __touch(5376);
        gridMaterial.depthState.enabled = true;
        __touch(5377);
        this.grid = {
            meshData: new Grid(100, 100),
            materials: [gridMaterial],
            transform: this.transform
        };
        __touch(5378);
        var surfaceShader = Util.clone(ShaderLib.simpleColored);
        __touch(5379);
        var surfaceMaterial = new Material(surfaceShader, 'Surface Material');
        __touch(5380);
        surfaceMaterial.uniforms.color = [
            0.4,
            0.4,
            0.4
        ];
        __touch(5381);
        surfaceMaterial.uniforms.opacity = 0.9;
        __touch(5382);
        surfaceMaterial.blendState.blending = 'CustomBlending';
        __touch(5383);
        surfaceMaterial.cullState.enabled = false;
        __touch(5384);
        surfaceMaterial.depthState.write = true;
        __touch(5385);
        surfaceMaterial.depthState.enabled = true;
        __touch(5386);
        surfaceMaterial.offsetState.enabled = true;
        __touch(5387);
        surfaceMaterial.offsetState.units = 10;
        __touch(5388);
        surfaceMaterial.offsetState.factor = 0.8;
        __touch(5389);
        this.surface = {
            meshData: new Quad(),
            materials: [surfaceMaterial],
            transform: this.transform
        };
        __touch(5390);
        var that = this;
        __touch(5391);
        SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
            that.camera = newCam.camera;
            __touch(5394);
        });
        __touch(5392);
        SystemBus.addListener('goo.setLights', function (lights) {
            that.lights = lights;
            __touch(5395);
        });
        __touch(5393);
    }
    __touch(5358);
    GridRenderSystem.prototype = Object.create(System.prototype);
    __touch(5359);
    GridRenderSystem.prototype.inserted = function () {
    };
    __touch(5360);
    GridRenderSystem.prototype.deleted = function () {
    };
    __touch(5361);
    GridRenderSystem.prototype.process = function () {
        var count = this.renderList.length = 0;
        __touch(5396);
        if (this.doRender.surface) {
            this.renderList[count++] = this.surface;
            __touch(5398);
        }
        if (this.doRender.grid) {
            this.renderList[count++] = this.grid;
            __touch(5399);
        }
        this.renderList.length = count;
        __touch(5397);
    };
    __touch(5362);
    GridRenderSystem.prototype.render = function (renderer) {
        renderer.checkResize(this.camera);
        __touch(5400);
        if (this.camera) {
            renderer.render(this.renderList, this.camera, this.lights, null, false);
            __touch(5401);
        }
    };
    __touch(5363);
    var gridShaderDef = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            color: [
                0.55,
                0.55,
                0.55,
                1
            ],
            fogOn: false,
            fogColor: [
                0.1,
                0.1,
                0.1,
                1
            ],
            fogNear: Shader.NEAR_PLANE,
            fogFar: Shader.FAR_PLANE
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 worldMatrix;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'varying float depth;',
            'void main(void)',
            '{',
            'vec4 viewPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            'depth = viewPosition.z;',
            'gl_Position = projectionMatrix * viewPosition;',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform vec4 fogColor;',
            'uniform vec4 color;',
            'uniform float fogNear;',
            'uniform float fogFar;',
            'uniform bool fogOn;',
            'varying float depth;',
            'void main(void)',
            '{',
            'if (fogOn) {',
            'float lerpVal = clamp(depth / (-fogFar + fogNear), 0.0, 1.0);',
            'lerpVal = pow(lerpVal, 1.5);',
            'gl_FragColor = mix(color, fogColor, lerpVal);',
            '} else {',
            'gl_FragColor = color;',
            '}',
            '}'
        ].join('\n')
    };
    __touch(5364);
    return GridRenderSystem;
    __touch(5365);
});
__touch(5356);