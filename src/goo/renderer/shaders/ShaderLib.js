define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/entities/World'
],
	/** @lends */
	function (
		MeshData,
		Shader,
		ShaderFragment,
		ShaderBuilder,
		World
		) {
	"use strict";

	/**
	 * @class Collection of useful shaders
	 */
	function ShaderLib() {
	}

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
	        cameraPosition: Shader.CAMERA,
			diffuseMap : Shader.DIFFUSE_MAP,
			offsetRepeat : [0,0,1,1],
			normalMap : Shader.NORMAL_MAP,
			specularMap : Shader.SPECULAR_MAP,
			emissiveMap : Shader.EMISSIVE_MAP,
			aoMap : Shader.AO_MAP,
			lightMap : Shader.LIGHT_MAP,
			color: [1,1,1]
	    },
		vshader : [
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

			'void main(void) {',
				'mat4 wMatrix = worldMatrix;',
				ShaderBuilder.animation.vertex,
				'vec4 worldPos = wMatrix * vec4(vertexPosition, 1.0);',
				'vWorldPos = worldPos.xyz;',
				'gl_Position = viewProjectionMatrix * worldPos;',

				'viewPosition = cameraPosition - worldPos.xyz;',

				'#ifdef NORMAL',
				'	normal = normalize((wMatrix * vec4(vertexNormal, 0.0)).xyz);',
				'#endif',
				'#ifdef TANGENT',
				'	tangent = normalize((wMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);',
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
		].join('\n'),
		fshader : [//
			// '#if MAX_DIRECTIONAL_LIGHTS > 0 || MAX_POINT_LIGHTS > 0 || MAX_SPOT_LIGHTS > 0',
				// '#define USE_LIGHTING true',
			// "#endif",

			'#ifdef DIFFUSE_MAP',
				'uniform sampler2D diffuseMap;',
			'#endif',
			'#ifdef NORMAL_MAP',
				'uniform sampler2D normalMap;',
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
			'#ifdef TEXCOORD0',
				'varying vec2 texCoord0;',
			'#endif',
			'#ifdef TEXCOORD1',
				'varying vec2 texCoord1; //Use for lightmap',
			'#endif',

			ShaderBuilder.light.prefragment,

			'void main(void)',
			'{',
				'vec4 final_color = vec4(1.0);',

				'#ifdef DIFFUSE_MAP',
					'final_color *= texture2D(diffuseMap, texCoord0);',
				'#endif',

				'#ifdef COLOR',
					'final_color *= color;',
				'#endif',

				'#ifdef AO_MAP',
					'#ifdef TEXCOORD1',
						'final_color *= texture2D(aoMap, texCoord1);',
					'#else',
						'final_color *= texture2D(aoMap, texCoord0);',
					'#endif',
				'#endif',

				'#ifdef LIGHT_MAP',
					'#ifdef TEXCOORD1',
						'final_color *= texture2D(lightMap, texCoord1) * 2.0 - 0.5;',
					'#else',
						'final_color *= texture2D(lightMap, texCoord0) * 2.0 - 0.5;',
					'#endif',
				'#else',
					'#if defined(TANGENT) && defined(NORMAL_MAP)',
						'mat3 tangentToWorld = mat3(tangent, binormal, normal);',
						'vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz * vec3(2.0) - vec3(1.0);',
						'vec3 worldNormal = (tangentToWorld * tangentNormal);',
						'vec3 N = normalize(worldNormal);',
					'#elif defined(NORMAL)',
						'vec3 N = normalize(normal);',
					'#else',
						'vec3 N = vec3(0.0, 1.0, 0.0);',
					'#endif',

					ShaderBuilder.light.fragment,
				'#endif',

				'#ifdef EMISSIVE_MAP',
					'vec3 emissive = texture2D(emissiveMap, texCoord0).rgb;',
					'final_color.xyz += final_color.xyz * emissive;',
				'#endif',

				'gl_FragColor = final_color;',
			'}'
		].join('\n')
	};

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
		'	texCoord0 = vertexUV0;',
		'	gl_Position = vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'}'//
		].join('\n')
	};

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
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	gl_FragColor = vec4(texture2D(diffuseMap, texCoord0).rgb, opacity);',
		'}'//
		].join('\n')
	};

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
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',
		'uniform float opacity;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec4 col = texture2D(diffuseMap, texCoord0);',
		'	gl_FragColor = vec4(col.rgb, col.a * opacity);',
		'}'//
		].join('\n')
	};

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
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'void main(void)',
		'{',
		'	gl_FragColor = vec4(1.0);',
		'}'//
		].join('\n')
	};

	ShaderLib.simpleColored = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			color : [1.0, 1.0, 1.0]
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',

		'void main(void) {',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform vec3 color;',

		'void main(void)',
		'{',
		'	gl_FragColor = vec4(color, 1.0);',
		'}'//
		].join('\n')
	};

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
			cameraPosition : Shader.CAMERA
		},
		vshader : [
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
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		' vWorldPos = worldPos.xyz;',
		'	gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

		'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
		'	viewPosition = cameraPosition - worldPos.xyz;',
		'}'//
		].join('\n'),
		fshader : [//
		'#ifdef SPECULAR_MAP',
			'uniform sampler2D specularMap;',
		'#ifdef TEXCOORD0',
			'varying vec2 texCoord0;',
		'#endif',
		'#endif',
		ShaderBuilder.light.prefragment,

		'#ifdef NORMAL',
		'varying vec3 normal;',
		'#endif',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',

		'void main(void)',
		'{',
		' #ifdef NORMAL',
		'	vec3 N = normalize(normal);',
		' #else',
		' vec3 N = vec3(0,0,1);',
		' #endif',
		'	vec4 final_color = vec4(1.0);',

			ShaderBuilder.light.fragment,

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n')
	};

	ShaderLib.billboard = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			viewMatrix: Shader.VIEW_MATRIX,

			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP
		},
		vshader : [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 viewMatrix;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'	texCoord0 = vertexUV0;',
			'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(0.0, 0.0, 0.0, 1.0) + projectionMatrix * vec4(vertexPosition.x, vertexPosition.y, 0.0, 0.0);',
			'}'//
		].join('\n'),
		fshader : [//
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
			'}'//
		].join('\n')
	};

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
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'#if defined(TEXCOORD0) && defined(DIFFUSE_MAP)',
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',
		'#endif',

		'void main(void)',
		'{',
		' #if defined(TEXCOORD0) && defined(DIFFUSE_MAP)',
		'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
		' #else',
		' gl_FragColor = vec4(1.0);',
		' #endif',
		'}'//
		].join('\n')
	};

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
		vshader : [
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
		'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
		' vWorldPos = worldPos.xyz;',
		'	gl_Position = viewProjectionMatrix * worldPos;',

			ShaderBuilder.light.vertex,

		'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
		'	texCoord0 = vertexUV0;',
		'	viewPosition = cameraPosition - worldPos.xyz;',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',

		ShaderBuilder.light.prefragment,

		'varying vec3 normal;',
		'varying vec3 vWorldPos;',
		'varying vec3 viewPosition;',
		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec3 N = normalize(normal);',
		'	vec4 final_color = texture2D(diffuseMap, texCoord0);',

			ShaderBuilder.light.fragment,

		'	gl_FragColor = final_color;',
		'}'//
		].join('\n')
	};

	ShaderLib.convolution = {
		defines : {
			KERNEL_SIZE_FLOAT : "25.0",
			KERNEL_SIZE_INT : "25"
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
			cKernel : []
		},
		vshader : [//
		'attribute vec3 position;',
		'attribute vec2 uv;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'uniform vec2 uImageIncrement;',

		'varying vec2 vUv;',

		'void main() {',
		'	vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;',
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',
		'}'//
		].join("\n"),
		fshader : [//
		'uniform float cKernel[ KERNEL_SIZE_INT ];',
		'uniform sampler2D tDiffuse;',
		'uniform vec2 uImageIncrement;',

		'varying vec2 vUv;',

		'void main() {',
		'	vec2 imageCoord = vUv;',
		'	vec4 sum = vec4( 0.0 );',

		'	for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {',
		'		sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];',
		'		imageCoord += uImageIncrement;',
		'	}',

		'	gl_FragColor = sum;',
		'}'//
		].join("\n"),
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

	ShaderLib.showDepth = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			near : Shader.NEAR_PLANE,
			far : Shader.FAR_PLANE
		},
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'void main(void) {',
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform float near;',
		'uniform float far;',

		'void main(void)',
		'{',
		'	float depth = gl_FragCoord.z / gl_FragCoord.w;',
		'	float d = 1.0 - smoothstep( near, far, depth );',
		'	gl_FragColor = vec4(d);',
		'}'//
		].join('\n')
	};

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
		].join("\n"),
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
		].join("\n")
	};

	ShaderLib.bokehShader = {
		attributes : {
			position : MeshData.POSITION,
			uv : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tColor : Shader.DIFFUSE_MAP,
			tDepth : Shader.DEPTH_MAP,
			focus : 1.0,
			aspect : 1.0,
			aperture : 0.025,
			maxblur : 1.0
		},
		vshader : [//
		'attribute vec3 position;',
		'attribute vec2 uv;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'varying vec2 vUv;',

		'void main() {',
		'	vUv = uv;',
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',
		'}'//
		].join("\n"),
		fshader : [//
		'varying vec2 vUv;',

		'uniform sampler2D tColor;',
		'uniform sampler2D tDepth;',
		'uniform float maxblur;', // max blur amount
		'uniform float aperture;', // aperture - bigger values for shallower depth of field
		'uniform float focus;',
		'uniform float aspect;',

		'void main() {',
		'vec2 aspectcorrect = vec2( 1.0, aspect );',
		'vec4 depth1 = texture2D( tDepth, vUv );',
		'float factor = depth1.x - focus;',
		'vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );',
		'vec2 dofblur9 = dofblur * 0.9;',
		'vec2 dofblur7 = dofblur * 0.7;',
		'vec2 dofblur4 = dofblur * 0.4;',

		'vec4 col = vec4( 0.0 );',

		'col += texture2D( tColor, vUv.xy );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );',

		'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',

		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );',

		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',
		'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );',

		'gl_FragColor = col / 41.0;',
		'gl_FragColor.a = 1.0;',
		'}'//
		].join("\n")
	};

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
		'    texCoord0 = vertexUV0;',
		'    color = vertexColor;',
		'	 gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',
		'varying vec4 color;',

		'void main(void)',
		'{',
		'	vec4 texCol = texture2D(diffuseMap, texCoord0);',
		'   if (color.a == 0.0 || texCol.a == 0.0) discard;',
		'	else gl_FragColor = texCol * color;',
		'}'//
		].join('\n')
	};

	ShaderLib.sepia = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			amount : 1.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float amount;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",
				"vec4 color = texture2D( tDiffuse, vUv );",
				"vec3 c = color.rgb;",

				"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
				"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
				"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

				"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",
			"}"
		].join("\n")
	};

	ShaderLib.dotscreen = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			tSize:    [256, 256],
			center:   [0.5, 0.5],
			angle:	  1.57,
			scale:	  1.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform vec2 center;",
			"uniform float angle;",
			"uniform float scale;",
			"uniform vec2 tSize;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"float pattern() {",
				"float s = sin( angle ), c = cos( angle );",

				"vec2 tex = vUv * tSize - center;",
				"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

				"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",
			"}",

			"void main() {",
				"vec4 color = texture2D( tDiffuse, vUv );",
				"float average = ( color.r + color.g + color.b ) / 3.0;",
				"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",
			"}"
		].join("\n")
	};

	ShaderLib.vignette = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			offset:   1.0,
			darkness: 1.5
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float offset;",
			"uniform float darkness;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
				"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

				/*
				"vec4 color = texture2D( tDiffuse, vUv );",
				"float dist = distance( vUv, vec2( 0.5 ) );",
				"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
				"gl_FragColor = color;",
				*/
			"}"
		].join("\n")
	};

	ShaderLib.film = {
		attributes : ShaderLib.copy.attributes,
		uniforms : {
			tDiffuse : Shader.DIFFUSE_MAP,
			time : function() {
				return World.time;
			},
			// noise effect intensity value (0 = no effect, 1 = full effect)
			nIntensity : 0.5,
			// scanlines effect intensity value (0 = no effect, 1 = full effect)
			sIntensity : 0.5,
			// scanlines effect count value (0 = no effect, 4096 = full effect)
			sCount : 1024,
			grayscale : 0,
			$link : ShaderLib.copy.uniforms
		},
		vshader : ShaderLib.copy.vshader,
		fshader : [
		"uniform float time;",
		"uniform bool grayscale;",
		"uniform float nIntensity;",
		"uniform float sIntensity;",
		"uniform float sCount;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 texCoord0;",

		"void main() {",
		"	vec4 cTextureScreen = texture2D( tDiffuse, texCoord0 );",
		"	float x = texCoord0.x * texCoord0.y * time * 1000.0;", "x = mod( x, 13.0 ) * mod( x, 123.0 );", "float dx = mod( x, 0.01 );",
		"	vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",
		"	vec2 sc = vec2( sin( texCoord0.y * sCount ), cos( texCoord0.y * sCount ) );",
		"	cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",
		"	cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",
		"	if( grayscale ) {",
		"		cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",
		"	}",
		"	gl_FragColor = vec4( cResult, cTextureScreen.a );",
		"}"].join('\n')
	};

	ShaderLib.bleachbypass = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			opacity:   1.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float opacity;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",
				"vec4 base = texture2D( tDiffuse, vUv );",

				"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
				"float lum = dot( lumCoeff, base.rgb );",
				"vec3 blend = vec3( lum );",

				"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

				"vec3 result1 = 2.0 * base.rgb * blend;",
				"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

				"vec3 newColor = mix( result1, result2, L );",

				"float A2 = opacity * base.a;",
				"vec3 mixRGB = A2 * newColor.rgb;",
				"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

				"gl_FragColor = vec4( mixRGB, base.a );",
			"}"
		].join("\n")
	};

	ShaderLib.horizontalTiltShift = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			h : 1.0 / 128.0,
			r : 0.5
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",
			"uniform float h;",
			"uniform float r;",

			"varying vec2 vUv;",
			"void main() {",
				"vec4 sum = vec4( 0.0 );",

				"float hh = h * abs( r - vUv.y );",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x,            vUv.y ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"
		].join("\n")
	};

	ShaderLib.colorify = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			color: [1.0, 1.0, 1.0]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform vec3 color;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",
			"void main() {",
				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
				"float v = dot( texel.xyz, luma );",

				"gl_FragColor = vec4( v * color, texel.w );",
			"}"
		].join("\n")
	};

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

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float height;",
			"uniform vec2 resolution;",
			"uniform sampler2D heightMap;",

			"varying vec2 vUv;",

			"void main() {",
				"float val = texture2D( heightMap, vUv ).x;",
				"float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
				"float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

				"gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",
			"}"
		].join("\n")
	};

	ShaderLib.ssao = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix :        Shader.VIEW_MATRIX,
			projectionMatrix :  Shader.PROJECTION_MATRIX,
			worldMatrix :       Shader.WORLD_MATRIX,
			tDiffuse:           Shader.DIFFUSE_MAP,
			tDepth:             Shader.DEPTH_MAP,
			size:               [512, 512],
			cameraNear:         Shader.MAIN_NEAR_PLANE,
			cameraFar:          Shader.MAIN_FAR_PLANE,
			fogNear:            Shader.MAIN_NEAR_PLANE,
			fogFar:             Shader.MAIN_FAR_PLANE,
			fogEnabled:         0,
			onlyAO:             0,
			aoClamp:            0.3,
			lumInfluence:       0.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform float cameraNear;",
			"uniform float cameraFar;",

			"uniform float fogNear;",
			"uniform float fogFar;",

			"uniform bool fogEnabled;",  // attenuate AO with linear fog
			"uniform bool onlyAO;",      // use only ambient occlusion pass?

			"uniform vec2 size;",        // texture width, height
			"uniform float aoClamp;",    // depth clamp - reduces haloing at screen edges

			"uniform float lumInfluence;",  // how much luminance affects occlusion

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tDepth;",

			"varying vec2 vUv;",

			// "#define PI 3.14159265",
			"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
			"#define EULER 2.718281828459045",

			// helpers
			"float width = size.x;",   // texture width
			"float height = size.y;",  // texture height

			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			// user variables
			"const int samples = 16;",    // ao sample count
			"const float radius = 2.0;",  // ao radius

			"const bool useNoise = false;",      // use noise instead of pattern for sample dithering
			"const float noiseAmount = 0.0003;", // dithering amount

			"const float diffArea = 0.4;",  // self-shadowing reduction
			"const float gDisplace = 0.4;", // gauss bell center

