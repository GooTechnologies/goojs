define([
    'goo/shapes/Box',
    'goo/shapes/Sphere',
    'goo/renderer/MeshData',
    'goo/renderer/Material',
    'goo/renderer/Shader',
    'goo/renderer/TextureCreator',
    'goo/math/Transform'
], function (Box, Sphere, MeshData, Material, Shader, TextureCreator, Transform) {
    'use strict';
    __touch(22315);
    function Skybox(type, images, textureMode, yRotation) {
        var texture;
        __touch(22323);
        if (type === Skybox.SPHERE) {
            this.meshData = new Sphere(48, 48, 1, textureMode || Sphere.TextureModes.Projected);
            __touch(22335);
            if (images instanceof Array) {
                images = images[0];
                __touch(22336);
            }
            if (images) {
                texture = new TextureCreator().loadTexture2D(images);
                __touch(22337);
            }
        } else if (type === Skybox.BOX) {
            this.meshData = new Box(1, 1, 1);
            __touch(22338);
            if (images.length) {
                texture = new TextureCreator().loadTextureCube(images, { flipY: false });
                __touch(22339);
            }
        } else {
            throw new Error('Unknown geometry type');
            __touch(22340);
        }
        var material = new Material(shaders[type], 'Skybox material');
        __touch(22324);
        material.setTexture(Shader.DIFFUSE_MAP, texture);
        __touch(22325);
        material.cullState.cullFace = 'Front';
        __touch(22326);
        material.depthState.enabled = false;
        __touch(22327);
        material.renderQueue = 1;
        __touch(22328);
        this.materials = [material];
        __touch(22329);
        this.transform = new Transform();
        __touch(22330);
        var xAngle = type === Skybox.SPHERE ? Math.PI / 2 : 0;
        __touch(22331);
        this.transform.rotation.fromAngles(xAngle, yRotation, 0);
        __touch(22332);
        this.transform.update();
        __touch(22333);
        this.active = true;
        __touch(22334);
    }
    __touch(22316);
    Skybox.SPHERE = 'sphere';
    __touch(22317);
    Skybox.BOX = 'box';
    __touch(22318);
    var shaders = {};
    __touch(22319);
    shaders.box = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraPosition: Shader.CAMERA,
            near: Shader.NEAR_PLANE,
            diffuseMap: Shader.DIFFUSE_MAP
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform float near;',
            'varying vec3 eyeVec;',
            'void main(void) {',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition * near * 10.0, 1.0);',
            ' worldPos += vec4(cameraPosition, 0.0);',
            '\tgl_Position = projectionMatrix * viewMatrix * worldPos;',
            '\teyeVec = worldPos.xyz - cameraPosition;',
            ' eyeVec.x = -eyeVec.x;',
            ' eyeVec = (worldMatrix * vec4(eyeVec, 0.0)).xyz;',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform samplerCube diffuseMap;',
            'varying vec3 eyeVec;',
            'void main(void)',
            '{',
            '\tvec4 cube = textureCube(diffuseMap, eyeVec);',
            ' if (cube.a < 0.05) discard;',
            '\tgl_FragColor = cube;',
            '}'
        ].join('\n')
    };
    __touch(22320);
    shaders.sphere = {
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexUV0: MeshData.TEXCOORD0
        },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            cameraPosition: Shader.CAMERA,
            near: Shader.NEAR_PLANE,
            diffuseMap: Shader.DIFFUSE_MAP
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec2 vertexUV0;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform float near;',
            'varying vec2 texCoord0;',
            'varying vec3 eyeVec;',
            'void main(void) {',
            '\ttexCoord0 = vertexUV0;',
            '\tvec4 worldPos = worldMatrix * vec4(vertexPosition * near * 10.0, 1.0);',
            ' worldPos += vec4(cameraPosition, 0.0);',
            '\tgl_Position = projectionMatrix * viewMatrix * worldPos;',
            '\teyeVec = cameraPosition - worldPos.xyz;',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform sampler2D diffuseMap;',
            'varying vec2 texCoord0;',
            'void main(void)',
            '{',
            ' vec4 sphere = texture2D(diffuseMap, texCoord0);',
            ' if (sphere.a < 0.05) discard;',
            '\tgl_FragColor = sphere;',
            '}'
        ].join('\n')
    };
    __touch(22321);
    return Skybox;
    __touch(22322);
});
__touch(22314);