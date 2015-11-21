var MeshData = require('../renderer/MeshData');
var Shader = require('../renderer/Shader');
var ShaderFragment = require('../renderer/shaders/ShaderFragment');
var ShaderBuilder = require('../renderer/shaders/ShaderBuilder');
var ShaderLib = require('../renderer/shaders/ShaderLib');
	'goo/entities/World' //! AT: this should not exist - why would shaders care about importing the world?!

	'use strict';

	/**
	 * Collection of additional useful shaders
	 * Details of each can be printed using console.log().
	 */
	function ShaderLibExtra() {}

	ShaderLibExtra.billboard = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			viewMatrix: Shader.VIEW_MATRIX,

			worldMatrix: Shader.WORLD_MATRIX,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 viewMatrix;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * vec4(0.0, 0.0, 0.0, 1.0) + projectionMatrix * vec4(vertexPosition.x, vertexPosition.y, 0.0, 0.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'gl_FragColor = texture2D(diffuseMap, texCoord0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.showDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			near: Shader.NEAR_PLANE,
			far: Shader.FAR_PLANE
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'void main(void) {',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform float near;',
			'uniform float far;',

			'void main(void)',
			'{',
			'float depth = gl_FragCoord.z / gl_FragCoord.w;',
			'float d = 1.0 - smoothstep( near, far, depth );',
			'gl_FragColor = vec4(d);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.bokehShader = {
		attributes: {
			position: MeshData.POSITION,
			uv: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tColor: Shader.DIFFUSE_MAP,
			tDepth: Shader.DEPTH_MAP,
			focus: 1.0,
			aspect: 1.0,
			aperture: 0.025,
			maxblur: 1.0
		},
		vshader: [
			'attribute vec3 position;',
			'attribute vec2 uv;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',
			'varying vec2 vUv;',

			'void main() {',
			'	vUv = uv;',
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
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
			'}'
		].join('\n')
	};

	ShaderLibExtra.sepia = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			amount: 1.0
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
			'uniform float amount;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',

			'void main() {',
			'vec4 color = texture2D(tDiffuse, vUv );',
			'vec3 c = color.rgb;',

			'color.r = dot(c, vec3(1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount));',
			'color.g = dot(c, vec3(0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount));',
			'color.b = dot(c, vec3(0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount));',

			'gl_FragColor = vec4(min(vec3(1.0), color.rgb), color.a);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.dotscreen = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			tSize: [256, 256],
			center: [0.5, 0.5],
			angle: 1.57,
			scale: 1.0
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
			'uniform vec2 center;',
			'uniform float angle;',
			'uniform float scale;',
			'uniform vec2 tSize;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',

			'float pattern() {',
			'float s = sin( angle ), c = cos( angle );',

			'vec2 tex = vUv * tSize - center;',
			'vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;',

			'return ( sin( point.x ) * sin( point.y ) ) * 4.0;',
			'}',

			'void main() {',
			'vec4 color = texture2D( tDiffuse, vUv );',
			'float average = ( color.r + color.g + color.b ) / 3.0;',
			'gl_FragColor = vec4( color.rgb * vec3( average * 10.0 - 5.0 + pattern() ), color.a );',
			'}'
		].join('\n')
	};

	ShaderLibExtra.vignette = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			offset: 1.0,
			darkness: 1.5
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
			'uniform float offset;',
			'uniform float darkness;',

			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',

			'void main() {',
			'vec4 texel = texture2D( tDiffuse, vUv );',
			'vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );',
			'gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );',

			/*
			'vec4 color = texture2D( tDiffuse, vUv );',
			'float dist = distance( vUv, vec2( 0.5 ) );',
			'color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );',
			'gl_FragColor = color;',
			*/
			'}'
		].join('\n')
	};

	ShaderLibExtra.film = {
		attributes: ShaderLib.copy.attributes,
		uniforms: {
			tDiffuse: Shader.DIFFUSE_MAP,
			time: function () {
				return World.time;
			},
			// noise effect intensity value (0 = no effect, 1 = full effect)
			nIntensity: 0.5,
			// scanlines effect intensity value (0 = no effect, 1 = full effect)
			sIntensity: 0.5,
			// scanlines effect count value (0 = no effect, 4096 = full effect)
			sCount: 1024,
			grayscale: 0,
			$link: ShaderLib.copy.uniforms
		},
		vshader: ShaderLib.copy.vshader,
		fshader: [
			'uniform float time;',
			'uniform bool grayscale;',
			'uniform float nIntensity;',
			'uniform float sIntensity;',
			'uniform float sCount;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 texCoord0;',

			'void main() {',
			'vec4 cTextureScreen = texture2D( tDiffuse, texCoord0 );',
			'float x = texCoord0.x * texCoord0.y * time * 1000.0;',
			'x = mod( x, 13.0 ) * mod( x, 123.0 );',
			'float dx = mod( x, 0.01 );',
			'vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );',
			'vec2 sc = vec2( sin( texCoord0.y * sCount ), cos( texCoord0.y * sCount ) );',
			'cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;',
			'cResult = cTextureScreen.rgb + nIntensity * ( cResult - cTextureScreen.rgb );',
			'if ( grayscale ) {',
			'	cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );',
			'}',
			'gl_FragColor = vec4( cResult, cTextureScreen.a );',
			'}'].join('\n')
	};

	ShaderLibExtra.noise = {
		attributes: ShaderLib.copy.attributes,
		uniforms: {
			tDiffuse: Shader.DIFFUSE_MAP,
			time: function () {
				return World.time;
			},
			// noise effect intensity value (0 = no effect, 1 = full effect)
			nIntensity: 0.5,
			grayscale: 0,
			$link: ShaderLib.copy.uniforms
		},
		vshader: ShaderLib.copy.vshader,
		fshader: [
			'uniform float time;',
			'uniform bool grayscale;',
			'uniform float nIntensity;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 texCoord0;',

			'void main() {',
			'vec4 cTextureScreen = texture2D( tDiffuse, texCoord0);',
			'float x = texCoord0.x * texCoord0.y * time * 1000.0;',

			'vec3 cResult;',
			'if ( !grayscale ) {',
			'float y = fract(sin(dot(vec2(mod( x + 20.0, 87.0 ), mod( x + 150.0, 23.0 )), vec2(12.9898,78.233))) * 43758.5453);',
			'float z = fract(sin(dot(vec2(mod( x + 30.0, 19.0 ), mod( x + 200.0, 103.0 )), vec2(12.9898,78.233))) * 43758.5453);',
			'x = fract(sin(dot(vec2(mod( x, 13.0 ), mod( x + 50.0, 123.0 )), vec2(12.9898,78.233))) * 43758.5453);',
			'cResult = vec3(x, y, z);',
			'} else {',
			'x = fract(sin(dot(vec2(mod( x, 13.0 ), mod( x + 50.0, 123.0 )), vec2(12.9898,78.233))) * 43758.5453);',
			'cResult = vec3(x);',
			'}',

			'gl_FragColor = vec4( mix(cTextureScreen.rgb, cResult, nIntensity), cTextureScreen.a );',
			'}'].join('\n')
	};

	ShaderLibExtra.bleachbypass = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			opacity: 1.0
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
			'uniform float opacity;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',

			'void main() {',
			'vec4 base = texture2D( tDiffuse, vUv );',

			'vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );',
			'float lum = dot( lumCoeff, base.rgb );',
			'vec3 blend = vec3( lum );',

			'float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );',

			'vec3 result1 = 2.0 * base.rgb * blend;',
			'vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );',

			'vec3 newColor = mix( result1, result2, L );',

			'float A2 = opacity * base.a;',
			'vec3 mixRGB = A2 * newColor.rgb;',
			'mixRGB += ( ( 1.0 - A2 ) * base.rgb );',

			'gl_FragColor = vec4( mixRGB, base.a );',
			'}'
		].join('\n')
	};

	ShaderLibExtra.horizontalTiltShift = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			h: 1.0 / 128.0,
			r: 0.5
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
			'uniform float h;',
			'uniform float r;',

			'varying vec2 vUv;',
			'void main() {',
			'vec4 sum = vec4( 0.0 );',

			'float hh = h * abs( r - vUv.y );',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;',
			'sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;',
			'sum += texture2D( tDiffuse, vec2( vUv.x,            vUv.y ) ) * 0.1633;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;',
			'sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;',

			'gl_FragColor = sum;',

			'}'
		].join('\n')
	};

	ShaderLibExtra.colorify = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			color: [1.0, 1.0, 1.0],
			amount: 1.0
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
			'uniform vec3 color;',
			'uniform float amount;',
			'uniform sampler2D tDiffuse;',

			'varying vec2 vUv;',
			'void main() {',
			'gl_FragColor = texture2D( tDiffuse, vUv );',
			'vec3 luma = vec3( 0.299, 0.587, 0.114 );',
			'float v = dot( gl_FragColor.rgb, luma );',

			'gl_FragColor.rgb = mix(gl_FragColor.rgb, v * color, amount);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.hatch = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			width: 0.0,
			spread: 10.0,
			replace: true
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
			'uniform float width;',
			'uniform float spread;',
			'uniform bool replace;',

			'varying vec2 vUv;',
			'void main() {',
			'gl_FragColor = texture2D( tDiffuse, vUv );',

			'float lum = length(gl_FragColor.rgb);',
			'vec3 mult = vec3(1.0, 1.0, 1.0);',
			'float halfSpread = (spread*0.5);',
			'if (lum < 1.00) {',
			'float diff = abs(mod(gl_FragCoord.x + gl_FragCoord.y, spread) - halfSpread);',
			'if (diff <= width) {',
			'mult *= vec3(1.0 - (width - diff) / width);',
			'}',
			'}',
			'if (lum < 0.75) {',
			'float diff = abs(mod(gl_FragCoord.x - gl_FragCoord.y, spread) - halfSpread);',
			'if (diff <= width) {',
			'mult *= vec3(1.0 - (width - diff) / width);',
			'}',
			'}',
			'if (lum < 0.50) {',
			'float diff = abs(mod(gl_FragCoord.x + halfSpread + gl_FragCoord.y, spread) - halfSpread);',
			'if (diff <= width) {',
			'mult *= vec3(1.0 - (width - diff) / width);',
			'}',
			'}',
			'if (lum < 0.25) {',
			'float diff = abs(mod(gl_FragCoord.x + halfSpread - gl_FragCoord.y, spread) - halfSpread);',
			'if (diff <= width) {',
			'mult *= vec3(1.0 - (width - diff) / width);',
			'}',
			'}',
			'if (replace) {',
			'gl_FragColor.rgb = mult;',
			'} else {',
			'gl_FragColor.rgb *= mult;',
			'}',
			'}'
		].join('\n')
	};

	ShaderLibExtra.ssao = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			tDepth: Shader.DEPTH_MAP,
			size: [512, 512],
			cameraNear: Shader.MAIN_NEAR_PLANE,
			cameraFar: Shader.MAIN_FAR_PLANE,
			fogNear: Shader.MAIN_NEAR_PLANE,
			fogFar: Shader.MAIN_FAR_PLANE,
			fogEnabled: 0,
			onlyAO: 0,
			aoClamp: 0.3,
			lumInfluence: 0.0
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
			'uniform float cameraNear;',
			'uniform float cameraFar;',

			'uniform float fogNear;',
			'uniform float fogFar;',

			'uniform bool fogEnabled;',  // attenuate AO with linear fog
			'uniform bool onlyAO;',      // use only ambient occlusion pass?

			'uniform vec2 size;',        // texture width, height
			'uniform float aoClamp;',    // depth clamp - reduces haloing at screen edges

			'uniform float lumInfluence;',  // how much luminance affects occlusion

			'uniform sampler2D tDiffuse;',
			'uniform sampler2D tDepth;',

			'varying vec2 vUv;',

			// '#define PI 3.14159265',
			'#define DL 2.399963229728653',  // PI * ( 3.0 - sqrt( 5.0 ) )
			'#define EULER 2.718281828459045',

			// helpers
			'float width = size.x;',   // texture width
			'float height = size.y;',  // texture height

			'float cameraFarPlusNear = cameraFar + cameraNear;',
			'float cameraFarMinusNear = cameraFar - cameraNear;',
			'float cameraCoef = 2.0 * cameraNear;',

			// user variables
			'const int samples = 16;',    // ao sample count
			'const float radius = 2.0;',  // ao radius

			'const bool useNoise = false;',      // use noise instead of pattern for sample dithering
			'const float noiseAmount = 0.0003;', // dithering amount

			'const float diffArea = 0.4;',  // self-shadowing reduction
			'const float gDisplace = 0.4;', // gauss bell center

