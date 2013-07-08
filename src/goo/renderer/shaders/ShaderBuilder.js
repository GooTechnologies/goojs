define([
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/MeshData',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/math/MathUtils',
	'goo/util/TangentGenerator'
],
/** @lends */
function(
	ShaderFragment,
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

	ShaderBuilder.uber = {
		processor: function (shader, shaderInfo) {
			var attributeMap = shaderInfo.meshData.attributeMap;
			var textureMaps = shaderInfo.material._textureMaps;

			shader.defines = shader.defines || {};

			for (var attribute in attributeMap) {
				if (!shader.defines[attribute]) {
					shader.defines[attribute] = true;
				}
			}

			for (var type in textureMaps) {
				if (!shader.defines[type]) {
					shader.defines[type] = true;
				}
			}

			// Exclude in a nicer way
			for (var attribute in shader.defines) {
				if (attribute === 'MAX_POINT_LIGHTS' ||
					attribute === 'MAX_DIRECTIONAL_LIGHTS' ||
					attribute === 'MAX_SPOT_LIGHTS') {
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
			shader.uniforms.spotLightExponent = shader.uniforms.spotLightExponent || [];

			// Use default light?
			// var lights = shaderInfo.lights.length > 0 ? shaderInfo.lights : [ShaderBuilder.defaultLight];
			var lights = shaderInfo.lights;
			for (var i = 0; i < lights.length; i++) {
				var light = lights[i];

				if (light instanceof PointLight) {
					shader.uniforms.pointLight[pointCount * 4 + 0] = light.translation.x;
					shader.uniforms.pointLight[pointCount * 4 + 1] = light.translation.y;
					shader.uniforms.pointLight[pointCount * 4 + 2] = light.translation.z;
					shader.uniforms.pointLight[pointCount * 4 + 3] = light.range;

					shader.uniforms.pointLightColor[pointCount * 4 + 0] = light.color.r * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 1] = light.color.g * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 2] = light.color.b * light.intensity;
					shader.uniforms.pointLightColor[pointCount * 4 + 3] = light.specularIntensity;

					pointCount++;
				} else if (light instanceof DirectionalLight) {
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 0] = light.direction.x;
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 1] = light.direction.y;
					shader.uniforms.directionalLightDirection[directionalCount * 3 + 2] = light.direction.z;

					shader.uniforms.directionalLightColor[directionalCount * 4 + 0] = light.color.r * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 1] = light.color.g * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 2] = light.color.b * light.intensity;
					shader.uniforms.directionalLightColor[directionalCount * 4 + 3] = light.specularIntensity;

					directionalCount++;
				} else if (light instanceof SpotLight) {
					shader.uniforms.spotLight[spotCount * 4 + 0] = light.translation.x;
					shader.uniforms.spotLight[spotCount * 4 + 1] = light.translation.y;
					shader.uniforms.spotLight[spotCount * 4 + 2] = light.translation.z;
					shader.uniforms.spotLight[spotCount * 4 + 3] = light.range;

					shader.uniforms.spotLightColor[spotCount * 4 + 0] = light.color.r * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 1] = light.color.g * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 2] = light.color.b * light.intensity;
					shader.uniforms.spotLightColor[spotCount * 4 + 3] = light.specularIntensity;

					shader.uniforms.spotLightDirection[spotCount * 3 + 0] = light.direction.x;
					shader.uniforms.spotLightDirection[spotCount * 3 + 1] = light.direction.y;
					shader.uniforms.spotLightDirection[spotCount * 3 + 2] = light.direction.z;

					shader.uniforms.spotLightAngle[spotCount] = Math.cos(light.angle * MathUtils.DEG_TO_RAD);
					shader.uniforms.spotLightExponent[spotCount] = light.exponent;

					spotCount++;
				}
			}

			if (shader.pointCount !== pointCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_POINT_LIGHTS = pointCount;
				shader.uniforms.pointLight.length = pointCount * 4;
				shader.uniforms.pointLightColor.length = pointCount * 4;
				shader.pointCount = pointCount;
				// shader.rebuild();
			}
			if (shader.directionalCount !== directionalCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_DIRECTIONAL_LIGHTS = directionalCount;
				shader.uniforms.directionalLightDirection.length = directionalCount * 3;
				shader.uniforms.directionalLightColor.length = directionalCount * 4;
				shader.directionalCount = directionalCount;
				// shader.rebuild();
			}
			if (shader.spotCount !== spotCount) {
				shader.defines = shader.defines || {};
				shader.defines.MAX_SPOT_LIGHTS = spotCount;
				shader.uniforms.spotLight.length = spotCount * 4;
				shader.uniforms.spotLightColor.length = spotCount * 4;
				shader.uniforms.spotLightDirection.length = spotCount * 3;
				shader.uniforms.spotLightAngle.length = spotCount * 1;
				shader.uniforms.spotLightExponent.length = spotCount * 1;
				shader.spotCount = spotCount;
				// shader.rebuild();
			}
		},
		prevertex: [
			// '#ifndef MAX_POINT_LIGHTS',
			// 	'#define MAX_POINT_LIGHTS 0',
			// "#endif",
			// '#ifndef MAX_SPOT_LIGHTS',
			// 	'#define MAX_SPOT_LIGHTS 0',
			// "#endif",

			// "#if MAX_POINT_LIGHTS > 0",
			// 	"uniform vec4 pointLight[MAX_POINT_LIGHTS];",
			// 	"varying vec4 vPointLight[MAX_POINT_LIGHTS];",
			// "#endif",
			// "#if MAX_SPOT_LIGHTS > 0",
			// 	"uniform vec4 spotLight[MAX_SPOT_LIGHTS];",
			// 	"varying vec4 vSpotLight[MAX_SPOT_LIGHTS];",
			// "#endif"
		].join('\n'),
		vertex: [
			// "#if MAX_POINT_LIGHTS > 0",
			// 	"for(int i = 0; i < MAX_POINT_LIGHTS; i++) {",
			// 		'vec3 lightVec = pointLight[i].xyz - worldPos.xyz;',
			// 		"float lightDist = 1.0 - min((length(lightVec) / pointLight[i].w), 1.0);",
			// 		"vPointLight[i] = vec4(lightVec, lightDist);",
			// 	"}",
			// "#endif",
			// "#if MAX_SPOT_LIGHTS > 0",
			// 	"for(int i = 0; i < MAX_SPOT_LIGHTS; i++) {",
			// 		'vec3 lightVec = spotLight[i].xyz - worldPos.xyz;',
			// 		"float lightDist = 1.0 - min((length(lightVec) / spotLight[i].w), 1.0);",
			// 		"vSpotLight[i] = vec4(lightVec, lightDist);",
			// 	"}",
			// "#endif"
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

			"#if MAX_DIRECTIONAL_LIGHTS > 0",
				"uniform vec4 directionalLightColor[MAX_DIRECTIONAL_LIGHTS];",
				"uniform vec3 directionalLightDirection[MAX_DIRECTIONAL_LIGHTS];",
			"#endif",
			"#if MAX_POINT_LIGHTS > 0",
				"uniform vec4 pointLight[MAX_POINT_LIGHTS];",
				"uniform vec4 pointLightColor[MAX_POINT_LIGHTS];",
				"varying vec4 vPointLight[MAX_POINT_LIGHTS];",
			"#endif",
			"#if MAX_SPOT_LIGHTS > 0",
				"uniform vec4 spotLightColor[MAX_SPOT_LIGHTS];",
				"uniform vec4 spotLight[MAX_SPOT_LIGHTS];",
				"uniform vec3 spotLightDirection[MAX_SPOT_LIGHTS];",
				"uniform float spotLightAngle[MAX_SPOT_LIGHTS];",
				"uniform float spotLightExponent[MAX_SPOT_LIGHTS];",
				"varying vec4 vSpotLight[MAX_SPOT_LIGHTS];",
			"#endif"
		].join('\n'),
		fragment: [
			'#ifdef SPECULAR_MAP',
				'float specularStrength = texture2D(specularMap, texCoord0).x;',
			'#else',
				'float specularStrength = 1.0;',
			'#endif',

			"#if MAX_POINT_LIGHTS > 0",
				"vec3 pointDiffuse  = vec3(0.0);",
				"vec3 pointSpecular = vec3(0.0);",

				"for (int i = 0; i < MAX_POINT_LIGHTS; i++) {",
					'vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);',
					"float lDistance = 1.0 - min((length(lVector) / pointLight[i].w), 1.0);",
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
					"vec3 pointHalfVector = normalize(lVector + viewPosition);",
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
					"float lDistance = 1.0 - min((length(lVector) / spotLight[i].w), 1.0);",
					// "vec3 lVector = normalize(vSpotLight[i].xyz);",
					// "float lDistance = vSpotLight[i].w;",

					// "float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",
					"float spotEffect = dot( normalize(-spotLightDirection[i]), lVector);",

					// 'spotDiffuse = vec3(spotEffect);',

					"if (spotEffect > spotLightAngle[i]) {",
						"spotEffect = max(pow(spotEffect, spotLightExponent[i]), 0.0);",

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
						"vec3 spotHalfVector = normalize(lVector + viewPosition);",
						"float spotDotNormalHalf = max( dot(N, spotHalfVector), 0.0);",
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
					"vec4 lDirection = vec4(directionalLightDirection[i], 0.0);",
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
					"vec3 dirHalfVector = normalize(dirVector + viewPosition);",
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

			"vec3 ambientLightColor = vec3(1.0, 1.0, 1.0);",
			"#ifdef METAL",
				"final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse + ambientLightColor * materialAmbient.rgb + totalSpecular);",
			"#else",
				"final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse + ambientLightColor * materialAmbient.rgb) + totalSpecular;",
			"#endif"
		].join('\n')
	};

	ShaderBuilder.shadow = {
		processor: function (shader, shaderInfo) {
			var textureMaps = shaderInfo.material._textureMaps;
			shader.defines = shader.defines || {};

			if (textureMaps.SHADOW_MAP !== undefined && !shader.defines.SHADOW_MAP) {
				shader.defines.SHADOW_MAP = true;

				shader.uniforms.viewMatrix = 'VIEW_MATRIX';
				shader.uniforms.projectionMatrix = 'PROJECTION_MATRIX';
				shader.uniforms.lightViewMatrix = 'LIGHT_VIEW_MATRIX';
				shader.uniforms.lightProjectionMatrix = 'LIGHT_PROJECTION_MATRIX';
				shader.uniforms.shadowMap = 'SHADOW_MAP';

				shader.uniforms.depthControl = 950.0;
				shader.uniforms.attenuationPower = 500.0;
			} else if (textureMaps.SHADOW_MAP === undefined && shader.defines.SHADOW_MAP) {
				delete shader.defines.SHADOW_MAP;
			}
		},
		prevertex: [
		].join('\n'),
		vertex: [
		].join('\n'),
		prefragment: [
			"#ifdef SHADOW_MAP",
				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 lightViewMatrix;', //
				'uniform mat4 lightProjectionMatrix;',//

				'uniform sampler2D shadowMap;',//
				'uniform float depthControl;',
				'uniform float attenuationPower;',

				'const float PI = 3.1415926535897932384626;',

		        'float linstep(float low, float high, float v){',
		        '    return clamp((v-low)/(high-low), 0.0, 1.0);',
		        '}',

		        'float VSM(sampler2D depths, vec2 uv, float compare){',
		        '    vec2 moments = texture2D(depths, uv).xy;',
		        '    float p = smoothstep(compare-0.02, compare, moments.x);',
		        '    float variance = max(moments.y - moments.x*moments.x, -0.001);',
		        '    float d = compare - moments.x;',
		        '    float p_max = linstep(0.3, 1.0, variance / (variance + d*d));',
		        '    return clamp(max(p, p_max), 0.0, 1.0);',
		        '}',
			"#endif"
		].join('\n'),
		fragment: [
			'#ifdef SHADOW_MAP',
			'	vec3 camPos = (viewMatrix * vec4(vWorldPos, 1.0)).xyz;',
			'	vec3 lightPos = (lightViewMatrix * vec4(vWorldPos, 1.0)).xyz;',
            '	vec3 lightPosNormal = normalize(lightPos);',
			'	vec4 lightDevice = lightProjectionMatrix * vec4(lightPos, 1.0);',
			'	vec2 lightDeviceNormal = lightDevice.xy/lightDevice.w;',
			'	vec2 lightUV = lightDeviceNormal*0.5+0.5;',

			'	float lightDepth2 = clamp(length(lightPos) / depthControl, 0.0, 1.0);',
			'	float illuminated = VSM(shadowMap, lightUV, lightDepth2);// * 0.8 + 0.2;',

			'	final_color.rgb *= vec3(illuminated);',
			// '	final_color.rgb *= vec3(lightDepth2);',
			'#endif'
		].join('\n')
	};

	return ShaderBuilder;
});