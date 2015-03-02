define([
    'goo/renderer/MeshData',
    'goo/renderer/Shader',
    'goo/renderer/Camera',
    'goo/math/Plane',
    'goo/renderer/pass/RenderTarget',
    'goo/math/Vector3',
    'goo/math/Vector4',
    'goo/renderer/Material',
    'goo/renderer/Texture',
    'goo/renderer/TextureCreator',
    'goo/renderer/shaders/ShaderBuilder',
    'goo/renderer/shaders/ShaderFragment'
], function (MeshData, Shader, Camera, Plane, RenderTarget, Vector3, Vector4, Material, Texture, TextureCreator, ShaderBuilder, ShaderFragment) {
    'use strict';
    __touch(1731);
    function FlatWaterRenderer(settings) {
        settings = settings || {};
        __touch(1739);
        this.useRefraction = settings.useRefraction !== undefined ? settings.useRefraction : true;
        __touch(1740);
        this.waterCamera = new Camera(45, 1, 0.1, 2000);
        __touch(1741);
        this.renderList = [];
        __touch(1742);
        this.waterPlane = new Plane();
        __touch(1743);
        var width = Math.floor(window.innerWidth / (settings.divider || 2));
        __touch(1744);
        var height = Math.floor(window.innerHeight / (settings.divider || 2));
        __touch(1745);
        this.reflectionTarget = new RenderTarget(width, height);
        __touch(1746);
        if (this.useRefraction) {
            this.refractionTarget = new RenderTarget(width, height);
            __touch(1767);
            this.depthTarget = new RenderTarget(width, height);
            __touch(1768);
        }
        var waterMaterial = new Material(waterShaderDef, 'WaterMaterial');
        __touch(1747);
        waterMaterial.shader.defines.REFRACTION = this.useRefraction;
        __touch(1748);
        waterMaterial.cullState.enabled = false;
        __touch(1749);
        var texture = null;
        __touch(1750);
        if (settings.normalsTexture) {
            texture = settings.normalsTexture;
            __touch(1769);
        } else if (settings.normalsUrl) {
            var normalsTextureUrl = settings.normalsUrl || '../resources/water/waternormals3.png';
            __touch(1770);
            texture = new TextureCreator().loadTexture2D(normalsTextureUrl);
            __touch(1771);
        } else {
            var flatNormalData = new Uint8Array([
                127,
                127,
                255,
                255
            ]);
            __touch(1772);
            texture = new Texture(flatNormalData, null, 1, 1);
            __touch(1773);
        }
        waterMaterial.setTexture('NORMAL_MAP', texture);
        __touch(1751);
        waterMaterial.setTexture('REFLECTION_MAP', this.reflectionTarget);
        __touch(1752);
        this.waterMaterial = waterMaterial;
        __touch(1753);
        this.skybox = null;
        __touch(1754);
        this.followCam = true;
        __touch(1755);
        this.updateWaterPlaneFromEntity = settings.updateWaterPlaneFromEntity !== undefined ? this.updateWaterPlaneFromEntity : true;
        __touch(1756);
        this.calcVect = new Vector3();
        __touch(1757);
        this.camReflectDir = new Vector3();
        __touch(1758);
        this.camReflectUp = new Vector3();
        __touch(1759);
        this.camReflectLeft = new Vector3();
        __touch(1760);
        this.camLocation = new Vector3();
        __touch(1761);
        this.camReflectPos = new Vector3();
        __touch(1762);
        this.offset = new Vector3();
        __touch(1763);
        this.clipPlane = new Vector4();
        __touch(1764);
        this.waterEntity = null;
        __touch(1765);
        this.depthMaterial = new Material(packDepthY, 'depth');
        __touch(1766);
    }
    __touch(1732);
    FlatWaterRenderer.prototype.process = function (renderer, entities, partitioner, camera, lights) {
        if (!this.waterEntity) {
            return;
            __touch(1787);
        }
        entities = entities.filter(function (entity) {
            return entity.meshRendererComponent.isReflectable;
            __touch(1788);
        });
        __touch(1774);
        var waterPlane = this.waterPlane;
        __touch(1775);
        this.waterCamera.copy(camera);
        __touch(1776);
        if (this.updateWaterPlaneFromEntity) {
            waterPlane.constant = this.waterEntity.transformComponent.worldTransform.translation.y;
            __touch(1789);
        }
        var aboveWater = camera.translation.y > waterPlane.constant;
        __touch(1777);
        this.waterEntity.skip = true;
        __touch(1778);
        if (aboveWater) {
            if (this.useRefraction) {
                partitioner.process(this.waterCamera, entities, this.renderList);
                __touch(1815);
                this.clipPlane.setd(waterPlane.normal.x, -waterPlane.normal.y, waterPlane.normal.z, -waterPlane.constant);
                __touch(1816);
                this.waterCamera.setToObliqueMatrix(this.clipPlane);
                __touch(1817);
                this.depthMaterial.uniforms.waterHeight = waterPlane.constant;
                __touch(1818);
                renderer.render(this.renderList, this.waterCamera, lights, this.depthTarget, true, this.depthMaterial);
                __touch(1819);
                renderer.render(this.renderList, this.waterCamera, lights, this.refractionTarget, true);
                __touch(1820);
                if (!this.waterMaterial.getTexture('REFRACTION_MAP')) {
                    this.waterMaterial.setTexture('REFRACTION_MAP', this.refractionTarget);
                    __touch(1821);
                    this.waterMaterial.setTexture('DEPTH_MAP', this.depthTarget);
                    __touch(1822);
                }
            }
            var calcVect = this.calcVect;
            __touch(1790);
            var camReflectDir = this.camReflectDir;
            __touch(1791);
            var camReflectUp = this.camReflectUp;
            __touch(1792);
            var camReflectLeft = this.camReflectLeft;
            __touch(1793);
            var camLocation = this.camLocation;
            __touch(1794);
            var camReflectPos = this.camReflectPos;
            __touch(1795);
            camLocation.setv(camera.translation);
            __touch(1796);
            var planeDistance = waterPlane.pseudoDistance(camLocation) * 2;
            __touch(1797);
            calcVect.setv(waterPlane.normal).muld(planeDistance, planeDistance, planeDistance);
            __touch(1798);
            camReflectPos.setv(camLocation.subv(calcVect));
            __touch(1799);
            camLocation.setv(camera.translation).addv(camera._direction);
            __touch(1800);
            planeDistance = waterPlane.pseudoDistance(camLocation) * 2;
            __touch(1801);
            calcVect.setv(waterPlane.normal).muld(planeDistance, planeDistance, planeDistance);
            __touch(1802);
            camReflectDir.setv(camLocation.subv(calcVect)).subv(camReflectPos).normalize();
            __touch(1803);
            camLocation.setv(camera.translation).addv(camera._up);
            __touch(1804);
            planeDistance = waterPlane.pseudoDistance(camLocation) * 2;
            __touch(1805);
            calcVect.setv(waterPlane.normal).muld(planeDistance, planeDistance, planeDistance);
            __touch(1806);
            camReflectUp.setv(camLocation.subv(calcVect)).subv(camReflectPos).normalize();
            __touch(1807);
            camReflectLeft.setv(camReflectUp).cross(camReflectDir).normalize();
            __touch(1808);
            this.waterCamera.translation.setv(camReflectPos);
            __touch(1809);
            this.waterCamera._direction.setv(camReflectDir);
            __touch(1810);
            this.waterCamera._up.setv(camReflectUp);
            __touch(1811);
            this.waterCamera._left.setv(camReflectLeft);
            __touch(1812);
            this.waterCamera.normalize();
            __touch(1813);
            this.waterCamera.update();
            __touch(1814);
            if (this.skybox && this.followCam) {
                var target = this.skybox.transformComponent.worldTransform;
                __touch(1823);
                target.translation.setv(camReflectPos);
                __touch(1824);
                target.update();
                __touch(1825);
            }
        }
        this.waterMaterial.shader.uniforms.abovewater = aboveWater;
        __touch(1779);
        partitioner.process(this.waterCamera, entities, this.renderList);
        __touch(1780);
        renderer.setRenderTarget(this.reflectionTarget);
        __touch(1781);
        renderer.clear();
        __touch(1782);
        if (this.skybox) {
            if (this.skybox instanceof Array) {
                this.clipPlane.setd(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
                __touch(1826);
                this.waterCamera.setToObliqueMatrix(this.clipPlane, 10);
                __touch(1827);
                for (var i = 0; i < this.skybox.length; i++) {
                    renderer.render(this.skybox[i], this.waterCamera, lights, this.reflectionTarget, false);
                    __touch(1828);
                    this.skybox[i].skip = true;
                    __touch(1829);
                }
            } else {
                renderer.render(this.skybox, this.waterCamera, lights, this.reflectionTarget, false);
                __touch(1830);
                this.skybox.skip = true;
                __touch(1831);
            }
        }
        this.clipPlane.setd(waterPlane.normal.x, waterPlane.normal.y, waterPlane.normal.z, waterPlane.constant);
        __touch(1783);
        this.waterCamera.setToObliqueMatrix(this.clipPlane);
        __touch(1784);
        renderer.render(this.renderList, this.waterCamera, lights, this.reflectionTarget, false);
        __touch(1785);
        this.waterEntity.skip = false;
        __touch(1786);
        if (this.skybox) {
            if (this.skybox instanceof Array) {
                for (var i = 0; i < this.skybox.length; i++) {
                    this.skybox[i].skip = false;
                    __touch(1832);
                }
            } else {
                this.skybox.skip = false;
                __touch(1833);
            }
        }
        if (aboveWater && this.skybox && this.followCam) {
            var source = camera.translation;
            __touch(1834);
            var target = this.skybox.transformComponent.worldTransform;
            __touch(1835);
            target.translation.setv(source).addv(this.offset);
            __touch(1836);
            target.update();
            __touch(1837);
            this.waterCamera._updatePMatrix = true;
            __touch(1838);
        }
    };
    __touch(1733);
    FlatWaterRenderer.prototype.setSkyBox = function (skyboxEntity) {
        this.skybox = skyboxEntity;
        __touch(1839);
        if (skyboxEntity.meshRendererComponent) {
            this.skybox.meshRendererComponent.materials[0].depthState.enabled = false;
            __touch(1840);
            this.skybox.meshRendererComponent.materials[0].renderQueue = 0;
            __touch(1841);
            this.skybox.meshRendererComponent.cullMode = 'Never';
            __touch(1842);
        }
    };
    __touch(1734);
    FlatWaterRenderer.prototype.setWaterEntity = function (entity) {
        this.waterEntity = entity;
        __touch(1843);
        this.waterEntity.meshRendererComponent.materials[0] = this.waterMaterial;
        __touch(1844);
    };
    __touch(1735);
    var waterShaderDef = {
        defines: { REFRACTION: false },
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexNormal: MeshData.NORMAL
        },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            normalMatrix: Shader.NORMAL_MATRIX,
            cameraPosition: Shader.CAMERA,
            normalMap: 'NORMAL_MAP',
            reflection: 'REFLECTION_MAP',
            refraction: 'REFRACTION_MAP',
            depthmap: 'DEPTH_MAP',
            vertexTangent: [
                1,
                0,
                0,
                1
            ],
            waterColor: [
                0.0625,
                0.0625,
                0.0625
            ],
            abovewater: true,
            fogColor: [
                1,
                1,
                1
            ],
            sunDirection: [
                0.66,
                0.66,
                0.33
            ],
            sunColor: [
                1,
                1,
                0.5
            ],
            sunShininess: 100,
            sunSpecPower: 4,
            fogStart: 0,
            fogScale: 2000,
            timeMultiplier: 1,
            time: Shader.TIME,
            distortionMultiplier: 0.025,
            fresnelPow: 2,
            normalMultiplier: 3,
            fresnelMultiplier: 1,
            waterScale: 5,
            doFog: true,
            resolution: Shader.RESOLUTION
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'attribute vec3 vertexNormal;',
            'uniform vec4 vertexTangent;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'uniform mat4 normalMatrix;',
            'uniform vec3 cameraPosition;',
            'uniform float waterScale;',
            'varying vec2 texCoord0;',
            'varying vec3 eyeVec;',
            'varying vec4 viewCoords;',
            'varying vec3 worldPos;',
            'void main(void) {',
            '\tworldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',
            '\ttexCoord0 = worldPos.xz * waterScale;',
            '\tvec3 n = normalize((normalMatrix * vec4(vertexNormal.x, vertexNormal.y, -vertexNormal.z, 0.0)).xyz);',
            '\tvec3 t = normalize((normalMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);',
            '\tvec3 b = cross(n, t) * vertexTangent.w;',
            '\tmat3 rotMat = mat3(t, b, n);',
            '\tvec3 eyeDir = worldPos - cameraPosition;',
            '\teyeVec = eyeDir * rotMat;',
            '\tviewCoords = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
            '\tgl_Position = viewCoords;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform sampler2D normalMap;',
            'uniform sampler2D reflection;',
            '#ifdef REFRACTION',
            'uniform sampler2D refraction;',
            'uniform sampler2D depthmap;',
            '#endif',
            'uniform vec3 waterColor;',
            'uniform bool abovewater;',
            'uniform vec3 fogColor;',
            'uniform float fogStart;',
            'uniform float fogScale;',
            'uniform float time;',
            'uniform float timeMultiplier;',
            'uniform float distortionMultiplier;',
            'uniform float fresnelPow;',
            'uniform vec3 sunDirection;',
            'uniform vec3 sunColor;',
            'uniform float sunShininess;',
            'uniform float sunSpecPower;',
            'uniform float normalMultiplier;',
            'uniform float fresnelMultiplier;',
            'uniform bool doFog;',
            'uniform vec2 resolution;',
            'varying vec2 texCoord0;',
            'varying vec3 eyeVec;',
            'varying vec4 viewCoords;',
            'varying vec3 worldPos;',
            'vec4 combineTurbulence(in vec2 coords) {',
            '\tfloat t = time * timeMultiplier;',
            '\tvec4 coarse1 = texture2D(normalMap, coords * vec2(0.0012, 0.001) + vec2(0.019 * t, 0.021 * t));',
            '\tvec4 coarse2 = texture2D(normalMap, coords * vec2(0.001, 0.0011) + vec2(-0.017 * t, 0.016 * t));',
            '\tvec4 detail1 = texture2D(normalMap, coords * vec2(0.008) + vec2(0.06 * t, 0.03 * t));',
            '\tvec4 detail2 = texture2D(normalMap, coords * vec2(0.006) + vec2(0.05 * t, -0.04 * t));',
            '\treturn (detail1 * 0.25 + detail2 * 0.25 + coarse1 * 0.75 + coarse2 * 1.0) / 2.25 - 0.48;',
            '}',
            '#ifdef REFRACTION',
            ShaderFragment.methods.unpackDepth,
            '#endif',
            'void main(void)',
            '{',
            '\tfloat fogDist = clamp((viewCoords.z-fogStart)/fogScale,0.0,1.0);',
            '\tvec2 normCoords = texCoord0;',
            '\tvec4 noise = combineTurbulence(normCoords);',
            '\tvec3 normalVector = normalize(noise.xyz * vec3(normalMultiplier, normalMultiplier, 1.0));',
            '\tvec3 localView = normalize(eyeVec);',
            '\tfloat fresnel = dot(normalize(normalVector * vec3(fresnelMultiplier, fresnelMultiplier, 1.0)), localView);',
            '\tif ( abovewater == false ) {',
            '\t\tfresnel = -fresnel;',
            '\t}',
            '\tfresnel *= 1.0 - fogDist;',
            '\tfloat fresnelTerm = 1.0 - fresnel;',
            '\tfresnelTerm = pow(fresnelTerm, fresnelPow);',
            '\tfresnelTerm = clamp(fresnelTerm, 0.0, 1.0);',
            '\tfresnelTerm = fresnelTerm * 0.95 + 0.05;',
            '\tvec2 projCoord = viewCoords.xy / viewCoords.q;',
            '\tprojCoord = (projCoord + 1.0) * 0.5;',
            '\tprojCoord.y -= 1.0 / resolution.y;',
            '#ifdef REFRACTION',
            '\tfloat depth = unpackDepth(texture2D(depthmap, projCoord));',
            '\tvec2 projCoordRefr = projCoord;',
            '\tprojCoordRefr += (normalVector.xy * distortionMultiplier) * smoothstep(0.0, 0.5, depth);',
            '\tprojCoordRefr = clamp(projCoordRefr, 0.001, 0.999);',
            '\tdepth = unpackDepth(texture2D(depthmap, projCoordRefr));',
            '#endif',
            '\tprojCoord += (normalVector.xy * distortionMultiplier);',
            '\tprojCoord = clamp(projCoord, 0.001, 0.999);',
            '\tif ( abovewater == true ) {',
            '\t\tprojCoord.x = 1.0 - projCoord.x;',
            '\t}',
            '\tvec4 waterColorX = vec4(waterColor, 1.0);',
            '\tvec4 reflectionColor = texture2D(reflection, projCoord);',
            '\tif ( abovewater == false ) {',
            '\t\treflectionColor *= vec4(0.8,0.9,1.0,1.0);',
            '\t\tvec4 endColor = mix(reflectionColor,waterColorX,fresnelTerm);',
            '\t\tgl_FragColor = mix(endColor,waterColorX,fogDist);',
            '\t}',
            '\telse {',
            '\t\tvec3 sunSpecReflection = normalize(reflect(-sunDirection, normalVector));',
            '\t\tfloat sunSpecDirection = max(0.0, dot(localView, sunSpecReflection));',
            '\t\tvec3 specular = pow(sunSpecDirection, sunShininess) * sunSpecPower * sunColor;',
            '\t\tvec4 endColor = waterColorX;',
            '#ifdef REFRACTION',
            '\t\tvec4 refractionColor = texture2D(refraction, projCoordRefr) * vec4(0.7);',
            '\t\tendColor = mix(refractionColor, waterColorX, depth);',
            '#endif',
            '\t\tendColor = mix(endColor, reflectionColor, fresnelTerm);',
            '\t\tif (doFog) {',
            '\t\t\tgl_FragColor = (vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist)) * (1.0-fogDist) + vec4(fogColor, 1.0) * fogDist;',
            '\t\t} else {',
            '\t\t\tgl_FragColor = vec4(specular, 1.0) + mix(endColor,reflectionColor,fogDist);',
            '\t\t}',
            '\t}',
            '}'
        ].join('\n')
    };
    __touch(1736);
    var packDepthY = {
        processors: [ShaderBuilder.animation.processor],
        defines: {
            WEIGHTS: true,
            JOINTIDS: true
        },
        attributes: {
            vertexPosition: MeshData.POSITION,
            vertexJointIDs: MeshData.JOINTIDS,
            vertexWeights: MeshData.WEIGHTS
        },
        uniforms: {
            viewMatrix: Shader.VIEW_MATRIX,
            projectionMatrix: Shader.PROJECTION_MATRIX,
            worldMatrix: Shader.WORLD_MATRIX,
            waterHeight: 0,
            waterDensity: 0.05
        },
        vshader: [
            'attribute vec3 vertexPosition;',
            'uniform mat4 viewMatrix;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 worldMatrix;',
            'varying vec4 worldPosition;',
            ShaderBuilder.animation.prevertex,
            'void main(void) {',
            'mat4 wMatrix = worldMatrix;',
            ShaderBuilder.animation.vertex,
            'worldPosition = wMatrix * vec4(vertexPosition, 1.0);',
            'gl_Position = projectionMatrix * viewMatrix * worldPosition;',
            '}'
        ].join('\n'),
        fshader: [
            'uniform float waterHeight;',
            'uniform float waterDensity;',
            ShaderFragment.methods.packDepth,
            'varying vec4 worldPosition;',
            'void main(void)',
            '{',
            'float linearDepth = clamp(pow((waterHeight - worldPosition.y) * waterDensity, 0.25), 0.0, 0.999);',
            'gl_FragColor = packDepth(linearDepth);',
            '}'
        ].join('\n')
    };
    __touch(1737);
    return FlatWaterRenderer;
    __touch(1738);
});
__touch(1730);