//			'const vec3 onlyAOColor = vec3( 1.0, 0.7, 0.5 );',
			'const vec3 onlyAOColor = vec3( 1.0, 1.0, 1.0 );',

			// RGBA depth
			'float unpackDepth( const in vec4 rgba_depth ) {',
			'const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );',
			'float depth = dot( rgba_depth, bit_shift );',
			'return depth;',
			'}',

			// generating noise / pattern texture for dithering
			'vec2 rand( const vec2 coord ) {',
			'vec2 noise;',

			'if ( useNoise ) {',
			'float nx = dot ( coord, vec2( 12.9898, 78.233 ) );',
			'float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );',

			'noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );',
			'} else {',
			'float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );',
			'float gg = fract( coord.t * ( height / 2.0 ) );',

			'noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;',
			'}',

			'return ( noise * 2.0  - 1.0 ) * noiseAmount;',
			'}',

			'float doFog() {',
			'float zdepth = unpackDepth( texture2D( tDepth, vUv ) );',
			'float depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );',

			'return smoothstep( fogNear, fogFar, depth );',
			'}',

			'float readDepth( const in vec2 coord ) {',
//				 'return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );',
			'return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );',
			'}',

			'float compareDepths( const in float depth1, const in float depth2, inout int far ) {',
			'float garea = 2.0;',                         // gauss bell width
			'float diff = ( depth1 - depth2 ) * 100.0;',  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing
			'if ( diff < gDisplace ) {',
			'garea = diffArea;',
			'} else {',
			'far = 1;',
			'}',

			'float dd = diff - gDisplace;',
			'float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );',
			'return gauss;',
			'}',

			'float calcAO( float depth, float dw, float dh ) {',
			'float dd = radius - depth * radius;',
			'vec2 vv = vec2( dw, dh );',

			'vec2 coord1 = vUv + dd * vv;',
			'vec2 coord2 = vUv - dd * vv;',

			'float temp1 = 0.0;',
			'float temp2 = 0.0;',

			'int far = 0;',
			'temp1 = compareDepths( depth, readDepth( coord1 ), far );',

			// DEPTH EXTRAPOLATION
			'if ( far > 0 ) {',
			'temp2 = compareDepths( readDepth( coord2 ), depth, far );',
			'temp1 += ( 1.0 - temp1 ) * temp2;',
			'}',

			'return temp1;',
			'}',

			'void main() {',
			'vec2 noise = rand( vUv );',
			'float depth = readDepth( vUv );',

			'float tt = clamp( depth, aoClamp, 1.0 );',

			'float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );',
			'float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );',

			'float pw;',
			'float ph;',

			'float ao;',

			'float dz = 1.0 / float( samples );',
			'float z = 1.0 - dz / 2.0;',
			'float l = 0.0;',

			'for ( int i = 0; i <= samples; i ++ ) {',
			'float r = sqrt( 1.0 - z );',

			'pw = cos( l ) * r;',
			'ph = sin( l ) * r;',
			'ao += calcAO( depth, pw * w, ph * h );',
			'z = z - dz;',
			'l = l + DL;',
			'}',

			'ao /= float( samples );',
			'ao = 1.0 - ao;',

			'if ( fogEnabled ) {',
			'ao = mix( ao, 1.0, doFog() );',
			'}',

			'vec3 color = texture2D( tDiffuse, vUv ).rgb;',

			'vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );',
			'float lum = dot( color.rgb, lumcoeff );',
			'vec3 luminance = vec3( lum );',

			'vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );',  // mix( color * ao, white, luminance )

			'if ( onlyAO ) {',
			'final = onlyAOColor * vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );', // ambient occlusion only
			'}',

			'gl_FragColor = vec4( final, 1.0 );',