//			"const vec3 onlyAOColor = vec3( 1.0, 0.7, 0.5 );",
			 "const vec3 onlyAOColor = vec3( 1.0, 1.0, 1.0 );",

			// RGBA depth
			"float unpackDepth( const in vec4 rgba_depth ) {",
				"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
				"float depth = dot( rgba_depth, bit_shift );",
				"return depth;",
			"}",

			// generating noise / pattern texture for dithering
			"vec2 rand( const vec2 coord ) {",
				"vec2 noise;",

				"if ( useNoise ) {",
					"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
					"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

					"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",
				"} else {",
					"float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );",
					"float gg = fract( coord.t * ( height / 2.0 ) );",

					"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",
				"}",

				"return ( noise * 2.0  - 1.0 ) * noiseAmount;",
			"}",

			"float doFog() {",
				"float zdepth = unpackDepth( texture2D( tDepth, vUv ) );",
				"float depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );",

				"return smoothstep( fogNear, fogFar, depth );",
			"}",

			"float readDepth( const in vec2 coord ) {",
//				 "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
				"return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );",
			"}",

			"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",
				"float garea = 2.0;",                         // gauss bell width
				"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

				// reduce left bell width to avoid self-shadowing
				"if ( diff < gDisplace ) {",
					"garea = diffArea;",
				"} else {",
					"far = 1;",
				"}",

				"float dd = diff - gDisplace;",
				"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
				"return gauss;",
			"}",

			"float calcAO( float depth, float dw, float dh ) {",
				"float dd = radius - depth * radius;",
				"vec2 vv = vec2( dw, dh );",

				"vec2 coord1 = vUv + dd * vv;",
				"vec2 coord2 = vUv - dd * vv;",

				"float temp1 = 0.0;",
				"float temp2 = 0.0;",

				"int far = 0;",
				"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

				// DEPTH EXTRAPOLATION
				"if ( far > 0 ) {",
					"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
					"temp1 += ( 1.0 - temp1 ) * temp2;",
				"}",

				"return temp1;",
			"}",

			"void main() {",
				"vec2 noise = rand( vUv );",
				"float depth = readDepth( vUv );",

				"float tt = clamp( depth, aoClamp, 1.0 );",

				"float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
				"float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

				"float pw;",
				"float ph;",

				"float ao;",

				"float dz = 1.0 / float( samples );",
				"float z = 1.0 - dz / 2.0;",
				"float l = 0.0;",

				"for ( int i = 0; i <= samples; i ++ ) {",
					"float r = sqrt( 1.0 - z );",

					"pw = cos( l ) * r;",
					"ph = sin( l ) * r;",
					"ao += calcAO( depth, pw * w, ph * h );",
					"z = z - dz;",
					"l = l + DL;",
				"}",

				"ao /= float( samples );",
				"ao = 1.0 - ao;",

				"if ( fogEnabled ) {",
					"ao = mix( ao, 1.0, doFog() );",
				"}",

				"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

				"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
				"float lum = dot( color.rgb, lumcoeff );",
				"vec3 luminance = vec3( lum );",

				"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // mix( color * ao, white, luminance )

				"if ( onlyAO ) {",
					"final = onlyAOColor * vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", // ambient occlusion only
				"}",

				"gl_FragColor = vec4( final, 1.0 );",
