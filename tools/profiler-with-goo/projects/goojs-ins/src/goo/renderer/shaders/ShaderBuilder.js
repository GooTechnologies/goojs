define([
    'goo/renderer/MeshData',
    'goo/renderer/light/PointLight',
    'goo/renderer/light/DirectionalLight',
    'goo/renderer/light/SpotLight',
    'goo/renderer/Texture',
    'goo/math/MathUtils',
    'goo/util/TangentGenerator'
], function (MeshData, PointLight, DirectionalLight, SpotLight, Texture, MathUtils, TangentGenerator) {
    'use strict';
    __touch(18586);
    function ShaderBuilder() {
    }
    __touch(18587);
    var defaultLight = new DirectionalLight();
    __touch(18588);
    defaultLight.translation.setd(10, 10, 10);
    __touch(18589);
    defaultLight.direction.setd(1, 1, 1).normalize();
    __touch(18590);
    ShaderBuilder.defaultLight = defaultLight;
    __touch(18591);
    ShaderBuilder.SKYBOX = null;
    __touch(18592);
    ShaderBuilder.SKYSPHERE = null;
    __touch(18593);
    ShaderBuilder.ENVIRONMENT_TYPE = 0;
    __touch(18594);
    ShaderBuilder.GLOBAL_AMBIENT = [
        0,
        0,
        0
    ];
    __touch(18595);
    ShaderBuilder.CLEAR_COLOR = [
        0.3,
        0.3,
        0.3,
        1
    ];
    __touch(18596);
    ShaderBuilder.USE_FOG = false;
    __touch(18597);
    ShaderBuilder.FOG_SETTINGS = [
        0,
        10000
    ];
    __touch(18598);
    ShaderBuilder.FOG_COLOR = [
        1,
        1,
        1
    ];
    __touch(18599);
    ShaderBuilder.uber = {
        processor: function (shader, shaderInfo) {
            var attributeMap = shaderInfo.meshData.attributeMap;
            __touch(18605);
            var material = shaderInfo.material;
            __touch(18606);
            var textureMaps = material._textureMaps;
            __touch(18607);
            shader.defines = shader.defines || {};
            __touch(18608);
            shader.uniforms.clearColor = ShaderBuilder.CLEAR_COLOR;
            __touch(18609);
            if (material.uniforms.reflectivity || material.uniforms.refractivity) {
                shader.defines.REFLECTIVE = true;
                __touch(18616);
            } else if (shader.defines.REFLECTIVE !== undefined) {
                delete shader.defines.REFLECTIVE;
                __touch(18617);
            }
            if (material.getTexture('LOCAL_ENVIRONMENT')) {
                material.setTexture('ENVIRONMENT_SPHERE', material.getTexture('LOCAL_ENVIRONMENT'));
                __touch(18618);
                shader.defines.ENVIRONMENT_TYPE = 0;
                __touch(18619);
                if (material.getTexture('ENVIRONMENT_CUBE')) {
                    material.removeTexture('ENVIRONMENT_CUBE');
                    __touch(18620);
                }
            } else {
                if (ShaderBuilder.SKYBOX && (material.uniforms.reflectivity || material.uniforms.refractivity)) {
                    material.setTexture('ENVIRONMENT_CUBE', ShaderBuilder.SKYBOX);
                    __touch(18621);
                } else if (material.getTexture('ENVIRONMENT_CUBE')) {
                    material.removeTexture('ENVIRONMENT_CUBE');
                    __touch(18622);
                }
                if (ShaderBuilder.SKYSPHERE && (material.uniforms.reflectivity || material.uniforms.refractivity)) {
                    material.setTexture('ENVIRONMENT_SPHERE', ShaderBuilder.SKYSPHERE);
                    __touch(18623);
                    shader.defines.ENVIRONMENT_TYPE = ShaderBuilder.ENVIRONMENT_TYPE;
                    __touch(18624);
                } else if (material.getTexture('ENVIRONMENT_SPHERE')) {
                    material.removeTexture('ENVIRONMENT_SPHERE');
                    __touch(18625);
                }
            }
            var keys = Object.keys(attributeMap);
            __touch(18610);
            for (var i = 0, l = keys.length; i < l; i++) {
                var attribute = keys[i];
                __touch(18626);
                if (!shader.defines[attribute]) {
                    shader.defines[attribute] = true;
                    __touch(18627);
                }
            }
            var keys = Object.keys(textureMaps);
            __touch(18611);
            for (var i = 0, l = keys.length; i < l; i++) {
                var type = keys[i];
                __touch(18628);
                if (textureMaps[type] === undefined || textureMaps[type] === null) {
                    continue;
                    __touch(18629);
                }
                if (type === 'SHADOW_MAP') {
                    continue;
                    __touch(18630);
                }
                if (!shader.defines[type]) {
                    shader.defines[type] = true;
                    __touch(18631);
                }
            }
            shader.uniforms.offsetRepeat = shader.uniforms.offsetRepeat || [
                0,
                0,
                1,
                1
            ];
            __touch(18612);
            if (textureMaps.DIFFUSE_MAP) {
                var offset = textureMaps.DIFFUSE_MAP.offset;
                __touch(18632);
                var repeat = textureMaps.DIFFUSE_MAP.repeat;
                __touch(18633);
                shader.uniforms.offsetRepeat[0] = offset.data[0];
                __touch(18634);
                shader.uniforms.offsetRepeat[1] = offset.data[1];
                __touch(18635);
                shader.uniforms.offsetRepeat[2] = repeat.data[0];
                __touch(18636);
                shader.uniforms.offsetRepeat[3] = repeat.data[1];
                __touch(18637);
                shader.uniforms.lodBias = textureMaps.DIFFUSE_MAP.lodBias;
                __touch(18638);
            } else {
                shader.uniforms.offsetRepeat[0] = 0;
                __touch(18639);
                shader.uniforms.offsetRepeat[1] = 0;
                __touch(18640);
                shader.uniforms.offsetRepeat[2] = 1;
                __touch(18641);
                shader.uniforms.offsetRepeat[3] = 1;
                __touch(18642);
                shader.uniforms.lodBias = 0;
                __touch(18643);
            }
            var keys = Object.keys(shader.defines);
            __touch(18613);
            for (var i = 0, l = keys.length; i < l; i++) {
                var attribute = keys[i];
                __touch(18644);
                if (attribute === 'MAX_POINT_LIGHTS' || attribute === 'MAX_DIRECTIONAL_LIGHTS' || attribute === 'MAX_SPOT_LIGHTS' || attribute === 'SHADOW_TYPE' || attribute === 'JOINT_COUNT' || attribute === 'WEIGHTS' || attribute === 'PHYSICALLY_BASED_SHADING' || attribute === 'ENVIRONMENT_TYPE' || attribute === 'REFLECTIVE' || attribute === 'DISCARD' || attribute === 'FOG' || attribute === 'REFLECTION_TYPE' || attribute === 'SKIP_SPECULAR' || attribute === 'WRAP_AROUND') {
                    continue;
                    __touch(18645);
                }
                if (!attributeMap[attribute] && !textureMaps[attribute]) {
                    delete shader.defines[attribute];
                    __touch(18646);
                }
            }
            if (material.uniforms.discardThreshold >= 0) {
                shader.defines.DISCARD = true;
                __touch(18647);
            } else if (shader.defines.DISCARD !== undefined) {
                delete shader.defines.DISCARD;
                __touch(18648);
            }
            if (ShaderBuilder.USE_FOG) {
                shader.defines.FOG = true;
                __touch(18649);
                shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
                __touch(18650);
                shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
                __touch(18651);
            } else if (shader.defines.FOG !== undefined) {
                delete shader.defines.FOG;
                __touch(18652);
            }
            if (material.multiplyAmbient) {
                shader.defines.MULTIPLY_AMBIENT = true;
                __touch(18653);
            }
            shader.defines.SKIP_SPECULAR = true;
            __touch(18614);
            shader.defines.REFLECTION_TYPE = material.uniforms.reflectionType !== undefined ? material.uniforms.reflectionType : 0;
            __touch(18615);
            if (shader.defines.NORMAL && shader.defines.NORMAL_MAP && !shaderInfo.meshData.getAttributeBuffer(MeshData.TANGENT)) {
                TangentGenerator.addTangentBuffer(shaderInfo.meshData);
                __touch(18654);
            }
        }
    };
    __touch(18600);
    var lightDefines = [];
    __touch(18601);
    ShaderBuilder.light = {
        processor: function (shader, shaderInfo) {
            var uniforms = shader.uniforms;
            __touch(18655);
            uniforms.materialAmbient = uniforms.materialAmbient || 'AMBIENT';
            __touch(18656);
            uniforms.materialEmissive = uniforms.materialEmissive || 'EMISSIVE';
            __touch(18657);
            uniforms.materialDiffuse = uniforms.materialDiffuse || 'DIFFUSE';
            __touch(18658);
            uniforms.materialSpecular = uniforms.materialSpecular || 'SPECULAR';
            __touch(18659);
            uniforms.materialSpecularPower = uniforms.materialSpecularPower || 'SPECULAR_POWER';
            __touch(18660);
            uniforms.globalAmbient = ShaderBuilder.GLOBAL_AMBIENT;
            __touch(18661);
            shader.defines = shader.defines || {};
            __touch(18662);
            var lights = shaderInfo.lights;
            __touch(18663);
            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                __touch(18666);
                if (light instanceof PointLight) {
                    uniforms['pointLight' + i] = uniforms['pointLight' + i] || [];
                    __touch(18668);
                    uniforms['pointLightColor' + i] = uniforms['pointLightColor' + i] || [];
                    __touch(18669);
                    var pointLightN = uniforms['pointLight' + i];
                    __touch(18670);
                    var translation = light.translation.data;
                    __touch(18671);
                    pointLightN[0] = translation[0];
                    __touch(18672);
                    pointLightN[1] = translation[1];
                    __touch(18673);
                    pointLightN[2] = translation[2];
                    __touch(18674);
                    pointLightN[3] = light.range;
                    __touch(18675);
                    var pointLightColorN = uniforms['pointLightColor' + i];
                    __touch(18676);
                    var color = light.color.data;
                    __touch(18677);
                    pointLightColorN[0] = color[0] * light.intensity;
                    __touch(18678);
                    pointLightColorN[1] = color[1] * light.intensity;
                    __touch(18679);
                    pointLightColorN[2] = color[2] * light.intensity;
                    __touch(18680);
                    pointLightColorN[3] = light.specularIntensity;
                    __touch(18681);
                    lightDefines.push('P');
                    __touch(18682);
                } else if (light instanceof DirectionalLight) {
                    uniforms['directionalLightDirection' + i] = uniforms['directionalLightDirection' + i] || [];
                    __touch(18683);
                    uniforms['directionalLightColor' + i] = uniforms['directionalLightColor' + i] || [];
                    __touch(18684);
                    var directionalLightDir = uniforms['directionalLightDirection' + i];
                    __touch(18685);
                    var direction = light.direction.data;
                    __touch(18686);
                    directionalLightDir[0] = direction[0];
                    __touch(18687);
                    directionalLightDir[1] = direction[1];
                    __touch(18688);
                    directionalLightDir[2] = direction[2];
                    __touch(18689);
                    var directionalLightColorN = uniforms['directionalLightColor' + i];
                    __touch(18690);
                    var color = light.color.data;
                    __touch(18691);
                    directionalLightColorN[0] = color[0] * light.intensity;
                    __touch(18692);
                    directionalLightColorN[1] = color[1] * light.intensity;
                    __touch(18693);
                    directionalLightColorN[2] = color[2] * light.intensity;
                    __touch(18694);
                    directionalLightColorN[3] = light.specularIntensity;
                    __touch(18695);
                    lightDefines.push('D');
                    __touch(18696);
                } else if (light instanceof SpotLight) {
                    uniforms['spotLight' + i] = [
                        light.translation.data[0],
                        light.translation.data[1],
                        light.translation.data[2],
                        light.range
                    ];
                    __touch(18697);
                    uniforms['spotLightColor' + i] = [
                        light.color.data[0] * light.intensity,
                        light.color.data[1] * light.intensity,
                        light.color.data[2] * light.intensity,
                        light.specularIntensity
                    ];
                    __touch(18698);
                    uniforms['spotLightDirection' + i] = [
                        light.direction.data[0],
                        light.direction.data[1],
                        light.direction.data[2]
                    ];
                    __touch(18699);
                    uniforms['spotLightAngle' + i] = Math.cos(light.angle * MathUtils.DEG_TO_RAD / 2);
                    __touch(18700);
                    uniforms['spotLightPenumbra' + i] = light.penumbra !== undefined ? Math.sin(light.penumbra * MathUtils.DEG_TO_RAD / 4) : 0;
                    __touch(18701);
                    lightDefines.push('S');
                    __touch(18702);
                }
                var useLightCookie = light.lightCookie instanceof Texture;
                __touch(18667);
                if ((useLightCookie || light.shadowCaster && shaderInfo.renderable.meshRendererComponent && shaderInfo.renderable.meshRendererComponent.receiveShadows) && light.shadowSettings.shadowData) {
                    var shadowData = light.shadowSettings.shadowData;
                    __touch(18703);
                    if (light.shadowCaster) {
                        uniforms['shadowMaps' + i] = 'SHADOW_MAP' + i;
                        __touch(18706);
                        shaderInfo.material.setTexture('SHADOW_MAP' + i, shadowData.shadowResult);
                        __touch(18707);
                    }
                    if (useLightCookie) {
                        uniforms['lightCookie' + i] = 'LIGHT_COOKIE' + i;
                        __touch(18708);
                        shaderInfo.material.setTexture('LIGHT_COOKIE' + i, light.lightCookie);
                        __touch(18709);
                        lightDefines.push('C');
                        __touch(18710);
                        shader.defines.COOKIE = true;
                        __touch(18711);
                    } else {
                        delete shader.defines.COOKIE;
                        __touch(18712);
                    }
                    var matrix = shadowData.lightCamera.getViewProjectionMatrix().data;
                    __touch(18704);
                    var mat = uniforms['shadowLightMatrices' + i] = uniforms['shadowLightMatrices' + i] || [];
                    __touch(18705);
                    for (var j = 0; j < 16; j++) {
                        mat[j] = matrix[j];
                        __touch(18713);
                    }
                    if (light.shadowCaster) {
                        var translationData = shadowData.lightCamera.translation.data;
                        __touch(18714);
                        var pos = uniforms['shadowLightPositions' + i] = uniforms['shadowLightPositions' + i] || [];
                        __touch(18715);
                        pos[0] = translationData[0];
                        __touch(18716);
                        pos[1] = translationData[1];
                        __touch(18717);
                        pos[2] = translationData[2];
                        __touch(18718);
                        uniforms['cameraScales' + i] = 1 / (shadowData.lightCamera.far - shadowData.lightCamera.near);
                        __touch(18719);
                        uniforms['shadowDarkness' + i] = light.shadowSettings.darkness;
                        __touch(18720);
                        if (light.shadowSettings.shadowType === 'PCF') {
                            var sizes = uniforms['shadowMapSizes' + i] = uniforms['shadowMapSizes' + i] || [];
                            __touch(18722);
                            sizes[0] = light.shadowSettings.resolution[0];
                            __touch(18723);
                            sizes[1] = light.shadowSettings.resolution[1];
                            __touch(18724);
                        }
                        lightDefines.push('H', light.shadowSettings.shadowType === 'PCF' ? 1 : light.shadowSettings.shadowType === 'VSM' ? 2 : 0);
                        __touch(18721);
                    }
                }
            }
            var lightStr = lightDefines.join('');
            __touch(18664);
            if (shader.defines.LIGHT !== lightStr) {
                shader.defines.LIGHT = lightStr;
                __touch(18725);
            }
            lightDefines.length = 0;
            __touch(18665);
        },
        builder: function (shader, shaderInfo) {
            var prevertex = [];
            __touch(18726);
            var vertex = [];
            __touch(18727);
            var prefragment = [];
            __touch(18728);
            var fragment = [];
            __touch(18729);
            prevertex.push('const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);');
            __touch(18730);
            prefragment.push('uniform vec4 materialAmbient;', 'uniform vec4 materialEmissive;', 'uniform vec4 materialDiffuse;', 'uniform vec4 materialSpecular;', 'uniform float materialSpecularPower;', 'uniform vec3 globalAmbient;', 'uniform vec2 wrapSettings;', 'float ChebychevInequality(in vec2 moments, in float t) {', 'if ( t <= moments.x ) return 1.0;', 'float variance = moments.y - (moments.x * moments.x);', 'variance = max(variance, 0.02);', 'float d = t - moments.x;', 'return variance / (variance + d * d);', '}');
            __touch(18731);
            fragment.push('#if defined(SPECULAR_MAP) && defined(TEXCOORD0)', 'float specularStrength = texture2D(specularMap, texCoord0).x;', '#else', 'float specularStrength = 1.0;', '#endif', 'vec3 totalDiffuse = vec3(0.0);', 'vec3 totalSpecular = vec3(0.0);');
            __touch(18732);
            var lights = shaderInfo.lights;
            __touch(18733);
            if (lights.length > 0) {
                fragment.push('vec3 normalizedViewPosition = normalize(viewPosition);');
                __touch(18739);
            }
            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                __touch(18740);
                fragment.push('{', 'float shadow = 1.0;');
                __touch(18741);
                var useLightCookie = light.lightCookie instanceof Texture;
                __touch(18742);
                if (useLightCookie || light.shadowCaster && shaderInfo.renderable.meshRendererComponent && shaderInfo.renderable.meshRendererComponent.receiveShadows) {
                    prevertex.push('uniform mat4 shadowLightMatrices' + i + ';', 'varying vec4 shadowLightDepths' + i + ';');
                    __touch(18744);
                    vertex.push('shadowLightDepths' + i + ' = ScaleMatrix * shadowLightMatrices' + i + ' * worldPos;');
                    __touch(18745);
                    if (light.shadowCaster) {
                        prefragment.push('uniform sampler2D shadowMaps' + i + ';', 'uniform vec3 shadowLightPositions' + i + ';', 'uniform float cameraScales' + i + ';', 'uniform float shadowDarkness' + i + ';');
                        __touch(18748);
                    }
                    if (useLightCookie) {
                        prefragment.push('uniform sampler2D lightCookie' + i + ';');
                        __touch(18749);
                    }
                    prefragment.push('varying vec4 shadowLightDepths' + i + ';');
                    __touch(18746);
                    if (light.shadowCaster && light.shadowSettings.shadowType === 'PCF') {
                        prefragment.push('uniform vec2 shadowMapSizes' + i + ';');
                        __touch(18750);
                    }
                    fragment.push('vec3 depth = shadowLightDepths' + i + '.xyz / shadowLightDepths' + i + '.w;');
                    __touch(18747);
                    if (light.shadowCaster) {
                        fragment.push('depth.z = length(vWorldPos.xyz - shadowLightPositions' + i + ') * cameraScales' + i + ';', 'if (depth.x >= 0.0 && depth.x <= 1.0 && depth.y >= 0.0 && depth.y <= 1.0 && shadowLightDepths' + i + '.z >= 0.0 && depth.z <= 1.0) {');
                        __touch(18751);
                        if (light.shadowSettings.shadowType === 'PCF') {
                            fragment.push('depth.z *= 0.96;', 'float shadowPcf = 0.0;', 'const float shadowDelta = 1.0 / 9.0;', 'float xPixelOffset = 1.0 / shadowMapSizes' + i + '.x;', 'float yPixelOffset = 1.0 / shadowMapSizes' + i + '.y;', 'float dx0 = -1.25 * xPixelOffset;', 'float dy0 = -1.25 * yPixelOffset;', 'float dx1 = 1.25 * xPixelOffset;', 'float dy1 = 1.25 * yPixelOffset;', 'float fDepth = 0.0;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx0, dy0)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(0.0, dy0)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx1, dy0)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx0, 0.0)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth =  texture2D(shadowMaps' + i + ', depth.xy).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx1, 0.0)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx0, dy1)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(0.0, dy1)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'fDepth = texture2D(shadowMaps' + i + ', depth.xy + vec2(dx1, dy1)).r;', 'if (fDepth < depth.z) shadowPcf += shadowDelta;', 'shadow = mix(1.0, 1.0 - shadowPcf, shadowDarkness' + i + ');');
                            __touch(18753);
                        } else if (light.shadowSettings.shadowType === 'VSM') {
                            fragment.push('vec4 texel = texture2D(shadowMaps' + i + ', depth.xy);', 'vec2 moments = vec2(texel.x, texel.y);', 'shadow = ChebychevInequality(moments, depth.z);', 'shadow = pow(shadow, shadowDarkness' + i + ' * 8.0);');
                            __touch(18754);
                        } else {
                            fragment.push('depth.z *= 0.96;', 'float shadowDepth = texture2D(shadowMaps' + i + ', depth.xy).x;', 'if ( depth.z > shadowDepth ) shadow = 1.0 - shadowDarkness' + i + ';');
                            __touch(18755);
                        }
                        fragment.push('}', 'shadow = clamp(shadow, 0.0, 1.0);');
                        __touch(18752);
                    }
                }
                if (light instanceof PointLight) {
                    prefragment.push('uniform vec4 pointLight' + i + ';', 'uniform vec4 pointLightColor' + i + ';');
                    __touch(18756);
                    fragment.push('vec3 lVector = normalize(pointLight' + i + '.xyz - vWorldPos.xyz);', 'float lDistance = 1.0 - min((length(pointLight' + i + '.xyz - vWorldPos.xyz) / pointLight' + i + '.w), 1.0);', 'float dotProduct = dot(N, lVector);', 'float pointDiffuseWeightFull = max(dotProduct, 0.0);', 'float pointDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);', 'vec3 pointDiffuseWeight = mix(vec3(pointDiffuseWeightFull), vec3(pointDiffuseWeightHalf), wrapSettings.y);', 'totalDiffuse += materialDiffuse.rgb * pointLightColor' + i + '.rgb * pointDiffuseWeight * lDistance * shadow;', 'vec3 pointHalfVector = normalize(lVector + normalizedViewPosition);', 'float pointDotNormalHalf = max(dot(N, pointHalfVector), 0.0);', 'float pointSpecularWeight = pointLightColor' + i + '.a * specularStrength * max(pow(pointDotNormalHalf, materialSpecularPower), 0.0);', '#ifdef PHYSICALLY_BASED_SHADING', 'float specularNormalization = (materialSpecularPower + 2.0001 ) / 8.0;', 'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, pointHalfVector), 5.0);', 'totalSpecular += schlick * pointLightColor' + i + '.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization * shadow;', '#else', 'totalSpecular += materialSpecular.rgb * pointLightColor' + i + '.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * shadow;', '#endif');
                    __touch(18757);
                } else if (light instanceof DirectionalLight) {
                    prefragment.push('uniform vec4 directionalLightColor' + i + ';', 'uniform vec3 directionalLightDirection' + i + ';');
                    __touch(18758);
                    fragment.push('vec3 dirVector = normalize(-directionalLightDirection' + i + ');', 'float dotProduct = dot(N, dirVector);', 'float dirDiffuseWeightFull = max(dotProduct, 0.0);', 'float dirDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);', 'vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapSettings.y);', 'vec3 cookie = vec3(1.0);');
                    __touch(18759);
                    if (useLightCookie) {
                        fragment.push('vec4 cookieTex = texture2D(lightCookie' + i + ', depth.xy);', 'cookie = cookieTex.rgb * cookieTex.a;');
                        __touch(18761);
                    }
                    fragment.push('totalDiffuse += materialDiffuse.rgb * directionalLightColor' + i + '.rgb * dirDiffuseWeight * shadow * cookie;', 'vec3 dirHalfVector = normalize(dirVector + normalizedViewPosition);', 'float dirDotNormalHalf = max(dot(N, dirHalfVector), 0.0);', 'float dirSpecularWeight = directionalLightColor' + i + '.a * specularStrength * max(pow(dirDotNormalHalf, materialSpecularPower), 0.0);', '#ifdef PHYSICALLY_BASED_SHADING', 'float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;', 'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(dirVector, dirHalfVector), 5.0);', 'totalSpecular += schlick * directionalLightColor' + i + '.rgb * dirSpecularWeight * dirDiffuseWeight * specularNormalization * shadow * cookie;', '#else', 'totalSpecular += materialSpecular.rgb * directionalLightColor' + i + '.rgb * dirSpecularWeight * dirDiffuseWeight * shadow * cookie;', '#endif');
                    __touch(18760);
                } else if (light instanceof SpotLight) {
                    prefragment.push('uniform vec4 spotLightColor' + i + ';', 'uniform vec4 spotLight' + i + ';', 'uniform vec3 spotLightDirection' + i + ';', 'uniform float spotLightAngle' + i + ';', 'uniform float spotLightPenumbra' + i + ';');
                    __touch(18762);
                    fragment.push('vec3 lVector = normalize(spotLight' + i + '.xyz - vWorldPos.xyz);', 'float lDistance = 1.0 - min((length(spotLight' + i + '.xyz - vWorldPos.xyz) / spotLight' + i + '.w), 1.0);', 'float spotEffect = dot(normalize(-spotLightDirection' + i + '), lVector);', 'if (spotEffect > spotLightAngle' + i + ') {', 'if (spotLightPenumbra' + i + ' > 0.0) {', 'spotEffect = (spotEffect - spotLightAngle' + i + ') / spotLightPenumbra' + i + ';', 'spotEffect = clamp(spotEffect, 0.0, 1.0);', '} else {', 'spotEffect = 1.0;', '}', 'float dotProduct = dot(N, lVector);', 'float spotDiffuseWeightFull = max(dotProduct, 0.0);', 'float spotDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);', 'vec3 spotDiffuseWeight = mix(vec3(spotDiffuseWeightFull), vec3(spotDiffuseWeightHalf), wrapSettings.y);', 'vec3 cookie = vec3(1.0);');
                    __touch(18763);
                    if (useLightCookie) {
                        fragment.push('cookie = texture2D(lightCookie' + i + ', depth.xy).rgb;');
                        __touch(18765);
                    }
                    fragment.push('totalDiffuse += materialDiffuse.rgb * spotLightColor' + i + '.rgb * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;', 'vec3 spotHalfVector = normalize(lVector + normalizedViewPosition);', 'float spotDotNormalHalf = max(dot(N, spotHalfVector), 0.0);', 'float spotSpecularWeight = spotLightColor' + i + '.a * specularStrength * max(pow(spotDotNormalHalf, materialSpecularPower), 0.0);', '#ifdef PHYSICALLY_BASED_SHADING', 'float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;', 'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, spotHalfVector), 5.0);', 'totalSpecular += schlick * spotLightColor' + i + '.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect * shadow * cookie;', '#else', 'totalSpecular += materialSpecular.rgb * spotLightColor' + i + '.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;', '#endif', '}');
                    __touch(18764);
                }
                fragment.push('}');
                __touch(18743);
            }
            fragment.push('#if defined(EMISSIVE_MAP) && defined(TEXCOORD0)', 'vec3 emissive = vec3(0.0);', '#else', 'vec3 emissive = materialEmissive.rgb;', '#endif', '#if defined(MULTIPLY_AMBIENT)', 'vec3 ambient = globalAmbient * materialAmbient.rgb;', '#else', 'vec3 ambient = globalAmbient + materialAmbient.rgb;', '#endif', '#ifdef SKIP_SPECULAR', 'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + ambient);', '#else', 'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + ambient) + totalSpecular;', '#endif', '#if defined(EMISSIVE_MAP) && defined(TEXCOORD0)', 'final_color.rgb += texture2D(emissiveMap, texCoord0).rgb * materialEmissive.rgb;', '#endif');
            __touch(18734);
            ShaderBuilder.light.prevertex = prevertex.join('\n');
            __touch(18735);
            ShaderBuilder.light.vertex = vertex.join('\n');
            __touch(18736);
            ShaderBuilder.light.prefragment = prefragment.join('\n');
            __touch(18737);
            ShaderBuilder.light.fragment = fragment.join('\n');
            __touch(18738);
        }
    };
    __touch(18602);
    ShaderBuilder.animation = {
        processor: function (shader, shaderInfo) {
            var pose = shaderInfo.currentPose;
            __touch(18766);
            shader.defines = shader.defines || {};
            __touch(18767);
            if (pose) {
                if (!shader.uniforms.jointPalette) {
                    shader.uniforms.jointPalette = ShaderBuilder.animation.jointPalette;
                    __touch(18769);
                }
                shader.defines.JOINT_COUNT = Math.max(shaderInfo.meshData.paletteMap.length * 3, 80);
                __touch(18768);
            } else {
                delete shader.defines.JOINT_COUNT;
                __touch(18770);
            }
        },
        jointPalette: function (shaderInfo) {
            var skMesh = shaderInfo.meshData;
            __touch(18771);
            var pose = shaderInfo.currentPose;
            __touch(18772);
            if (pose) {
                var palette = pose._matrixPalette;
                __touch(18773);
                var store = skMesh.store;
                __touch(18774);
                if (!store) {
                    store = new Float32Array(skMesh.paletteMap.length * 12);
                    __touch(18777);
                    skMesh.store = store;
                    __touch(18778);
                }
                var refMat;
                __touch(18775);
                for (var index = 0; index < skMesh.paletteMap.length; index++) {
                    refMat = palette[skMesh.paletteMap[index]];
                    __touch(18779);
                    for (var i = 0; i < 12; i++) {
                        store[index * 12 + i] = refMat.data[ShaderBuilder.animation.order[i]];
                        __touch(18780);
                    }
                }
                return store;
                __touch(18776);
            }
        },
        order: [
            0,
            4,
            8,
            12,
            1,
            5,
            9,
            13,
            2,
            6,
            10,
            14
        ],
        prevertex: [
            '#ifdef JOINTIDS',
            'attribute vec4 vertexJointIDs;',
            '#endif',
            '#ifdef WEIGHTS',
            'attribute vec4 vertexWeights;',
            '#endif',
            '#ifdef JOINT_COUNT',
            'uniform vec4 jointPalette[JOINT_COUNT];',
            '#endif'
        ].join('\n'),
        vertex: [
            '#if defined(JOINT_COUNT) && defined(WEIGHTS) && defined(JOINTIDS)',
            'int x = 3*int(vertexJointIDs.x);',
            'int y = 3*int(vertexJointIDs.y);',
            'int z = 3*int(vertexJointIDs.z);',
            'int w = 3*int(vertexJointIDs.w);',
            'mat4 mat = mat4(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);',
            'mat += mat4(',
            '\tjointPalette[x+0].x, jointPalette[x+1].x, jointPalette[x+2].x, 0,',
            '\tjointPalette[x+0].y, jointPalette[x+1].y, jointPalette[x+2].y, 0,',
            '\tjointPalette[x+0].z, jointPalette[x+1].z, jointPalette[x+2].z, 0,',
            '\tjointPalette[x+0].w, jointPalette[x+1].w, jointPalette[x+2].w, 1',
            ') * vertexWeights.x;',
            'mat += mat4(',
            '\tjointPalette[y+0].x, jointPalette[y+1].x, jointPalette[y+2].x, 0,',
            '\tjointPalette[y+0].y, jointPalette[y+1].y, jointPalette[y+2].y, 0,',
            '\tjointPalette[y+0].z, jointPalette[y+1].z, jointPalette[y+2].z, 0,',
            '\tjointPalette[y+0].w, jointPalette[y+1].w, jointPalette[y+2].w, 1',
            ') * vertexWeights.y;',
            'mat += mat4(',
            '\tjointPalette[z+0].x, jointPalette[z+1].x, jointPalette[z+2].x, 0,',
            '\tjointPalette[z+0].y, jointPalette[z+1].y, jointPalette[z+2].y, 0,',
            '\tjointPalette[z+0].z, jointPalette[z+1].z, jointPalette[z+2].z, 0,',
            '\tjointPalette[z+0].w, jointPalette[z+1].w, jointPalette[z+2].w, 1',
            ') * vertexWeights.z;',
            'mat += mat4(',
            '\tjointPalette[w+0].x, jointPalette[w+1].x, jointPalette[w+2].x, 0,',
            '\tjointPalette[w+0].y, jointPalette[w+1].y, jointPalette[w+2].y, 0,',
            '\tjointPalette[w+0].z, jointPalette[w+1].z, jointPalette[w+2].z, 0,',
            '\tjointPalette[w+0].w, jointPalette[w+1].w, jointPalette[w+2].w, 1',
            ') * vertexWeights.w;',
            'wMatrix = wMatrix * mat / mat[3][3];',
            '#ifdef NORMAL',
            'nMatrix = nMatrix * mat / mat[3][3];',
            '#endif',
            '#endif'
        ].join('\n')
    };
    __touch(18603);
    return ShaderBuilder;
    __touch(18604);
});
__touch(18585);