//				'gl_FragColor = vec4( vec3(unpackDepth( texture2D( tDepth, vUv ))), 1.0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.skinning = {
		defines: {
			JOINT_COUNT: 56,
			WEIGHTS: 4
		},
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0,
			vertexWeights: MeshData.WEIGHTS,
			vertexJointIDs: MeshData.JOINTIDS
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
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
						//! AT: better names pls
						// store is supergeneric
						// what does 'sk' stand for?
						skMesh.store = store;
					}
					// whenever you're reading this code you have to
					// keep a table in your head with arbitrary abbreviations
					// reference material?
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
			'mat4 mat = mat4(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);',

//		'for (int i = 0; i < WEIGHTS; i++) {',
//			'mat += jointPalette[int(vertexJointIDs[i])] * vertexWeights[i];',
//		'}',

			'mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;',
			'mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;',
			'mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;',
			'mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;',
			'texCoord0 = vertexUV0;',
			'gl_Position = viewProjectionMatrix * worldMatrix * mat * vec4(vertexPosition, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'gl_FragColor = texture2D(diffuseMap, texCoord0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.rgbshift = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			amount: 0.005,
			angle: 0.0
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
			'uniform float amount;',
			'uniform float angle;',

			'varying vec2 vUv;',

			'void main() {',
			'vec2 offset = amount * vec2( cos(angle), sin(angle));',
			'vec4 cr = texture2D(tDiffuse, vUv + offset);',
			'vec4 cga = texture2D(tDiffuse, vUv);',
			'vec4 cb = texture2D(tDiffuse, vUv - offset);',
			'gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.brightnesscontrast = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			brightness: 0,
			contrast: 0,
			saturation: 0
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
			'uniform float brightness;',
			'uniform float contrast;',
			'uniform float saturation;',

			'varying vec2 vUv;',

			'void main() {',
			'gl_FragColor = texture2D( tDiffuse, vUv );',
			'gl_FragColor.rgb += brightness;',

			'if (contrast > 0.0) {',
			'gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;',
			'} else {',
			'gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;',
			'}',

			'vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), gl_FragColor.rgb));',
			'gl_FragColor.rgb = mix(gl_FragColor.rgb, gray, -saturation);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.hsb = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			hue: 0,
			saturation: 0,
			brightness: 0
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
			'uniform float hue;',
			'uniform float saturation;',
			'uniform float brightness;',

			'varying vec2 vUv;',

			ShaderFragment.methods.hsv,

			'void main() {',
			'gl_FragColor = texture2D(tDiffuse, vUv);',
			'vec3 fragHSV = rgb2hsv(gl_FragColor.rgb).xyz;',
			'fragHSV.x += hue * 0.5;',
			'fragHSV.y *= saturation + 1.0 - max(brightness, 0.0) * 2.0;',
			'fragHSV.z *= min(brightness + 1.0, 1.0);',
			'fragHSV.z += max(brightness, 0.0);',
			'fragHSV.xyz = clamp(fragHSV.xyz, vec3(-10.0, 0.0, 0.0), vec3(10.0, 1.0, 1.0));',
			'gl_FragColor.rgb = hsv2rgb(fragHSV);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.luminosity = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP
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
			'vec4 texel = texture2D( tDiffuse, vUv );',
			'vec3 luma = vec3( 0.299, 0.587, 0.114 );',
			'float v = dot( texel.xyz, luma );',

			'gl_FragColor = vec4( v, v, v, texel.w );',
			'}'
		].join('\n')
	};

	ShaderLibExtra.toon = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			cameraPosition: Shader.CAMERA,
			lightPosition: Shader.LIGHT0,
			HighlightColor: [0.9, 0.8, 0.7, 1.0],
			MidColor: [0.65, 0.55, 0.45, 1.0],
			ShadowColor: [0.4, 0.3, 0.2, 1.0],
			HighlightSize: 0.2,
			ShadowSize: 0.01,
			OutlineWidth: 0.15
		},
		vshader: [
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

			'void main() {',
			'vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);',
			'N = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;',
			'L = lightPosition - worldPos.xyz;',
			'V = cameraPosition - worldPos.xyz;',
			'gl_Position = projectionMatrix * viewMatrix * worldPos;',
			'}'
		].join('\n'),
		fshader: [
			'uniform vec4 HighlightColor;',
			'uniform vec4 MidColor;',
			'uniform vec4 ShadowColor;',
			'uniform float HighlightSize;',
			'uniform float ShadowSize;',
			'uniform float OutlineWidth;',

			'varying vec3 N;',
			'varying vec3 L;',
			'varying vec3 V;',

			'void main() {',
			'vec3 n = normalize(N);',
			'vec3 l = normalize(L);',
			'vec3 v = normalize(V);',

			'float lambert = dot(l,n);',
			'vec4 color = MidColor;',
			'if (lambert > 1.0 - HighlightSize) color = HighlightColor;',
			'if (lambert < ShadowSize) color = ShadowColor;',
			'if (dot(n,v) < OutlineWidth) color = vec4(0.0,0.0,0.0,1.0);',

			'gl_FragColor = color;',
			'}'
		].join('\n')
	};

	/**
	 * Outputs the difference as tex0 - tex1, the value is tresholded to create a clearer edge.
	 */
	ShaderLibExtra.differenceOfGaussians = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			gaussBlurredImage1: 'BLUR1',
			gaussBlurredImage2: 'BLUR2',
			originalImage: 'ORIGINAL',
			threshold: 0.01,
			edgeColor: [1.0, 0.0, 1.0, 1.0],
			backgroundColor: [0.0, 0.0, 0.0, 1.0],
			backgroundMix: 1.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 texCoord0;',

			'void main(void) {',
			'texCoord0 = vertexUV0;',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D gaussBlurredImage1;',
			'uniform sampler2D gaussBlurredImage2;',
			'uniform sampler2D originalImage;',

			'uniform float threshold;',
			'uniform float backgroundMix;',

			'uniform vec4 edgeColor;',
			'uniform vec4 backgroundColor;',

			'varying vec2 texCoord0;',

			'void main(void)',
			'{',
			'vec4 blur1 = texture2D(gaussBlurredImage1, texCoord0);',
			'vec4 blur2 = texture2D(gaussBlurredImage2, texCoord0);',
			'vec4 originalColor = texture2D(originalImage, texCoord0);',
			'vec3 nonEdgeColor = mix(originalColor.rgb, backgroundColor.rgb, backgroundMix);',
			'vec3 diffColor = abs(blur1.rgb - blur2.rgb);',
			'float edgeValue = (diffColor.r + diffColor.g + diffColor.b) / 3.0;',
			'edgeValue = smoothstep(0.0, threshold, edgeValue);',
			'vec3 outputColor = mix(nonEdgeColor, edgeColor.rgb, edgeValue);',
			'gl_FragColor = vec4(outputColor, 1.0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.overlay = {
		defines: {
			OVERLAY_TYPE: 0
		},
		processors: [function (shader, shaderInfo) {
			var overlayTex = shaderInfo.material._textureMaps.OVERLAY_MAP;
			if (overlayTex) {
				shader.setDefine('OVERLAY_MAP', true);
				var offsetRepeat = shader.uniforms.offsetRepeat;
				offsetRepeat[0] = overlayTex.offset.x;
				offsetRepeat[1] = overlayTex.offset.y;
				offsetRepeat[2] = overlayTex.repeat.x;
				offsetRepeat[3] = overlayTex.repeat.y;
			} else {
				shader.removeDefine('OVERLAY_MAP');
			}
		}],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			tDiffuse2: 'OVERLAY_MAP',
			offsetRepeat: [0, 0, 1, 1],
			amount: 1
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
			ShaderFragment.blendmodes,

			'#define Mixin(base, blend, type, a)	mix(base, type(base, blend), a);',

			'uniform sampler2D tDiffuse;',
			'uniform sampler2D tDiffuse2;',
			'uniform float amount;',
			'#ifdef OVERLAY_MAP',
			'uniform vec4 offsetRepeat;',
			'#endif',

			'varying vec2 vUv;',

			'void main() {',
			'gl_FragColor = texture2D(tDiffuse, vUv);',
			'#ifdef OVERLAY_MAP',
			'vec2 oUv = vUv * offsetRepeat.zw + offsetRepeat.xy;',
			'vec4 blendTexture = texture2D(tDiffuse2, oUv);',
			'float a = amount * blendTexture.a;',
			'#endif',
			'#if !defined(OVERLAY_MAP)',
			'#elif OVERLAY_TYPE == 0',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendNormal, a);',
			'#elif OVERLAY_TYPE == 1',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendLighten, a);',
			'#elif OVERLAY_TYPE == 2',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendDarken, a);',
			'#elif OVERLAY_TYPE == 3',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendMultiply, a);',
			'#elif OVERLAY_TYPE == 4',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendAverage, a);',
			'#elif OVERLAY_TYPE == 5',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendAdd, a);',
			'#elif OVERLAY_TYPE == 6',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendSubstract, a);',
			'#elif OVERLAY_TYPE == 7',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendDifference, a);',
			'#elif OVERLAY_TYPE == 8',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendNegation, a);',
			'#elif OVERLAY_TYPE == 9',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendExclusion, a);',
			'#elif OVERLAY_TYPE == 10',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendScreen, a);',
			'#elif OVERLAY_TYPE == 11',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendOverlay, a);',
			'#elif OVERLAY_TYPE == 12',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendSoftLight, a);',
			'#elif OVERLAY_TYPE == 13',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendHardLight, a);',
			'#elif OVERLAY_TYPE == 14',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendColorDodge, a);',
			'#elif OVERLAY_TYPE == 15',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendColorBurn, a);',
			'#elif OVERLAY_TYPE == 16',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendLinearLight, a);',
			'#elif OVERLAY_TYPE == 17',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendVividLight, a);',
			'#elif OVERLAY_TYPE == 18',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendPinLight, a);',
			'#elif OVERLAY_TYPE == 19',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendHardMix, a);',
			'#elif OVERLAY_TYPE == 20',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendReflect, a);',
			'#elif OVERLAY_TYPE == 21',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendGlow, a);',
			'#elif OVERLAY_TYPE == 22',
			'gl_FragColor.rgb = Mixin(gl_FragColor.rgb, blendTexture.rgb, BlendPhoenix, a);',
			'#endif',
			'}'
		].join('\n')
	};

	ShaderLibExtra.levels = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			gamma: 1,
			minInput: 0,
			maxInput: 1,
			minOutput: 0,
			maxOutput: 1
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
			ShaderFragment.blendmodes,

			'uniform sampler2D tDiffuse;',
			'uniform float gamma;',
			'uniform float minInput;',
			'uniform float maxInput;',
			'uniform float minOutput;',
			'uniform float maxOutput;',

			'varying vec2 vUv;',

			'void main() {',
			'gl_FragColor = texture2D( tDiffuse, vUv );',
			'gl_FragColor.rgb = LevelsControl(gl_FragColor.rgb, minInput, gamma, maxInput, minOutput, maxOutput);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.boxfilter = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			viewport: [128, 128]
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
			'uniform vec2 viewport;',

			'varying vec2 vUv;',

			'void main() {',
			'vec3 result = vec3(0.0);',
			'for(int x=-1; x<=1; x++) {',
			'for(int y=-1; y<=1; y++) {',
			'result += texture2D(tDiffuse, vUv + vec2(x, y) / viewport).rgb;',
			'}',
			'}',
			'gl_FragColor = vec4(result / vec3(9.0), 1.0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.radial = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			frameBufSize: Shader.RESOLUTION,
			offset: 0.5,
			multiplier: -0.75
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 texCoords;',

			'void main() {',
			'texCoords = vertexUV0;',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D tDiffuse;',
			'uniform vec2 frameBufSize;',
			'uniform float offset;',
			'uniform float multiplier;',

			'varying vec2 texCoords;',

			'void main() {',
			'vec2 uv = texCoords - 0.5;',
			'vec3 o = texture2D(tDiffuse, 0.5 + (uv.xy *= 0.992)).rgb;',
			'float z = 0.0;',
			'for (float i = 0.0; i < 50.0; i++) {',
			'vec3 T = texture2D(tDiffuse, 0.5 + (uv.xy *= 0.992)).rgb;',
			'z += pow(max(0.0, offset + length(T) * multiplier), 2.0) * exp(-i * 0.08);',
			'}',
			'gl_FragColor = vec4(o*o + z, 1.0);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.packDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			farPlane: Shader.FAR_PLANE
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec4 vPosition;',

			'void main(void) {',
			'vPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'gl_Position = projectionMatrix * vPosition;',
			'}'
		].join('\n'),
		fshader: [
			'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'varying vec4 vPosition;',

			'void main(void)',
			'{',
			'float linearDepth = min(length(vPosition), farPlane) / farPlane;',
			'gl_FragColor = packDepth(linearDepth);',
			'}'
		].join('\n')
	};

	ShaderLibExtra.antialias = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			tDiffuse: Shader.DIFFUSE_MAP,
			frameBufSize: Shader.RESOLUTION,
			FXAA_SPAN_MAX: 8.0,
			FXAA_REDUCE_MUL: 1.0 / 8.0
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'varying vec2 texCoords;',

			'void main() {',
			'texCoords = vertexUV0;',
			'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D tDiffuse;',
			'uniform vec2 frameBufSize;',
			'uniform float FXAA_SPAN_MAX;',
			'uniform float FXAA_REDUCE_MUL;',

			'varying vec2 texCoords;',

			'void main() {',
			'float FXAA_REDUCE_MIN = 1.0/128.0;',

			'vec3 rgbNW = texture2D(tDiffuse, texCoords + (vec2(-1.0, -1.0) / frameBufSize)).xyz;',
			'vec3 rgbNE = texture2D(tDiffuse, texCoords + (vec2(1.0, -1.0) / frameBufSize)).xyz;',
			'vec3 rgbSW = texture2D(tDiffuse, texCoords + (vec2(-1.0, 1.0) / frameBufSize)).xyz;',
			'vec3 rgbSE = texture2D(tDiffuse, texCoords + (vec2(1.0, 1.0) / frameBufSize)).xyz;',
			'vec3 rgbM = texture2D(tDiffuse, texCoords).xyz;',

			'vec3 luma=vec3(0.299, 0.587, 0.114);',
			'float lumaNW = dot(rgbNW, luma);',
			'float lumaNE = dot(rgbNE, luma);',
			'float lumaSW = dot(rgbSW, luma);',
			'float lumaSE = dot(rgbSE, luma);',
			'float lumaM  = dot(rgbM,  luma);',
			'float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));',
			'float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));',
			'vec2 dir;',
			'dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
			'dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',
			'float dirReduce = max(',
			'		(lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),',
			'		FXAA_REDUCE_MIN);',
			'float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);',
			'dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),',
			'		  max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
			'		  dir * rcpDirMin)) / frameBufSize;',
			'vec3 rgbA = (1.0/2.0) * (',
			'		texture2D(tDiffuse, texCoords.xy + dir * (1.0/3.0 - 0.5)).xyz +',
			'		texture2D(tDiffuse, texCoords.xy + dir * (2.0/3.0 - 0.5)).xyz);',
			'vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (',
			'		texture2D(tDiffuse, texCoords.xy + dir * (0.0/3.0 - 0.5)).xyz +',
			'		texture2D(tDiffuse, texCoords.xy + dir * (3.0/3.0 - 0.5)).xyz);',
			'float lumaB = dot(rgbB, luma);',
			'if ((lumaB < lumaMin) || (lumaB > lumaMax)) {',
			'		gl_FragColor.xyz=rgbA;',
			'} else{',
			'		gl_FragColor.xyz=rgbB;',
			'}',
			'}'
		].join('\n')
	};

	module.exports = ShaderLibExtra;