//				"gl_FragColor = vec4( vec3(unpackDepth( texture2D( tDepth, vUv ))), 1.0);",
			"}"
		].join("\n")
	};

	ShaderLib.skinning = {
		defines : {
			JOINT_COUNT : 56,
			WEIGHTS : 4
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
			vertexWeights: MeshData.WEIGHTS,
			vertexJointIDs: MeshData.JOINTIDS
		},
		uniforms: {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: Shader.DIFFUSE_MAP,
			jointPalette: function (shaderInfo) {
				var skMesh = shaderInfo.meshData;
				var pose = skMesh.currentPose;
				if (pose) {
					var palette = pose._matrixPalette;
					var buffLength = skMesh.paletteMap.length * 16;
					var store = skMesh.store;
					if (!store) {
						store = new Float32Array(buffLength);
						skMesh.store = store;
					}
					var refMat;
					for (var index = 0; index < skMesh.paletteMap.length; index++) {
						refMat = palette[skMesh.paletteMap[index]];
						for (var i = 0; i < 4; i++) {
							for (var j = 0; j < 4; j++) {
								store[index * 16 + i * 4 + j] = refMat.data[j * 4 + i];
							}
						}
					}
					return store;
				}
			}
		},
		vshader: [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',
		'attribute vec4 vertexWeights;',
		'attribute vec4 vertexJointIDs;',

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform mat4 jointPalette[JOINT_COUNT];',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	mat4 mat = mat4(0.0);',

//		'	for (int i = 0; i < WEIGHTS; i++) {',
//		'		mat += jointPalette[int(vertexJointIDs[i])] * vertexWeights[i];',
//		'	}',

		'	mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;',
		'	mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;',
		'	mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;',
		'	mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * mat * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader: [//
		'uniform sampler2D diffuseMap;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	gl_FragColor = texture2D(diffuseMap, texCoord0);',
		'}'//
		].join('\n')
	};

	ShaderLib.rgbshift = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			amount : 0.005,
			angle : 0.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",
			"uniform float amount;",
			"uniform float angle;",

			"varying vec2 vUv;",

			"void main() {",
				"vec2 offset = amount * vec2( cos(angle), sin(angle));",
				"vec4 cr = texture2D(tDiffuse, vUv + offset);",
				"vec4 cga = texture2D(tDiffuse, vUv);",
				"vec4 cb = texture2D(tDiffuse, vUv - offset);",
				"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
			"}"
		].join("\n")
	};

	ShaderLib.brightnesscontrast = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			brightness: 0,
			contrast: 0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",
			"uniform float brightness;",
			"uniform float contrast;",

			"varying vec2 vUv;",

			"void main() {",
				"gl_FragColor = texture2D( tDiffuse, vUv );",
				"gl_FragColor.rgb += brightness;",

				"if (contrast > 0.0) {",
					"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
				"} else {",
					"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
				"}",
			"}"
		].join("\n")
	};

	ShaderLib.luminosity = {
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

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
				"float v = dot( texel.xyz, luma );",

				"gl_FragColor = vec4( v, v, v, texel.w );",
			"}"
		].join("\n")
	};

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
		'	color = vertexColor;',
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'	gl_PointSize = pointSize;',
		'}'//
		].join('\n'),
		fshader : [//
		'varying vec4 color;',

		'void main(void)',
		'{',
		'	gl_FragColor = color;',
		'}'//
		].join('\n')
	};

	ShaderLib.toon = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexNormal : MeshData.NORMAL
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			cameraPosition : Shader.CAMERA,
			lightPosition : Shader.LIGHT0,
			HighlightColour : [0.9,0.8,0.7,1.0],
			MidColour : [0.65,0.55,0.45,1.0],
			ShadowColour : [0.4,0.3,0.2,1.0],
			HighlightSize : 0.2,
			ShadowSize : 0.01,
			OutlineWidth : 0.15
		},
		vshader : [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform vec3 lightPosition;',

			'varying vec3 N;',
			'varying vec3 V;',
			'varying vec3 L;',

			'void main()',
			'{',
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'	N = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
			'	L = lightPosition - worldPos.xyz;',
			'	V = cameraPosition - worldPos.xyz;',
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'}'
		].join('\n'),
		fshader : [//
			'uniform vec4 HighlightColour;',
			'uniform vec4 MidColour;',
			'uniform vec4 ShadowColour;',
			'uniform float HighlightSize;',
			'uniform float ShadowSize;',
			'uniform float OutlineWidth;',

			'varying vec3 N;',
			'varying vec3 L;',
			'varying vec3 V;',

			'void main()',
			'{',
			'	vec3 n = normalize(N);',
			'	vec3 l = normalize(L);',
			'	vec3 v = normalize(V);',

			'    float lambert = dot(l,n);',
			'    vec4 colour = MidColour;',
			'    if (lambert > 1.0 - HighlightSize) colour = HighlightColour;',
			'    if (lambert < ShadowSize) colour = ShadowColour;',
			'    if (dot(n,v) < OutlineWidth) colour = vec4(0.0,0.0,0.0,1.0);',

			'    gl_FragColor = colour;',
			'}'
		].join('\n')
	};

	/*
	*	Outputs the difference as tex0 - tex1, the value is tresholded to create a clearer edge.
	*/
	ShaderLib.differenceOfGaussians = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			gaussBlurredImage1 : 'BLUR1',
			gaussBlurredImage2 : 'BLUR2',
			originalImage : 'ORIGINAL',
			threshold : 0.01
		},
		vshader : [
		'attribute vec3 vertexPosition;',
		'attribute vec2 vertexUV0;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',

		'varying vec2 texCoord0;',

		'void main(void) {',
		'	texCoord0 = vertexUV0;',
		'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
		'}'//
		].join('\n'),
		fshader : [//
		'uniform sampler2D gaussBlurredImage1;',
		'uniform sampler2D gaussBlurredImage2;',
		'uniform sampler2D originalImage;',
		'uniform float threshold;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
		'	vec4 blur1 = texture2D(gaussBlurredImage1, texCoord0);',
		'	vec4 blur2 = texture2D(gaussBlurredImage2, texCoord0);',
		'	vec4 originalColor = texture2D(originalImage, texCoord0);',
		'	vec3 col = clamp(blur1.rgb - blur2.rgb, 0.0, 1.0);',
		'	float value = (col.r + col.g + col.b) / 3.0;',
		'	value = step(threshold, value);',
		'	vec3 outputColor = mix(originalColor.rgb, vec3(value), value);',
		'	gl_FragColor = vec4(outputColor, 1.0);',
		'}'//
		].join('\n')
	};

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

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",
				"gl_FragColor = texture2D( tDiffuse, vUv );",
			"}"
		].join("\n")
	};

	ShaderLib.boxfilter = {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			tDiffuse : Shader.DIFFUSE_MAP,
			viewport : [128, 128]
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			"varying vec2 vUv;",
			"void main() {",
				"vUv = vertexUV0;",
				"gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );",
			"}"
		].join("\n"),
		fshader: [
			"uniform sampler2D tDiffuse;",
			"uniform vec2 viewport;",

			"varying vec2 vUv;",

			"void main() {",
				'vec3 result = vec3(0.0);',
				'for(int x=-1; x<=1; x++) {',
				'	for(int y=-1; y<=1; y++) {',
				'		result += texture2D(tDiffuse, vUv + vec2(x, y) / viewport).rgb;',
				'	}',
				'}',
				'gl_FragColor = vec4(result / vec3(9.0), 1.0);',
			"}"
		].join("\n")
	};

	ShaderLib.lightDepth = {
		defines: {
			SHADOW_TYPE: 0
		},
		attributes : {
			vertexPosition : MeshData.POSITION
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

		'void main(void) {',
			'worldPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'gl_Position = projectionMatrix * worldPosition;',
		'}'
		].join('\n'),
		fshader : [
		'#ifndef SHADOW_TYPE',
			'#define SHADOW_TYPE 0',
		"#endif",

		'uniform float cameraScale;',

		'varying vec4 worldPosition;',

		'void main(void)',
		'{',
			'float linearDepth = length(worldPosition) * cameraScale;',
			'#if SHADOW_TYPE == 0',
				'gl_FragColor = vec4(linearDepth);',
			'#elif SHADOW_TYPE == 1',
				'gl_FragColor = vec4(linearDepth, linearDepth * linearDepth, 0.0, 0.0);',
			'#endif',
		'}'//
		].join('\n')
	};

	ShaderLib.packDepth = {
		attributes : {
			vertexPosition : MeshData.POSITION
		},
		uniforms : {
			viewMatrix : Shader.VIEW_MATRIX,
			projectionMatrix : Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			farPlane : Shader.FAR_PLANE
		},
		vshader : [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec4 vPosition;',

			'void main(void) {',
			'	vPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'	gl_Position = projectionMatrix * vPosition;',
			'}'//
		].join('\n'),
		fshader : [//
			'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'varying vec4 vPosition;',

			'void main(void)',
			'{',
			'	float linearDepth = min(length(vPosition), farPlane) / farPlane;',
			'	gl_FragColor = packDepth(linearDepth);',
			'}'//
		].join('\n')
	};

	ShaderLib.pickingShader = {
		defines: {
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
			cameraFar : Shader.FAR_PLANE,
			id : function(shaderInfo) {
				return shaderInfo.renderable.id + 1;
			}
		},
		processors: [
			//ShaderBuilder.uber.processor,
			ShaderBuilder.animation.processor
		],
		vshader : [
		'attribute vec3 vertexPosition;',

		'uniform mat4 viewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',
		'uniform float cameraFar;',

		ShaderBuilder.animation.prevertex,

		'varying float depth;',

		'void main() {',
			'mat4 wMatrix = worldMatrix;',
			ShaderBuilder.animation.vertex,
			'vec4 mvPosition = viewMatrix * wMatrix * vec4( vertexPosition, 1.0 );',
			'depth = length(mvPosition.xyz) / cameraFar;',
			'gl_Position = projectionMatrix * mvPosition;',
		'}'
		].join("\n"),
		fshader : [
		'uniform float id;',

		'varying float depth;',

		ShaderFragment.methods.packDepth16,

		'void main() {',
			'vec2 packedId = vec2(floor(id/255.0), mod(id, 255.0)) * vec2(1.0/255.0);',
			'vec2 packedDepth = packDepth16(depth);',
			'gl_FragColor = vec4(packedId, packedDepth);',
		'}'
		].join("\n")
	};

	return ShaderLib;
});