define([
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/Camera',
    'goo/math/Plane',
    'goo/renderer/pass/RenderTarget',
    'goo/renderer/pass/FullscreenPass',
    'goo/math/Vector3',
    'goo/renderer/Material',
    'goo/renderer/TextureCreator',
    'goo/renderer/shaders/ShaderLib',
    'goo/renderer/shaders/ShaderFragment'
], function (MeshData, Shader, Camera, Plane, RenderTarget, FullscreenPass, Vector3, Material, TextureCreator, ShaderLib, ShaderFragment) {
    'use strict';
    __touch(1996);
    function ProjectedGridWaterRenderer(settings) {
        this.waterCamera = new Camera(45, 1, 0.1, 2000);
        __touch(2005);
        this.renderList = [];
        __touch(2006);
        this.waterPlane = new Plane();
        __touch(2007);
        settings = settings || {};
        __touch(2008);
        var width = window.innerWidth / (settings.divider || 4);
        __touch(2009);
        var height = window.innerHeight / (settings.divider || 4);
        __touch(2010);
        this.renderTarget = new RenderTarget(width, height);
        __touch(2011);
        width = window.innerWidth / (settings.divider || 1);
        __touch(2012);
        height = window.innerHeight / (settings.divider || 1);
        __touch(2013);
        this.heightTarget = new RenderTarget(width, height, { type: 'Float' });
        __touch(2014);
        this.normalTarget = new RenderTarget(width, height, {});
        __touch(2015);
        this.fullscreenPass = new FullscreenPass(ShaderLib.normalmap);
        __touch(2016);
        this.fullscreenPass.material.shader.uniforms.resolution = [
            width,
            height
        ];
        __touch(2017);
        var waterMaterial = this.waterMaterial = new Material(waterShaderDef, 'WaterMaterial');
        __touch(2018);
        waterMaterial.cullState.enabled = false;
        __touch(2019);
        waterMaterial.setTexture('NORMAL_MAP', new TextureCreator().loadTexture2D('../resources/water/waternormals3.png'));
        __touch(2020);
        waterMaterial.setTexture('REFLECTION_MAP', this.renderTarget);
        __touch(2021);
        waterMaterial.setTexture('BUMP_MAP', this.heightTarget);
        __touch(2022);
        waterMaterial.setTexture('NORMAL_MAP_COARSE', this.normalTarget);
        __touch(2023);
        var materialWire = this.materialWire = new Material(ShaderLib.simple, 'mat');
        __touch(2024);
        materialWire.wireframe = true;
        __touch(2025);
        materialWire.wireframeColor = [
            0,
            0,
            0
        ];
        __touch(2026);
        this.calcVect = new Vector3();
        __touch(2027);
        this.camReflectDir = new Vector3();
        __touch(2028);
        this.camReflectUp = new Vector3();
        __touch(2029);
        this.camReflectLeft = new Vector3();
        __touch(2030);
        this.camLocation = new Vector3();
        __touch(2031);
        this.camReflectPos = new Vector3();
        __touch(2032);
        this.waterEntity = null;
        __touch(2033);
        var projData = this.projData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 4, 6);
        __touch(2034);
        projData.getAttributeBuffer(MeshData.POSITION).set([
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            1,
            0,
            0,
            1,
            0
        ]);
        __touch(2035);
        projData.getIndexBuffer().set([
            1,
            3,
            0,
            2,
            3,
            1
        ]);
        __touch(2036);
        var materialProj = new Material(projShaderDef, 'mat');
        __touch(2037);
        this.projRenderable = {
            meshData: projData,
            materials: [materialProj]
        };
        __touch(2038);
    }
    __touch(1997);
    ProjectedGridWaterRenderer.prototype.updateHelper = function (intersectBottomLeft, intersectBottomRight, intersectTopRight, intersectTopLeft) {
        var vbuf = this.projData.getAttributeBuffer(MeshData.POSITION);
        __touch(2039);
        vbuf[0] = intersectBottomLeft.x / intersectBottomLeft.w;
        __touch(2040);
        vbuf[1] = 0;
        __touch(2041);
        vbuf[2] = intersectBottomLeft.z / intersectBottomLeft.w;
        __touch(2042);
        vbuf[3] = intersectBottomRight.x / intersectBottomRight.w;
        __touch(2043);
        vbuf[4] = 0;
        __touch(2044);
        vbuf[5] = intersectBottomRight.z / intersectBottomRight.w;
        __touch(2045);
        vbuf[6] = intersectTopRight.x / intersectTopRight.w;
        __touch(2046);
        vbuf[7] = 0;
        __touch(2047);
        vbuf[8] = intersectTopRight.z / intersectTopRight.w;
        __touch(2048);
        vbuf[9] = intersectTopLeft.x / intersectTopLeft.w;
        __touch(2049);
        vbuf[10] = 0;
        __touch(2050);
        vbuf[11] = intersectTopLeft.z / intersectTopLeft.w;
        __touch(2051);
        this.projData.setVertexDataUpdated();
        __touch(2052);
    };
    __touch(1998);
    ProjectedGridWaterRenderer.prototype.process = function (renderer, entities, partitioner, camera, lights) {
        var meshData = this.waterEntity.meshDataComponent.meshData;
        __touch(2053);
        meshData.update(camera);
        __touch(2054);
        this.waterMaterial.shader.uniforms.intersectBottomLeft = [
            meshData.intersectBottomLeft.x,
            meshData.intersectBottomLeft.y,
            meshData.intersectBottomLeft.z,
            meshData.intersectBottomLeft.w
        ];
        __touch(2055);
        this.waterMaterial.shader.uniforms.intersectBottomRight = [
            meshData.intersectBottomRight.x,
            meshData.intersectBottomRight.y,
            meshData.intersectBottomRight.z,
            meshData.intersectBottomRight.w
        ];
        __touch(2056);
        this.waterMaterial.shader.uniforms.intersectTopLeft = [
            meshData.intersectTopLeft.x,
            meshData.intersectTopLeft.y,
            meshData.intersectTopLeft.z,
            meshData.intersectTopLeft.w
        ];
        __touch(2057);
        this.waterMaterial.shader.uniforms.intersectTopRight = [
            meshData.intersectTopRight.x,
            meshData.intersectTopRight.y,
            meshData.intersectTopRight.z,
            meshData.intersectTopRight.w
        ];
        __touch(2058);
        this.updateHelper(meshData.intersectBottomLeft, meshData.intersectBottomRight, meshData.intersectTopRight, meshData.intersectTopLeft);
        __touch(2059);
        renderer.render(this.projRenderable, camera, lights, this.heightTarget, true);
        __touch(2060);
        this.fullscreenPass.render(renderer, this.normalTarget, this.heightTarget, 0);
        __touch(2061);
        var waterPlane = this.waterPlane;
        __touch(2062);
        this.waterCamera.copy(camera);
        __touch(2063);
        waterPlane.constant = this.waterEntity.transformComponent.transform.translation.y;
        __touch(2064);
        var aboveWater = camera.translation.y > waterPlane.constant;
        __touch(2065);
        if (aboveWater) {
            var calcVect = this.calcVect;
            __touch(2072);
            var camReflectDir = this.camReflectDir;
            __touch(2073);
            var camReflectUp = this.camReflectUp;
            __touch(2074);
            var camReflectLeft = this.camReflectLeft;
            __touch(2075);
            var camLocation = this.camLocation;
            __touch(2076);
            var camReflectPos = this.camReflectPos;
            __touch(2077);
            camLocation.set(camera.translation);
            __touch(2078);
            var planeDistance = waterPlane.pseudoDistance(camLocation);
            __touch(2079);
            calcVect.set(waterPlane.normal).mul(planeDistance * 2);
            __touch(2080);
            camReflectPos.set(camLocation.sub(calcVect));
            __touch(2081);
            camLocation.set(camera.translation).add(camera._direction);
            __touch(2082);
            planeDistance = waterPlane.pseudoDistance(camLocation);
            __touch(2083);
            calcVect.set(waterPlane.normal).mul(planeDistance * 2);
            __touch(2084);
            camReflectDir.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();
            __touch(2085);
            camLocation.set(camera.translation).add(camera._up);
            __touch(2086);
            planeDistance = waterPlane.pseudoDistance(camLocation);
            __touch(2087);
            calcVect.set(waterPlane.normal).mul(planeDistance * 2);
            __touch(2088);
            camReflectUp.set(camLocation.sub(calcVect)).sub(camReflectPos).normalize();
            __touch(2089);
            camReflectLeft.set(camReflectUp).cross(camReflectDir).normalize();
            __touch(2090);
            this.waterCamera.translation.set(camReflectPos);
            __touch(2091);
            this.waterCamera._direction.set(camReflectDir);
            __touch(2092);
            this.waterCamera._up.set(camReflectUp);
            __touch(2093);
            this.waterCamera._left.set(camReflectLeft);
            __touch(2094);
            this.waterCamera.normalize();
            __touch(2095);
            this.waterCamera.update();
            __touch(2096);
            if (this.skybox) {
                var target = this.skybox.transformComponent.worldTransform;
                __touch(2097);
                target.translation.setv(camReflectPos);
                __touch(2098);
                target.update();
                __touch(2099);
            }
        }
        this.waterMaterial.shader.uniforms.abovewater = aboveWater;
        __touch(2066);
        this.waterEntity.skip = true;
        __touch(2067);
        this.renderList.length = 0;
        __touch(2068);
        partitioner.process(this.waterCamera, entities, this.renderList);
        __touch(2069);
        renderer.render(this.renderList, this.waterCamera, lights, this.renderTarget, true);
        __touch(2070);
        this.waterEntity.skip = false;
        __touch(2071);
        if (aboveWater && this.skybox) {
            var source = camera.translation;
            __touch(2100);
            var target = this.skybox.transformComponent.worldTransform;
            __touch(2101);
            target.translation.setv(source);
            __touch(2102);
            target.update();
            __touch(2103);
        }
    };
    __touch(1999);
    ProjectedGridWaterRenderer.prototype.setSkyBox = function (skyboxEntity) {
        this.skybox = skyboxEntity;
        __touch(2104);
    };
    __touch(2000);
    ProjectedGridWaterRenderer.prototype.setWaterEntity = function (entity) {
        this.waterEntity = entity;
        __touch(2105);
        this.waterEntity.meshRendererComponent.cullMode = 'Never';
        __touch(2106);
        this.waterEntity.meshRendererComponent.materials[0] = this.waterMaterial;
        __touch(2107);
        var meshData = this.waterEntity.meshDataComponent.meshData;
        __touch(2108);
        this.waterMaterial.shader.uniforms.density = [
            meshData.densityX,
            meshData.densityY
        ];
        __touch(2109);
    };
    __touch(2001);
    var waterShaderDef = {
        attributes: { vertexUV0: MeshData.TEXCOORD0 },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            normalMatrix: Shader.NORMAL_MATRIX,
            cameraPosition: Shader.CAMERA,
            normalMap: 'NORMAL_MAP',
            reflection: 'REFLECTION_MAP',
            bump: 'BUMP_MAP',
            normalMapCoarse: 'NORMAL_MAP_COARSE',
            vertexNormal: [
                0,
                -1,
                0
            ],
            vertexTangent: [
                1,
                0,
                0,
                1
            ],
            waterColor: [
                15,
                15,
                15
            ],
            abovewater: true,
            fogColor: [
                1,
                1,
                1,
                1
            ],
            sunDirection: [
                0.66,
                -0.1,
                0.66
            ],
            coarseStrength: 0.25,
            detailStrength: 2,
            fogStart: 0,
            camNear: Shader.NEAR_PLANE,
            camFar: Shader.FAR_PLANE,
            time: Shader.TIME,
            intersectBottomLeft: [
                0,
                0,
                0,
                0
            ],
            intersectTopLeft: [
                0,
                0,
                0,
                0
            ],
            intersectTopRight: [
                0,
                0,
                0,
                0
            ],
            intersectBottomRight: [
                0,
                0,
                0,
                0
            ],
            grid: false,
            heightMultiplier: 50,
            density: [
                1,
                1
            ]
        },
        vshader: [
            'attribute vec2 vertexUV0;',
            'uniform vec3 vertexNormal;',
            'uniform vec4 vertexTangent;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform mat4 normalMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform float time;',
            'uniform vec3 sunDirection;',
            'uniform float coarseStrength;',
            'uniform float heightMultiplier;',
            'uniform sampler2D bump;',
            'uniform vec4 intersectBottomLeft;',
            'uniform vec4 intersectTopLeft;',
            'uniform vec4 intersectTopRight;',
            'uniform vec4 intersectBottomRight;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'varying vec3 eyeVec;',
            'varying vec3 sunDir;',
            'varying vec4 viewCoords;',
            'varying vec3 worldPos;',
            'varying vec3 normal;',
            'void main(void) {',
            '\tvec4 pointTop = mix(intersectTopLeft, intersectTopRight, vertexUV0.x);',
            '\tvec4 pointBottom = mix(intersectBottomLeft, intersectBottomRight, vertexUV0.x);',
            '\tvec4 pointFinal = mix(pointTop, pointBottom, 1.0 - vertexUV0.y);',
            '\tpointFinal.xz /= pointFinal.w;',
            '\tpointFinal.y = 0.0;',
            '\tvec4 screenpos = projectionMatrix * viewMatrix * worldMatrix * vec4(pointFinal.xyz, 1.0);',
            '\tvec2 projCoord = screenpos.xy / screenpos.q;',
            '\tprojCoord = (projCoord + 1.0) * 0.5;',
            '\tfloat height = texture2D(bump, projCoord).x;',
            '\tpointFinal.y = height * heightMultiplier;',
            '\ttexCoord1 = vertexUV0;',
            '\tvec4 pos = worldMatrix * vec4(pointFinal.xyz, 1.0);',
            '\tworldPos = pos.xyz;',
            '\ttexCoord0 = worldPos.xz * 2.0;',
            '\tvec3 n = normalize((normalMatrix * vec4(vertexNormal, 0.0)).xyz);',
            '\tvec3 t = normalize((normalMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);',
            '\tvec3 b = cross(n, t) * vertexTangent.w;',
            '\tmat3 rotMat = mat3(t, b, n);',
            '\tvec3 eyeDir = worldPos - cameraPosition;',
            '\teyeVec = eyeDir * rotMat;',
            '\tsunDir = sunDirection * rotMat;',
            '\tviewCoords = projectionMatrix * viewMatrix * pos;',
            '\tgl_Position = viewCoords;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D normalMap;',
            'uniform sampler2D reflection;',
            'uniform sampler2D normalMapCoarse;',
            'uniform vec3 waterColor;',
            'uniform bool abovewater;',
            'uniform vec4 fogColor;',
            'uniform float time;',
            'uniform bool grid;',
            'uniform vec2 density;',
            'uniform float camNear;',
            'uniform float camFar;',
            'uniform float fogStart;',
            'uniform float coarseStrength;',
            'uniform float detailStrength;',
            'varying vec2 texCoord0;',
            'varying vec2 texCoord1;',
            'varying vec3 eyeVec;',
            'varying vec3 sunDir;',
            'varying vec4 viewCoords;',
            'varying vec3 worldPos;',
            'varying vec3 normal;',
            'const vec3 sunColor = vec3(1.0, 0.96, 0.96);',
            'vec4 getNoise(vec2 uv) {',
            '    vec2 uv0 = (uv/123.0)+vec2(time/17.0, time/29.0);',
            '    vec2 uv1 = uv/127.0-vec2(time/-19.0, time/31.0);',
            '    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/51.0, time/47.0);',
            '    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/59.0, time/-63.0);',
            '    vec4 noise = (texture2D(normalMap, uv0)) +',
            '                 (texture2D(normalMap, uv1)) +',
            '                 (texture2D(normalMap, uv2)*3.0) +',
            '                 (texture2D(normalMap, uv3)*3.0);',
            '    return noise/4.0-1.0;',
            '}',
            'void main(void)',
            '{',
            '\tvec2 projCoord = viewCoords.xy / viewCoords.q;',
            '\tprojCoord = (projCoord + 1.0) * 0.5;',
            '\tfloat fs = camFar * fogStart;',
            '\tfloat fogDist = clamp(max(viewCoords.z - fs, 0.0)/(camFar - camNear - fs), 0.0, 1.0);',
            '\tvec3 coarseNormal = texture2D(normalMapCoarse, projCoord).xyz * 2.0 - 1.0;',
            '\tvec2 normCoords = texCoord0;',
            '\tvec4 noise = getNoise(normCoords);',
            '\tvec3 normalVector = normalize(noise.xyz * vec3(1.8 * detailStrength, 1.8 * detailStrength, 1.0) + coarseNormal.xyz * vec3(1.8 * coarseStrength, 1.8 * coarseStrength, 1.0));',
            '\tvec3 localView = normalize(eyeVec);',
            '\tfloat fresnel = dot(normalize(normalVector*vec3(1.0, 1.0, 1.0)), localView);',
            '\tif ( abovewater == false ) {',
            '\t\tfresnel = -fresnel;',
            '\t}',
            '\tfloat fresnelTerm = 1.0 - fresnel;',
            '\tfresnelTerm *= fresnelTerm;',
            '\tfresnelTerm *= fresnelTerm;',
            '\tfresnelTerm = fresnelTerm * 0.95 + 0.05;',
            '\tif ( abovewater == true ) {',
            '\t\tprojCoord.x = 1.0 - projCoord.x;',
            '\t}',
            '\tprojCoord += (normalVector.xy * 0.05);',
            '\tprojCoord = clamp(projCoord, 0.001, 0.999);',
            ' vec4 waterColorX = vec4(waterColor / 255.0, 1.0);',
            '\tvec4 reflectionColor = texture2D(reflection, projCoord);',
            '\tif ( abovewater == false ) {',
            '\t\treflectionColor *= vec4(0.8,0.9,1.0,1.0);',
            '\t\tvec4 endColor = mix(reflectionColor,waterColorX,fresnelTerm);',
            '\t\tgl_FragColor = mix(endColor,waterColorX,fogDist);',
            '\t}',
            '\telse {',
            '\t\tvec3 diffuse = vec3(0.0);',
            '\t\tvec3 specular = vec3(0.0);',
            '\t\tvec3 sunreflection = normalize(reflect(-sunDir, normalVector));',
            '\t\tfloat direction = max(0.0, dot(localView, sunreflection));',
            '\t\tspecular += pow(direction, 100.0)*sunColor * 2.0;',
            '\t\tdiffuse += max(dot(sunDir, normalVector),0.0)*sunColor*0.4;',
            '\t\tvec4 endColor = mix(waterColorX,reflectionColor,fresnelTerm);',
            '\t\tgl_FragColor = mix(vec4(diffuse*0.0 + specular, 1.0) + mix(endColor,reflectionColor,fogDist), fogColor, fogDist);',
            '\t}',
            '\tif (grid) {',
            '\t\tvec2 low = abs(fract(texCoord1*density)-0.5);',
            '\t\tfloat dist = 1.0 - step(min(low.x, low.y), 0.05);',
            '\t\tgl_FragColor *= vec4(dist);',
            '\t}',
            '}'
        ].join('\n')
    };
    __touch(2002);
    var projShaderDef = {
        attributes: { vertexPosition: MeshData.POSITION },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            time: Shader.TIME
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec4 worldPos;',
            'varying vec4 viewCoords;',
            'void main(void) {',
            '\tworldPos = worldMatrix * vec4(vertexPosition, 1.0);',
            '\tviewCoords = viewMatrix * worldPos;',
            '\tgl_Position = projectionMatrix * viewMatrix * worldPos;',
            '}'
        ].join('\n'),
        fshader: [
            'precision mediump float;',
            'uniform float time;',
            'varying vec4 worldPos;',
            'varying vec4 viewCoords;',
            ShaderFragment.noise3d,
            'vec4 getNoise(sampler2D map, vec2 uv) {',
            '    vec2 uv0 = (uv/223.0)+vec2(time/17.0, time/29.0);',
            '    vec2 uv1 = uv/327.0-vec2(time/-19.0, time/31.0);',
            '    vec2 uv2 = uv/vec2(697.0, 983.0)+vec2(time/151.0, time/147.0);',
            '    vec2 uv3 = uv/vec2(791.0, 877.0)-vec2(time/259.0, time/263.0);',
            '    vec4 noise = (texture2D(map, uv0)*0.0) +',
            '                 (texture2D(map, uv1)*0.0) +',
            '                 (texture2D(map, uv2)*0.0) +',
            '                 (texture2D(map, uv3)*10.0);',
            '    return noise/5.0-1.0;',
            '}',
            'void main(void)',
            '{',
            '\tfloat fogDist = clamp(-viewCoords.z / 1000.0, 0.0, 1.0);',
            '\tgl_FragColor = vec4((snoise(vec3(worldPos.xz * 0.008, time * 0.4))+snoise(vec3(worldPos.xz * 0.02, time * 0.8))*0.5)/10.0);',
            '}'
        ].join('\n')
    };
    __touch(2003);
    return ProjectedGridWaterRenderer;
    __touch(2004);
});
__touch(1995);