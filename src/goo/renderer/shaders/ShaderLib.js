define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/shaders/ShaderBuilder'
],
	/** @lends */
	function (
		MeshData,
		Shader,
		ShaderFragment,
		ShaderBuilder
		) {
	'use strict';

	/**
	 * @class Collection of useful shaders<br>
	 * Details of each can be printed like this for example: console.log(ShaderLib.texturedLit).<br>
	 * There are more special purpose shaders in {@link ShaderLibExtra}
	 */
	function ShaderLib() {}

	/**
	 * The uber shader is the default Goo shader supporting the most common realistic render features.
	 * It supports lights, animations, reflective materials, normal, diffuse, AO and light textures, transparency, fog and shadows.
	 * @static
	 */
	ShaderLib.uber = {
		processors: [
			ShaderBuilder.uber.processor,
			ShaderBuilder.light.processor,
			ShaderBuilder.animation.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL,
			vertexTangent: MeshData.TANGENT,
			vertexColor: MeshData.COLOR,
			vertexUV0: MeshData.TEXCOORD0,
			vertexUV1: MeshData.TEXCOORD1,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			normalMatrix: Shader.NORMAL_MATRIX,
			cameraPosition: Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP,
			offsetRepeat : [0,0,1,1],
			normalMap : Shader.NORMAL_MAP,
			normalMultiplier: 1.0,
			specularMap : Shader.SPECULAR_MAP,
			emissiveMap : Shader.EMISSIVE_MAP,
			aoMap : Shader.AO_MAP,
			lightMap : Shader.LIGHT_MAP,
			environmentCube : 'ENVIRONMENT_CUBE',
			environmentSphere : 'ENVIRONMENT_SPHERE',
			reflectionMap : 'REFLECTION_MAP',
			transparencyMap : 'TRANSPARENCY_MAP',
			opacity: 1.0,
			reflectivity: 0.0,
			refractivity: 0.0,
			etaRatio: -0.5,
			fresnel: 0.0,
			discardThreshold: -0.01,
			fogSettings: [0, 10000],
			fogColor: [1, 1, 1],
			shadowDarkness: 0.5,
			vertexColorAmount: 1.0,
			lodBias: 0.0,
			wrapSettings: [0.5, 0.0],

			bmin: [-1, -1, -1],
			bmax: [1, 1, 1],
			mods: [0, 0, 0]
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
			'attribute vec3 vertexPosition;',

			'#ifdef NORMAL',
				'attribute vec3 vertexNormal;',
			'#endif',
			'#ifdef TANGENT',
				'attribute vec4 vertexTangent;',
			'#endif',
			'#ifdef COLOR',
				'attribute vec4 vertexColor;',
			'#endif',
			'#ifdef TEXCOORD0',
				'attribute vec2 vertexUV0;',
				'uniform vec4 offsetRepeat;',
				'varying vec2 texCoord0;',
			'#endif',
			'#ifdef TEXCOORD1',
				'attribute vec2 vertexUV1;',
				'varying vec2 texCoord1;',
			'#endif',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat4 normalMatrix;',
			'uniform vec3 cameraPosition;',

			'varying vec3 vWorldPos;',
			'varying vec3 viewPosition;',
			'#ifdef NORMAL',
			'varying vec3 normal;',
			'#endif',
			'#ifdef TANGENT',
			'varying vec3 binormal;',
			'varying vec3 tangent;',
			'#endif',
			'#ifdef COLOR',
			'varying vec4 color;',
			'#endif',

			ShaderBuilder.light.prevertex,

			ShaderBuilder.animation.prevertex,

			'uniform vec3 bmin;',
			'uniform vec3 bmax;',
			'uniform vec3 mods;',
			'#define M_PI 3.14159265358979323846264338328',

			'mat3 rotationMatrix(vec3 axis, float angle) {',
				'axis = normalize(axis);',
				'float s = sin(angle);',
				'float c = cos(angle);',
				'float oc = 1.0 - c;',
				'return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,',
					'oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,',
					'oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);',
			'}',

			'void main(void) {',
				'mat4 wMatrix = worldMatrix;',
				'#ifdef NORMAL',
					'mat4 nMatrix = normalMatrix;',
				'#endif',
				ShaderBuilder.animation.vertex,

				'vec3 vpos = vertexPosition;',
				'vec3 vnorm = vertexNormal;',

				// 'vec3 lim = M_PI * 2.0 * (vpos) / (bmax - bmin);',

				// 'vpos.z += 5.0;',
				// 'vpos.y += bmin.y;',

				// 'mat3 rotmat = mat3(0.0);',

				// 'rotmat = rotationMatrix(vec3(0.0, 1.0, 0.0), (lim.x) * mods.x);',
				// 'vpos = rotmat * vpos;',
				// 'vnorm = rotmat * vnorm;',
				// 'rotmat = rotationMatrix(vec3(0.0, 1.0, 0.0), lim.z * mods.x);',
				// 'vpos = rotmat * vpos;',
				// 'vnorm = rotmat * vnorm;',
				// 'rotmat = rotationMatrix(vec3(1.0, 0.0, 0.0), lim.y * 0.0);',
				// 'vpos = rotmat * vpos;',
				// 'vnorm = rotmat * vnorm;',

				// 'vpos.z -= 5.0;',
				// 'vpos.y -= bmin.y;',

				'vec4 worldPos = wMatrix * vec4(vpos, 1.0);',
				'vWorldPos = worldPos.xyz;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'viewPosition = cameraPosition - worldPos.xyz;',

				'#ifdef NORMAL',
				'	normal = normalize((nMatrix * vec4(vnorm, 0.0)).xyz);',
				'#endif',
				'#ifdef TANGENT',
				'	tangent = normalize((nMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);',
				'	binormal = cross(normal, tangent) * vec3(vertexTangent.w);',
				'#endif',
				'#ifdef COLOR',
				'	color = vertexColor;',
				'#endif',
				'#ifdef TEXCOORD0',
				'	texCoord0 = vertexUV0 * offsetRepeat.zw + offsetRepeat.xy;',
				'#endif',
				'#ifdef TEXCOORD1',
				'	texCoord1 = vertexUV1;',
				'#endif',

				ShaderBuilder.light.vertex,
			'}'
		].join('\n');
		},
		fshader: function () {
			return [
			'uniform float lodBias;',
			'#ifdef DIFFUSE_MAP',
				'uniform sampler2D diffuseMap;',
			'#endif',
			'#ifdef NORMAL_MAP',
				'uniform sampler2D normalMap;',
				'uniform float normalMultiplier;',
			'#endif',
			'#ifdef SPECULAR_MAP',
				'uniform sampler2D specularMap;',
			'#endif',
			'#ifdef EMISSIVE_MAP',
				'uniform sampler2D emissiveMap;',
			'#endif',
			'#ifdef AO_MAP',
				'uniform sampler2D aoMap;',
			'#endif',
			'#ifdef LIGHT_MAP',
				'uniform sampler2D lightMap;',
			'#endif',
			'#ifdef TRANSPARENCY_MAP',
				'uniform sampler2D transparencyMap;',
			'#endif',
			'#ifdef REFLECTIVE',
				'#ifdef ENVIRONMENT_CUBE',
					'uniform samplerCube environmentCube;',
				'#elif defined(ENVIRONMENT_SPHERE)',
					'uniform sampler2D environmentSphere;',
				'#endif',
				'uniform vec4 clearColor;',
				'uniform float reflectivity;',
				'uniform float fresnel;',
				'uniform float refractivity;',
				'uniform float etaRatio;',
				'#ifdef REFLECTION_MAP',
					'uniform sampler2D reflectionMap;',
				'#endif',
			'#endif',

			'#ifdef OPACITY',
				'uniform float opacity;',
			'#endif',
			'#ifdef DISCARD',
				'uniform float discardThreshold;',
			'#endif',

			'#ifdef FOG',
				'uniform vec2 fogSettings;',
				'uniform vec3 fogColor;',
			'#endif',

			'varying vec3 vWorldPos;',
			'varying vec3 viewPosition;',
			'#ifdef NORMAL',
				'varying vec3 normal;',
			'#endif',
			'#ifdef TANGENT',
				'varying vec3 binormal;',
				'varying vec3 tangent;',
			'#endif',
			'#ifdef COLOR',
				'varying vec4 color;',
				'uniform float vertexColorAmount;',
			'#endif',
			'#ifdef TEXCOORD0',
				'varying vec2 texCoord0;',
			'#endif',
			'#ifdef TEXCOORD1',
				'varying vec2 texCoord1;',
			'#endif',

			'#define M_PI 3.14159265358979323846264338328',

			ShaderBuilder.light.prefragment,

			'void main(void)',
			'{',
				'vec4 final_color = vec4(1.0);',

				'#if defined(DIFFUSE_MAP) && defined(TEXCOORD0)',
					'final_color *= texture2D(diffuseMap, texCoord0, lodBias);',
				'#endif',

				'#ifdef COLOR',
					'final_color *= mix(vec4(1.0), color, vertexColorAmount);',
				'#endif',

				'#if defined(TRANSPARENCY_MAP) && defined(TEXCOORD0)',
					'final_color.a = texture2D(transparencyMap, texCoord0).a;',
				'#endif',
				'#ifdef OPACITY',
					'final_color.a *= opacity;',
				'#endif',

				'#ifdef DISCARD',
					'if (final_color.a < discardThreshold) discard;',
				'#endif',

				'#ifdef AO_MAP',
					'#ifdef TEXCOORD1',
						'final_color.rgb *= texture2D(aoMap, texCoord1).rgb;',
					'#elif defined(TEXCOORD0)',
						'final_color.rgb *= texture2D(aoMap, texCoord0).rgb;',
					'#endif',
				'#endif',

				'#ifdef LIGHT_MAP',
					'#ifdef TEXCOORD1',
						'final_color.rgb *= texture2D(lightMap, texCoord1).rgb * 2.0 - 0.5;',
					'#elif defined(TEXCOORD0)',
						'final_color.rgb *= texture2D(lightMap, texCoord0).rgb * 2.0 - 0.5;',
					'#endif',
				'#else',
					'vec3 N = vec3(0.0, 1.0, 0.0);',
					'#if defined(NORMAL)', // Do nasty doublework for IE compliance
						'N = normalize(normal);',
					'#endif',
					'#if defined(TANGENT) && defined(NORMAL_MAP) && defined(TEXCOORD0)',
						'mat3 tangentToWorld = mat3(tangent, binormal, normal);',
						'vec3 tangentNormal = texture2D(normalMap, texCoord0, lodBias).xyz * vec3(2.0) - vec3(1.0);',
						'tangentNormal.xy *= normalMultiplier;',
						'vec3 worldNormal = (tangentToWorld * tangentNormal);',
						'N = normalize(worldNormal);',
					// '#elif defined(NORMAL)',
						// 'N = normalize(normal);',
					// '#endif',
					'#endif',

					ShaderBuilder.light.fragment,
				'#endif',

				'#ifdef REFLECTIVE',
					'if (refractivity > 0.0) {',
						'vec4 environment = vec4(0.0);',
						'#ifdef ENVIRONMENT_CUBE',
							'vec3 refractionVector = refract(normalize(viewPosition), N, etaRatio);',
							'refractionVector.x = -refractionVector.x;',
							'environment = textureCube(environmentCube, refractionVector);',
						'#elif defined(ENVIRONMENT_SPHERE)',
							'vec3 refractionVector = refract(normalize(viewPosition), N, etaRatio);',
							'refractionVector = -refractionVector;',
							'float xx = (atan(refractionVector.z, refractionVector.x) + M_PI) / (2.0 * M_PI);',
							'float yy = refractionVector.y * 0.5 + 0.5;',
							'environment = texture2D(environmentSphere, vec2(xx, yy));',
						'#endif',
						'environment.rgb = mix(clearColor.rgb, environment.rgb, environment.a);',

						'final_color.rgb = mix(final_color.rgb, environment.rgb, refractivity);',
					'}',

					'if (reflectivity > 0.0) {',
						'vec4 environment = vec4(0.0);',
						'#ifdef ENVIRONMENT_CUBE',
							'vec3 reflectionVector = reflect(normalize(viewPosition), N);',
							'reflectionVector.yz = -reflectionVector.yz;',
							'environment = textureCube(environmentCube, reflectionVector);',
						'#elif defined(ENVIRONMENT_SPHERE)',
							'vec3 reflectionVector = reflect(normalize(viewPosition), N);',
							'float xx = (atan(reflectionVector.z, reflectionVector.x) + M_PI) / (2.0 * M_PI);',
							'float yy = reflectionVector.y * 0.5 + 0.5;',
							'environment = texture2D(environmentSphere, vec2(xx, yy));',
						'#endif',
						'environment.rgb = mix(clearColor.rgb, environment.rgb, environment.a);',

						'float reflectionAmount = reflectivity;',
						'#if defined(REFLECTION_MAP) && defined(TEXCOORD0)',
							'reflectionAmount *= texture2D(reflectionMap, texCoord0).r;',
						'#endif',

						'float fresnelVal = pow(1.0 - abs(dot(normalize(viewPosition), N)), fresnel * 4.0);',
						'reflectionAmount *= fresnelVal;',

						'#if REFLECTION_TYPE == 0',
							'final_color.rgb = mix(final_color.rgb, environment.rgb, reflectionAmount);',
						'#elif REFLECTION_TYPE == 1',
							'final_color.rgb += environment.rgb * reflectionAmount;',
						'#endif',
						'final_color.a = min(final_color.a + reflectionAmount, 1.0);',
					'}',
				'#endif',

				'#ifndef LIGHT_MAP',
					'final_color.rgb += totalSpecular;',
					'final_color.a = min(final_color.a + length(totalSpecular) / 3.0, 1.0);',
				'#endif',

				'#ifdef FOG',
					'float d = pow(smoothstep(fogSettings.x, fogSettings.y, length(viewPosition)), 1.0);',
					'final_color.rgb = mix(final_color.rgb, fogColor, d);',
				'#endif',

				'gl_FragColor = final_color;',
			'}'
		].join('\n');
		}
	};

	// only terrain depends on this
	/**
	 * @static
	*/
	ShaderLib.screenCopy = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'varying vec2 texCoord0;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.copy = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'gl_FragColor = vec4(texture2D(diffuseMap, texCoord0).rgb, opacity);',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.copyPure = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'vec4 col = texture2D(diffuseMap, texCoord0);',
			'gl_FragColor = vec4(col.rgb, col.a * opacity);',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.simple = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'void main(void) {',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'void main(void)',
		'{',
			'gl_FragColor = vec4(1.0);',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.simpleColored = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			color : [1.0, 1.0, 1.0],
			opacity : 1.0
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'void main(void) {',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform vec3 color;',
		'uniform float opacity;',

		'void main(void)',
		'{',
			'if (opacity == 0.0) {',
				'discard;',
			'}',
			'gl_FragColor = vec4(color, opacity);',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.simpleLit = {
		processors: [
			ShaderBuilder.light.processor
		],
		defines: {
			NORMAL: true
		},
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			opacity: 1.0
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
		'attribute vec3 vertexPosition;',
		'attribute vec3 vertexNormal;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform vec3 cameraPosition;',

		ShaderBuilder.light.prevertex,
		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',

		'void main(void) {',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vWorldPos = worldPos.xyz;',
			'gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

			'normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
			'viewPosition = cameraPosition - worldPos.xyz;',
		'}'
		].join('\n');
		},
		fshader: function () {
			return [
		'#ifdef SPECULAR_MAP',
			'uniform sampler2D specularMap;',
		'#ifdef TEXCOORD0',
			'varying vec2 texCoord0;',
		'#endif',
		'#endif',

		'uniform float opacity;',

		ShaderBuilder.light.prefragment,

		'#ifdef NORMAL',
		'varying vec3 normal;',
		'#endif',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',

		'void main(void)',
		'{',
			'if (opacity == 0.0) {',
				'discard;',
		// 'return;',
			'}',
		'#ifdef NORMAL',
			'vec3 N = normalize(normal);',
		'#else',
			'vec3 N = vec3(0,0,1);',
		'#endif',
			'vec4 final_color = vec4(1.0);',

			ShaderBuilder.light.fragment,

			'final_color.a = opacity;',
			'gl_FragColor = final_color;',
		'}'
		].join('\n');
		}
	};

	/**
	 * @static
	*/
	ShaderLib.textured = {
		defines: {
			TEXCOORD0: true,
			DIFFUSE_MAP: true
		},
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'#if defined(TEXCOORD0) && defined(DIFFUSE_MAP)',
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',
		'#endif',

		'void main(void)',
		'{',
		'#if defined(TEXCOORD0) && defined(DIFFUSE_MAP)',
			'gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'#else',
			'gl_FragColor = vec4(1.0);',
		'#endif',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.texturedLit = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		builder: function (shader, shaderInfo) {
			ShaderBuilder.light.builder(shader, shaderInfo);
		},
		vshader: function () {
			return [
		'attribute vec3 vertexPosition;',
		'attribute vec3 vertexNormal;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform vec3 cameraPosition;',

		ShaderBuilder.light.prevertex,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void) {',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'vWorldPos = worldPos.xyz;',
			'gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

			'normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
			'texCoord0 = vertexUV0;',
			'viewPosition = cameraPosition - worldPos.xyz;',
		'}'
		].join('\n');
		},
		fshader: function () {
			return [
		'uniform sampler2D diffuseMap;',

		ShaderBuilder.light.prefragment,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'vec3 N = normalize(normal);',
			'vec4 final_color = texture2D(diffuseMap, texCoord0);',

			ShaderBuilder.light.fragment,

			'gl_FragColor = final_color;',
		'}'
		].join('\n');
		}
	};

	/**
	 * @static
	*/
	ShaderLib.convolution = {
		defines : {
			KERNEL_SIZE_FLOAT : '25.0',
			KERNEL_SIZE_INT : '25'
		},
		attributes : {
			position : MeshData.POSITION,
			uv : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			uImageIncrement : [0.001953125, 0.0],
			cKernel : [],
			size: 1.0
		},
		vshader : [
		'attribute vec3 position;',
		'attribute vec2 uv;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float size;',

		'uniform vec2 uImageIncrement;',

		'varying vec2 vUv;',

		'void main() {',
			'vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * size * uImageIncrement;',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',
		'}'
		].join('\n'),
		fshader : [
		'uniform float cKernel[ KERNEL_SIZE_INT ];',
		'uniform sampler2D tDiffuse;',
		'uniform vec2 uImageIncrement;',
		'uniform float size;',

		'varying vec2 vUv;',

		'void main() {',
			'vec2 imageCoord = vUv;',
			'vec4 sum = vec4( 0.0 );',

			// 'for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {',
				// 'sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];',
				// 'imageCoord += uImageIncrement * size;',
			// '}',
			// Hack for Android, who seems to crash on int looping
			'for(float i = 0.0; i < KERNEL_SIZE_FLOAT; i++) {',
				'sum += texture2D( tDiffuse, imageCoord ) * cKernel[int(i)];',
				'imageCoord += uImageIncrement * size;',
			'}',

			'gl_FragColor = sum;',
		'}'
		].join('\n'),
		buildKernel : function(sigma) {
			// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.
			function gauss(x, sigma) {
				return Math.exp(-(x * x) / (2.0 * sigma * sigma));
			}

			var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

			if (kernelSize > kMaxKernelSize) {
				kernelSize = kMaxKernelSize;
			}
			halfWidth = (kernelSize - 1) * 0.5;
			values = new Array(kernelSize);
			sum = 0.0;
			for (i = 0; i < kernelSize; ++i) {
				values[i] = gauss(i - halfWidth, sigma);
				sum += values[i];
			}

			// normalize the kernel
			for (i = 0; i < kernelSize; ++i) {
				values[i] /= sum;
			}
			return values;
		}
	};

	/**
	 * @static
	*/
	ShaderLib.showNormals = {
		defines: {
			NORMAL: true
		},
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			opacity : 1.0
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec3 vertexNormal;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec3 normal;',

		'void main() {',
			'normal = vec3(worldMatrix * vec4(vertexNormal, 0.0));',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform float opacity;',
		'#ifdef NORMAL',
		'varying vec3 normal;',
		'#else',
		'vec3 normal = vec3(0,0,1);',
		'#endif',

		'void main() {',
			'gl_FragColor = vec4( 0.5 * normalize( normal ) + 0.5, opacity );',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.particles = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexColor : MeshData.COLOR,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec4 vertexColor;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',
		'varying vec4 color;',

		'void main(void) {',
			'texCoord0 = vertexUV0;',
			'color = vertexColor;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'
		].join('\n'),
		fshader : [
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',
		'varying vec4 color;',

		'void main(void)',
		'{',
			'vec4 texCol = texture2D(diffuseMap, texCoord0);',
			'if (color.a == 0.0 || texCol.a == 0.0) discard;',
			'else gl_FragColor = texCol * color;',
		'}'
		].join('\n')
	};



	/**
	 * @static
	*/
	ShaderLib.normalmap = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			heightMap : Shader.DIFFUSE_MAP,
			resolution : [512, 512],
			height	: 0.05
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 vUv;',
			'void main() {',
				'vUv = vertexUV0;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform float height;',
			'uniform vec2 resolution;',
			'uniform sampler2D heightMap;',

			'varying vec2 vUv;',

			'void main() {',
				'float val = texture2D( heightMap, vUv ).x;',
				'float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;',
				'float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;',

				'gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );',
			'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.point = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexColor : MeshData.COLOR
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			pointSize : 2.0
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec4 vertexColor;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float pointSize;',

		'varying vec4 color;',

		'void main(void) {',
			'color = vertexColor;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'gl_PointSize = pointSize;',
		'}'
		].join('\n'),
		fshader : [
		'varying vec4 color;',

		'void main(void)',
		'{',
			'gl_FragColor = color;',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.downsample = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 vUv;',
			'void main() {',
				'vUv = vertexUV0;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',

			'void main() {',
				'gl_FragColor = texture2D( tDiffuse, vUv );',
			'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.lightDepth = {
		processors: [
			ShaderBuilder.animation.processor
		],
		defines: {
			SHADOW_TYPE: 0,
			WEIGHTS: true,
			JOINTIDS: true
		},
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraScale : Shader.MAIN_DEPTH_SCALE
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec4 worldPosition;',
		ShaderBuilder.animation.prevertex,

		'void main(void) {',
			'mat4 wMatrix = worldMatrix;',
			ShaderBuilder.animation.vertex,
			'worldPosition = viewMatrix * wMatrix * vec4(vertexPosition, 1.0);',
			'gl_Position = projectionMatrix * worldPosition;',
		'}'
		].join('\n'),
		fshader : [
		'uniform float cameraScale;',

		'varying vec4 worldPosition;',

		'void main(void)',
		'{',
			'float linearDepth = length(worldPosition) * cameraScale;',
			'#if SHADOW_TYPE == 0',
				'gl_FragColor = vec4(linearDepth);',
			'#elif SHADOW_TYPE == 1',
				'gl_FragColor = vec4(linearDepth);',
			'#elif SHADOW_TYPE == 2',
				'gl_FragColor = vec4(linearDepth, linearDepth * linearDepth, 0.0, 0.0);',
			'#endif',
		'}'
		].join('\n')
	};

	/**
	 * @static
	*/
	ShaderLib.pickingShader = {
		defines: {
			WEIGHTS: true,
			JOINTIDS: true
		},
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexJointIDs: MeshData.JOINTIDS,
			vertexWeights: MeshData.WEIGHTS,
			vertexNormal : MeshData.NORMAL
		},
		uniforms : {
			normalMatrix: Shader.NORMAL_MATRIX,
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraFar : Shader.FAR_PLANE,
			thickness: 0.0,
			id : function(shaderInfo) {
				return shaderInfo.renderable._index != null ? shaderInfo.renderable._index + 1 : shaderInfo.renderable.id + 1;
			}
		},
		processors: [
			// ShaderBuilder.uber.processor,
			ShaderBuilder.animation.processor,

			function (shader) {
				shader.setDefine('NORMAL', true);
			}
		],
		vshader : [
		'attribute vec3 vertexPosition;',

		'#ifdef NORMAL',
			'attribute vec3 vertexNormal;',
		'#endif',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float cameraFar;',
		'uniform float thickness;',
		'uniform mat4 normalMatrix;',

		ShaderBuilder.animation.prevertex,

		'varying float depth;',

		'void main() {',

			'#ifdef NORMAL',
				'mat4 nMatrix = normalMatrix;',
			'#endif',

			'mat4 wMatrix = worldMatrix;',
			ShaderBuilder.animation.vertex,

			'#ifdef NORMAL',
				'vec4 mvPosition = viewMatrix * wMatrix * vec4( vertexPosition + vertexNormal * thickness, 1.0 );',
			'#else',
				'vec4 mvPosition = viewMatrix * wMatrix * vec4( vertexPosition, 1.0 );',
			'#endif',

			// 'vec4 mvPosition = viewMatrix * wMatrix * vec4( vertexPosition, 1.0 );',
			'depth = -mvPosition.z / cameraFar;',
			'gl_Position = projectionMatrix * mvPosition;',
		'}'
		].join('\n'),
		fshader : [
		'uniform float id;',

		'varying float depth;',

		ShaderFragment.methods.packDepth16,

		'void main() {',
			'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
			'vec2 packedDepth = packDepth16(depth);',
			'gl_FragColor = vec4(packedId, packedDepth);',
		'}'
		].join('\n')
	};

	return ShaderLib;
});