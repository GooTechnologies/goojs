define([
	'goo/renderer/MeshData',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/math/MathUtils',
	'goo/util/TangentGenerator'
],
/** @lends */
function(
	MeshData,
	PointLight,
	DirectionalLight,
	SpotLight,
	MathUtils,
	TangentGenerator
) {
	"use strict";

	/**
	 * @class Builds shaders
	 */
	function ShaderBuilder() {
	}

	var defaultLight = new DirectionalLight();
	defaultLight.translation.setd(10, 10, 10);
	defaultLight.direction.setd(1, 1, 1).normalize();
	ShaderBuilder.defaultLight = defaultLight;

	ShaderBuilder.SKYBOX = null;
	ShaderBuilder.SKYSPHERE = null;
	ShaderBuilder.ENVIRONMENT_TYPE = 0;

	ShaderBuilder.uber = {
		processor: function (shader, shaderInfo) {
			var attributeMap = shaderInfo.meshData.attributeMap;
			var textureMaps = shaderInfo.material._textureMaps;

			shader.defines = shader.defines || {};

			if (ShaderBuilder.SKYBOX) {
				shaderInfo.material.setTexture('ENVIRONMENT_CUBE', ShaderBuilder.SKYBOX);
			} else if (ShaderBuilder.SKYSPHERE) {
				shaderInfo.material.setTexture('ENVIRONMENT_SPHERE', ShaderBuilder.SKYSPHERE);
				shader.defines.ENVIRONMENT_TYPE = ShaderBuilder.ENVIRONMENT_TYPE;
			}

			for (var attribute in attributeMap) {
				if (!shader.defines[attribute]) {
					shader.defines[attribute] = true;
				}
			}

			for (var type in textureMaps) {
				if (textureMaps[type] === undefined) {
					continue;
				}

				if (type === 'SHADOW_MAP') {
					continue;
				}

				if (!shader.defines[type]) {
					shader.defines[type] = true;
				}

				if (type === 'DIFFUSE_MAP') {
					var offset = textureMaps[type].offset;
					var repeat = textureMaps[type].repeat;
					shader.uniforms.offsetRepeat = shader.uniforms.offsetRepeat || [0, 0, 1, 1];
					shader.uniforms.offsetRepeat[0] = offset.x;
					shader.uniforms.offsetRepeat[1] = offset.y;
					shader.uniforms.offsetRepeat[2] = repeat.x;
					shader.uniforms.offsetRepeat[3] = repeat.y;
				}
			}

			// Exclude in a nicer way
			for (var attribute in shader.defines) {
				if (attribute === 'MAX_POINT_LIGHTS' ||
					attribute === 'MAX_DIRECTIONAL_LIGHTS' ||
					attribute === 'MAX_SPOT_LIGHTS' ||
					attribute === 'SHADOW_TYPE' ||
					attribute === 'JOINT_COUNT' ||
					attribute === 'WEIGHTS' ||
					attribute === 'PHYSICALLY_BASED_SHADING' ||
					attribute === 'ENVIRONMENT_TYPE') {
					continue;
				}
				if (!attributeMap[attribute] && !textureMaps[attribute]) {
					delete shader.defines[attribute];
				}
			}

			//TODO: Hacky?
			if (shader.defines.NORMAL && shader.defines.NORMAL_MAP && !shaderInfo.meshData.getAttributeBuffer(MeshData.TANGENT)) {
				TangentGenerator.addTangentBuffer(shaderInfo.meshData);
			}
		}
	};

	ShaderBuilder.light = {
		processor: function (shader, shaderInfo) {
			shader.uniforms.materialAmbient = shader.uniforms.materialAmbient || 'AMBIENT';
			shader.uniforms.materialEmissive = shader.uniforms.materialEmissive || 'EMISSIVE';
			shader.uniforms.materialDiffuse = shader.uniforms.materialDiffuse || 'DIFFUSE';
			shader.uniforms.materialSpecular = shader.uniforms.materialSpecular || 'SPECULAR';
			shader.uniforms.materialSpecularPower = shader.uniforms.materialSpecularPower || 'SPECULAR_POWER';

			var pointCount = 0;
			shader.uniforms.pointLightColor = shader.uniforms.pointLightColor || [];
			shader.uniforms.pointLight = shader.uniforms.pointLight || [];

			var directionalCount = 0;
			shader.uniforms.directionalLightColor = shader.uniforms.directionalLightColor || [];
			shader.uniforms.directionalLightDirection = shader.uniforms.directionalLightDirection || [];

			var spotCount = 0;
			shader.uniforms.spotLightColor = shader.uniforms.spotLightColor || [];
			shader.uniforms.spotLight = shader.uniforms.spotLight || [];
			shader.uniforms.spotLightDirection = shader.uniforms.spotLightDirection || [];
			shader.uniforms.spotLightAngle = shader.uniforms.spotLightAngle || [];
			shader.uniforms.spotLightPenumbra = shader.uniforms.spotLightPenumbra || [];

			// Use default light?
			// var lights = shaderInfo.lights.length > 0 ? shaderInfo.lights : [ShaderBuilder.defaultLight];
			var lights = shaderInfo.lights;
			for (var i = 0; i < lights.length; i++) {
				var light = lights[i];

				if (light instanceof PointLight) {
					shader.uniforms.pointLight[pointCount * 4 + 0] = light.translation.data[0];
					shader.uniforms.pointLight[pointCount * 4 + 1] = light.translation.data[1];
					shader.uniforms.pointLight[pointCount * 4 + 2] = light.translation.data[2];
					shader.uniforms.pointLight[pointCount * 4 + 3] = light.range;

					shader.uniforms.pointLightColor[pointCount * 4 + 0] = light.color.data[0] * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 1] = light.color.data[1] * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 2] = light.color.data[2] * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 3] = light.specularIntensity;

					pointCount++;
				} else if (light instanceof DirectionalLight) {
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 0] = light.direction.data[0];
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 1] = light.direction.data[1];
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 2] = light.direction.data[2];

					shader.uniforms.directionalLightColor[directionalCount * 4 + 0] = light.color.data[0] * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 1] = light.color.data[1] * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 2] = light.color.data[2] * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 3] = light.specularIntensity;

					directionalCount++;
				} else if (light instanceof SpotLight) {
					shader.uniforms.spotLight[spotCount * 4 + 0] = light.translation.data[0];
					shader.uniforms.spotLight[spotCount * 4 + 1] = light.translation.data[1];
					shader.uniforms.spotLight[spotCount * 4 + 2] = light.translation.data[2];
					shader.uniforms.spotLight[spotCount * 4 + 3] = light.range;

					shader.uniforms.spotLightColor[spotCount * 4 + 0] = light.color.data[0] * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 1] = light.color.data[1] * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 2] = light.color.data[2] * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 3] = light.specularIntensity;

					shader.uniforms.spotLightDirection[spotCount * 3 + 0] = light.direction.data[0];
					shader.uniforms.spotLightDirection[spotCount * 3 + 1] = light.direction.data[1];
					shader.uniforms.spotLightDirection[spotCount * 3 + 2] = light.direction.data[2];

					shader.uniforms.spotLightAngle[spotCount] = Math.cos(light.angle * MathUtils.DEG_TO_RAD / 2);
					shader.uniforms.spotLightPenumbra[spotCount] = light.penumbra !== undefined ? Math.sin(light.penumbra * MathUtils.DEG_TO_RAD / 4) : 0;

					spotCount++;
				}
			}

			if (shader.pointCount !== pointCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_POINT_LIGHTS = pointCount;
				shader.uniforms.pointLight.length = pointCount * 4;
				shader.uniforms.pointLightColor.length = pointCount * 4;
				shader.pointCount = pointCount;
			}
			if (shader.directionalCount !== directionalCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_DIRECTIONAL_LIGHTS = directionalCount;
				shader.uniforms.directionalLightDirection.length = directionalCount * 3;
				shader.uniforms.directionalLightColor.length = directionalCount * 4;
				shader.directionalCount = directionalCount;
			}
			if (shader.spotCount !== spotCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_SPOT_LIGHTS = spotCount;
				shader.uniforms.spotLight.length = spotCount * 4;
				shader.uniforms.spotLightColor.length = spotCount * 4;
				shader.uniforms.spotLightDirection.length = spotCount * 3;
				shader.uniforms.spotLightAngle.length = spotCount * 1;
				shader.spotCount = spotCount;
			}

			shader.defines = shader.defines || {};

			var shadowHandler = shaderInfo.shadowHandler;
			var shadowCount = shadowHandler.shadowResults.length;
			if (shadowCount > 0) {
				shader.defines.MAX_SHADOWS = shadowCount;

				shader.uniforms.shadowLightMatrices = [];
				shader.uniforms.shadowLightPositions = [];
				shader.uniforms.cameraScales = [];
				shader.uniforms.shadowMapSizes = [];
				for (var i = 0; i < shadowCount; i++) {
					var shadowData = shadowHandler.shadowLights[i].shadowSettings.shadowData;

					var matrix = shadowData.lightCamera.getViewProjectionMatrix().data;
					for (var j = 0; j < 16; j++) {
						shader.uniforms.shadowLightMatrices[i*16+j] = matrix[j];
					}

					var translationData = shadowData.lightCamera.translation.data;
					shader.uniforms.shadowLightPositions[i*3+0] = translationData[0];
					shader.uniforms.shadowLightPositions[i*3+1] = translationData[1];
					shader.uniforms.shadowLightPositions[i*3+2] = translationData[2];

					shader.uniforms.cameraScales[i] = 1.0 / (shadowData.lightCamera.far - shadowData.lightCamera.near);

					shader.uniforms.shadowMapSizes[i*2+0] = shadowHandler.shadowLights[i].shadowSettings.resolution[0];
					shader.uniforms.shadowMapSizes[i*2+1] = shadowHandler.shadowLights[i].shadowSettings.resolution[1];
				}
				shader.uniforms.shadowMaps = 'SHADOW_MAP';

				var type = 0;
				switch (shadowHandler.shadowType) {
					case 'VSM':
						type = 2;
					break;
					case 'PCF':
						type = 1;
					break;
					default:
						type = 0;
				}
				shader.defines.SHADOW_TYPE = type;
			} else if (shader.defines.MAX_SHADOWS) {
				delete shader.defines.MAX_SHADOWS;
			}
		},
		prevertex: [
			'#ifndef MAX_SHADOWS',
				'#define MAX_SHADOWS 0',
			"#endif",
			"#if MAX_SHADOWS > 0",
				'uniform mat4 shadowLightMatrices[MAX_SHADOWS];',
				'varying vec4 shadowLightDepths[MAX_SHADOWS];',
				'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);',
			"#endif"
		].join('\n'),
		vertex: [
			"#if MAX_SHADOWS > 0",
				'for (int i = 0; i < MAX_SHADOWS; i++) {',
					'shadowLightDepths[i] = ScaleMatrix * shadowLightMatrices[i] * worldPos;',
				'}',
			"#endif"
		].join('\n'),
		prefragment: [
			'uniform vec4 materialAmbient;',
			'uniform vec4 materialEmissive;',
			'uniform vec4 materialDiffuse;',
			'uniform vec4 materialSpecular;',
			'uniform float materialSpecularPower;',

			'#ifndef MAX_DIRECTIONAL_LIGHTS',
				'#define MAX_DIRECTIONAL_LIGHTS 0',
			"#endif",
			'#ifndef MAX_POINT_LIGHTS',
				'#define MAX_POINT_LIGHTS 0',
			"#endif",
			'#ifndef MAX_SPOT_LIGHTS',
				'#define MAX_SPOT_LIGHTS 0',
			"#endif",
			'#ifndef MAX_SHADOWS',
				'#define MAX_SHADOWS 0',
			"#endif",

			"#if MAX_DIRECTIONAL_LIGHTS > 0",
				"uniform vec4 directionalLightColor[MAX_DIRECTIONAL_LIGHTS];",
				"uniform vec3 directionalLightDirection[MAX_DIRECTIONAL_LIGHTS];",
			"#endif",
			"#if MAX_POINT_LIGHTS > 0",
				"uniform vec4 pointLight[MAX_POINT_LIGHTS];",
				"uniform vec4 pointLightColor[MAX_POINT_LIGHTS];",
			"#endif",
			"#if MAX_SPOT_LIGHTS > 0",
				"uniform vec4 spotLightColor[MAX_SPOT_LIGHTS];",
				"uniform vec4 spotLight[MAX_SPOT_LIGHTS];",
				"uniform vec3 spotLightDirection[MAX_SPOT_LIGHTS];",
				"uniform float spotLightAngle[MAX_SPOT_LIGHTS];",
				"uniform float spotLightPenumbra[MAX_SPOT_LIGHTS];",
			"#endif",

			"#if MAX_SHADOWS > 0",
				'#ifndef SHADOW_TYPE',
					'#define SHADOW_TYPE 0',
				"#endif",

				'uniform sampler2D shadowMaps[MAX_SHADOWS];',
				'uniform vec3 shadowLightPositions[MAX_SHADOWS];',
				'uniform float cameraScales[MAX_SHADOWS];',
				'varying vec4 shadowLightDepths[MAX_SHADOWS];',

				'#if SHADOW_TYPE == 1', // PCF
					'uniform vec2 shadowMapSizes[MAX_SHADOWS];',
				'#elif SHADOW_TYPE == 2', // VSM
					'float ChebychevInequality(in vec2 moments, in float t) {',
						'if ( t <= moments.x ) return 1.0;',
						'float variance = moments.y - (moments.x * moments.x);',
						'variance = max(variance, 0.02);',
						'float d = t - moments.x;',
						'return variance / (variance + d * d);',
					'}',

					// 'float VsmFixLightBleed(in float pMax, in float amount) {',
						// 'return clamp((pMax - amount) / (1.0 - amount), 0.0, 1.0);',
					// '}',
				"#endif",
			"#endif"
		].join('\n'),
		fragment: [
			'#if defined(SPECULAR_MAP) && defined(TEXCOORD0)',
				'float specularStrength = texture2D(specularMap, texCoord0).x;',
			'#else',
				'float specularStrength = 1.0;',
			'#endif',

			"#if MAX_POINT_LIGHTS > 0",
				"vec3 pointDiffuse  = vec3(0.0);",
				"vec3 pointSpecular = vec3(0.0);",

				"for (int i = 0; i < MAX_POINT_LIGHTS; i++) {",
					'vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);',
					"float lDistance = 1.0 - min((length(pointLight[i].xyz - vWorldPos.xyz) / pointLight[i].w), 1.0);",
					// "vec3 lVector = normalize(vPointLight[i].xyz);",
					// "float lDistance = vPointLight[i].w;",

					// diffuse
					"float dotProduct = dot(N, lVector);",

					"#ifdef WRAP_AROUND",
						"float pointDiffuseWeightFull = max(dotProduct, 0.0);",
						"float pointDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);",

						"vec3 pointDiffuseWeight = mix(vec3(pointDiffuseWeightFull), vec3(pointDiffuseWeightHalf), wrapRGB);",
					"#else",
						"float pointDiffuseWeight = max(dotProduct, 0.0);",
					"#endif",

					"pointDiffuse += materialDiffuse.rgb * pointLightColor[i].rgb * pointDiffuseWeight * lDistance;",

					// specular
					"vec3 pointHalfVector = normalize(lVector + normalize(viewPosition));",
					"float pointDotNormalHalf = max(dot(N, pointHalfVector), 0.0);",
					"float pointSpecularWeight = pointLightColor[i].a * specularStrength * max(pow(pointDotNormalHalf, materialSpecularPower), 0.0);",

					"#ifdef PHYSICALLY_BASED_SHADING",
						"float specularNormalization = (materialSpecularPower + 2.0001 ) / 8.0;",
						"vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, pointHalfVector), 5.0);",
						"pointSpecular += schlick * pointLightColor[i].rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;",
					"#else",
						"pointSpecular += materialSpecular.rgb * pointLightColor[i].rgb * pointSpecularWeight * pointDiffuseWeight * lDistance;",
					"#endif",
				"}",
			"#endif",

			"#if MAX_SPOT_LIGHTS > 0",
				"vec3 spotDiffuse  = vec3(0.0);",
				"vec3 spotSpecular = vec3(0.0);",

				"for (int i = 0; i < MAX_SPOT_LIGHTS; i++) {",
					'vec3 lVector = normalize(spotLight[i].xyz - vWorldPos.xyz);',
					"float lDistance = 1.0 - min((length(spotLight[i].xyz - vWorldPos.xyz) / spotLight[i].w), 1.0);",
					// "vec3 lVector = normalize(vSpotLight[i].xyz);",
					// "float lDistance = vSpotLight[i].w;",

					// "float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",
					"float spotEffect = dot(normalize(-spotLightDirection[i]), lVector);",

					// 'spotDiffuse = vec3(spotEffect);',

					"if (spotEffect > spotLightAngle[i]) {",
						//"spotEffect = clamp(spotEffect/1.0, 1.0, 0.0);",

						"if (spotLightPenumbra[i] > 0.0) {",
							"spotEffect = (spotEffect - spotLightAngle[i]) / spotLightPenumbra[i];",
							"spotEffect = clamp(spotEffect, 0.0, 1.0);",
						"} else {",
							"spotEffect = 1.0;",
						"}",

						// diffuse
						"float dotProduct = dot(N, lVector);",

						"#ifdef WRAP_AROUND",
							"float spotDiffuseWeightFull = max(dotProduct, 0.0);",
							"float spotDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);",

							"vec3 spotDiffuseWeight = mix(vec3(spotDiffuseWeightFull), vec3(spotDiffuseWeightHalf), wrapRGB);",
						"#else",
							"float spotDiffuseWeight = max(dotProduct, 0.0);",
						"#endif",

						"spotDiffuse += materialDiffuse.rgb * spotLightColor[i].rgb * spotDiffuseWeight * lDistance * spotEffect;",

						// specular
						"vec3 spotHalfVector = normalize(lVector + normalize(viewPosition));",
						"float spotDotNormalHalf = max(dot(N, spotHalfVector), 0.0);",
						"float spotSpecularWeight = spotLightColor[i].a * specularStrength * max(pow(spotDotNormalHalf, materialSpecularPower), 0.0);",

						"#ifdef PHYSICALLY_BASED_SHADING",
							"float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;",
							"vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, spotHalfVector), 5.0);",
							"spotSpecular += schlick * spotLightColor[i].rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;",
						"#else",
							"spotSpecular += materialSpecular.rgb * spotLightColor[i].rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect;",
						"#endif",
					"}",
				"}",
			"#endif",

			"#if MAX_DIRECTIONAL_LIGHTS > 0",
				"vec3 dirDiffuse  = vec3(0.0);",
				"vec3 dirSpecular = vec3(0.0);" ,

				"for(int i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++) {",
					"vec4 lDirection = vec4(-directionalLightDirection[i], 0.0);",
					// "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
					"vec3 dirVector = normalize(lDirection.xyz);",

					// diffuse
					"float dotProduct = dot(N, dirVector);",

					"#ifdef WRAP_AROUND",
						"float dirDiffuseWeightFull = max(dotProduct, 0.0);",
						"float dirDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);",

						"vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapRGB);",
					"#else",
						"float dirDiffuseWeight = max(dotProduct, 0.0);",
					"#endif",

					"dirDiffuse += materialDiffuse.rgb * directionalLightColor[i].rgb * dirDiffuseWeight;",

					// specular
					"vec3 dirHalfVector = normalize(dirVector + normalize(viewPosition));",
					"float dirDotNormalHalf = max(dot(N, dirHalfVector), 0.0);",
					"float dirSpecularWeight = directionalLightColor[i].a * specularStrength * max(pow(dirDotNormalHalf, materialSpecularPower), 0.0);",

					"#ifdef PHYSICALLY_BASED_SHADING",
						"float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;",
						//"dirSpecular += materialSpecular.rgb * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;",
						"vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(dirVector, dirHalfVector), 5.0);",
						"dirSpecular += schlick * directionalLightColor[i].rgb * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",
					"#else",
						"dirSpecular += materialSpecular.rgb * directionalLightColor[i].rgb * dirSpecularWeight * dirDiffuseWeight;",
					"#endif",
				"}",
			"#endif",

			"vec3 totalDiffuse = vec3(0.0);",
			"vec3 totalSpecular = vec3(0.0);",

			"#if MAX_DIRECTIONAL_LIGHTS > 0",
				"totalDiffuse += dirDiffuse;",
				"totalSpecular += dirSpecular;",
			"#endif",
			"#if MAX_POINT_LIGHTS > 0",
				"totalDiffuse += pointDiffuse;",
				"totalSpecular += pointSpecular;",
			"#endif",
			"#if MAX_SPOT_LIGHTS > 0",
				"totalDiffuse += spotDiffuse;",
				"totalSpecular += spotSpecular;",
			"#endif",

			// 'if (shadowLightDepths[i].w > 0.0) {',
			// 	'final_color.rgb *= texture2D(normalMap, depth.xy).rgb;',
			// '}',

			'float shadow = 1.0;',
			"#if MAX_SHADOWS > 0",
				'for (int i = 0; i < MAX_SHADOWS; i++) {',
					'vec3 depth = shadowLightDepths[i].xyz / shadowLightDepths[i].w;',
					'depth.z = length(vWorldPos.xyz - shadowLightPositions[i]) * cameraScales[i];',

					'if (depth.x >= 0.0 && depth.x <= 1.0 && depth.y >= 0.0 && depth.y <= 1.0 && depth.z >= 0.0 && depth.z <= 1.0) {',
						'#if SHADOW_TYPE == 0', // Normal
							'depth.z *= 0.96;',
							'float shadowDepth = texture2D(shadowMaps[i], depth.xy).x;',
							'if ( depth.z > shadowDepth ) shadow *= 0.5;',
						'#elif SHADOW_TYPE == 1', // PCF TODO
							'depth.z *= 0.96;',
							'float shadowPcf = 0.0;',
							'const float shadowDelta = 1.0 / 9.0;',
							'float xPixelOffset = 1.0 / shadowMapSizes[i].x;',
							'float yPixelOffset = 1.0 / shadowMapSizes[i].y;',

							'float dx0 = -1.25 * xPixelOffset;',
							'float dy0 = -1.25 * yPixelOffset;',
							'float dx1 = 1.25 * xPixelOffset;',
							'float dy1 = 1.25 * yPixelOffset;',

							'float fDepth = 0.0;',

							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx0, dy0)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(0.0, dy0)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx1, dy0)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx0, 0.0)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth =  texture2D(shadowMaps[i], depth.xy).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx1, 0.0)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx0, dy1)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(0.0, dy1)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'fDepth = texture2D(shadowMaps[i], depth.xy + vec2(dx1, dy1)).r;',
							'if (fDepth < depth.z) shadowPcf += shadowDelta;',
							'shadow *= (1.0 - shadowPcf) * 0.5 + 0.5;',
						'#elif SHADOW_TYPE == 2', // VSM
							'vec4 texel = texture2D(shadowMaps[i], depth.xy);',
							'vec2 moments = vec2(texel.x, texel.y);',
							'shadow *= ChebychevInequality(moments, depth.z);',
							// 'shadow = VsmFixLightBleed(shadow, 0.1);',
							// 'shadow = pow(shadow, 8.0);',
						'#endif',
					'}',
				'}',
				'shadow = clamp(shadow, 0.0, 1.0);',
			'#endif',

			"vec3 ambientLightColor = vec3(1.0, 1.0, 1.0);",
			"#ifdef METAL",
				"final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse * shadow + ambientLightColor * materialAmbient.rgb + totalSpecular * shadow);",
			"#else",
				"final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse * shadow + ambientLightColor * materialAmbient.rgb) + totalSpecular * shadow;",
			"#endif"
		].join('\n')
	};

	ShaderBuilder.animation = {
		processor: function(shader, shaderInfo) {
			var pose = shaderInfo.currentPose;
			shader.defines = shader.defines || {};
			if (pose) {
				if (!shader.uniforms.jointPalette) {
					shader.uniforms.jointPalette = ShaderBuilder.animation.jointPalette;
				}
				shader.defines.JOINT_COUNT = Math.max(shaderInfo.meshData.paletteMap.length * 3, 80);
			} else {
				delete shader.defines.JOINT_COUNT;
			}
		},
		jointPalette: function (shaderInfo) {
			var skMesh = shaderInfo.meshData;
			var pose = shaderInfo.currentPose;
			if (pose) {
				var palette = pose._matrixPalette;
				var store = skMesh.store;
				if (!store) {
					store = new Float32Array(skMesh.paletteMap.length*12);
					skMesh.store = store;
				}
				var refMat;
				for (var index = 0; index < skMesh.paletteMap.length; index++) {
					refMat = palette[skMesh.paletteMap[index]];
					for (var i = 0; i < 12; i++) {
						store[index * 12 + i] = refMat.data[ShaderBuilder.animation.order[i]];
					}
					/*
					for (var row = 0; row < 3; row++) {
						for (var col = 0; col < 4; col++) {
							// Transposed, so we can pad with translation
							store[index * 12 + row * 4 + col] = refMat.data[col * 4 + row];
						}
					}*/
				}
				return store;
			}
		},
		order: [
			0,4,8,12,
			1,5,9,13,
			2,6,10,14
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

			'mat4 mat = mat4(0.0);',

			'mat += mat4(',
			'	jointPalette[x+0].x, jointPalette[x+1].x, jointPalette[x+2].x, 0,',
			'	jointPalette[x+0].y, jointPalette[x+1].y, jointPalette[x+2].y, 0,',
			'	jointPalette[x+0].z, jointPalette[x+1].z, jointPalette[x+2].z, 0,',
			'	jointPalette[x+0].w, jointPalette[x+1].w, jointPalette[x+2].w, 1',
			') * vertexWeights.x;',
			'mat += mat4(',
			'	jointPalette[y+0].x, jointPalette[y+1].x, jointPalette[y+2].x, 0,',
			'	jointPalette[y+0].y, jointPalette[y+1].y, jointPalette[y+2].y, 0,',
			'	jointPalette[y+0].z, jointPalette[y+1].z, jointPalette[y+2].z, 0,',
			'	jointPalette[y+0].w, jointPalette[y+1].w, jointPalette[y+2].w, 1',
			') * vertexWeights.y;',
			'mat += mat4(',
			'	jointPalette[z+0].x, jointPalette[z+1].x, jointPalette[z+2].x, 0,',
			'	jointPalette[z+0].y, jointPalette[z+1].y, jointPalette[z+2].y, 0,',
			'	jointPalette[z+0].z, jointPalette[z+1].z, jointPalette[z+2].z, 0,',
			'	jointPalette[z+0].w, jointPalette[z+1].w, jointPalette[z+2].w, 1',
			') * vertexWeights.z;',
			'mat += mat4(',
			'	jointPalette[w+0].x, jointPalette[w+1].x, jointPalette[w+2].x, 0,',
			'	jointPalette[w+0].y, jointPalette[w+1].y, jointPalette[w+2].y, 0,',
			'	jointPalette[w+0].z, jointPalette[w+1].z, jointPalette[w+2].z, 0,',
			'	jointPalette[w+0].w, jointPalette[w+1].w, jointPalette[w+2].w, 1',
			') * vertexWeights.w;',

			'wMatrix = wMatrix * mat / mat[3][3];',
			'#ifdef NORMAL',
				'nMatrix = nMatrix * mat / mat[3][3];',
			'#endif',
			'#endif'
		].join('\n')
	};
	return ShaderBuilder;
});