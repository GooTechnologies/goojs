goo.ShaderLibExtra = (function (
	MeshData,
	Shader,
	ShaderFragment,
	ShaderBuilder,
	ShaderLib,
	World
) {
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
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			near: Shader.NEAR_PLANE,
			far: Shader.FAR_PLANE
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',

			'void main(void) {',
			'gl_Position = viewProjectionMatrix * (worldMatrix * vec4(vertexPosition, 1.0));',
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
				'vUv = uv;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',
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

	return ShaderLibExtra;
})(goo.MeshData,goo.Shader,goo.ShaderFragment,goo.ShaderBuilder,goo.ShaderLib,goo.World);
goo.BloomPass = (function (
	Material,
	FullscreenUtils,
	RenderTarget,
	ObjectUtils,
	ShaderLib,
	ShaderLibExtra,
	Pass
) {
	'use strict';

	/**
	 * @example-link http://code.gooengine.com/latest/visual-test/goo/passpack/BloomPass/BloomPass-vtest.html Working example
	 * <pre>
	 * settings: {
	 *     strength: 1.0,
	 *     sigma: 4.0,
	 *     sizeX: 256,
	 *     sizeY: 256
	 * }
	 * </pre>
	 */
	function BloomPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var strength = settings.strength !== undefined ? settings.strength : 0.0;
		var sigma = settings.sigma !== undefined ? settings.sigma : 4.0;
		var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
		this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 4;

		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0,
			y: 0,
			width: width,
			height: height
		});

		this.renderable = {
			meshData: FullscreenUtils.quad,
			materials: []
		};

		this.copyMaterial = new Material(ShaderLib.copyPure);
		this.copyMaterial.uniforms.opacity = strength;
		this.copyMaterial.blendState.blending = 'AdditiveBlending';

		this.convolutionShader = ObjectUtils.deepClone(ShaderLib.convolution);
		this.convolutionShader.defines = {
			'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
			'KERNEL_SIZE_INT': kernelSize.toFixed(0)
		};
		this.convolutionMaterial = new Material(this.convolutionShader);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;
		this.convolutionMaterial.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);

		this.bcMaterial = new Material(ShaderLibExtra.brightnesscontrast);
		this.bcMaterial.uniforms.brightness = 0.0;
		this.bcMaterial.uniforms.contrast = 0.0;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	BloomPass.prototype = Object.create(Pass.prototype);
	BloomPass.prototype.constructor = BloomPass;

	BloomPass.prototype.destroy = function (renderer) {
		if (this.renderTargetX) {
			this.renderTargetX.destroy(renderer.context);
		}
		if (this.renderTargetY) {
			this.renderTargetY.destroy(renderer.context);
		}
		this.convolutionMaterial.shader.destroy();
		this.copyMaterial.shader.destroy();
		this.bcMaterial.shader.destroy();
	};

	BloomPass.prototype.invalidateHandles = function (renderer) {
		renderer.invalidateMaterial(this.convolutionMaterial);
		renderer.invalidateMaterial(this.copyMaterial);
		renderer.invalidateMaterial(this.convolutionMaterial);
		renderer.invalidateMaterial(this.bcMaterial);
		renderer.invalidateRenderTarget(this.renderTargetX);
		renderer.invalidateRenderTarget(this.renderTargetY);
		renderer.invalidateMeshData(this.renderable.meshData);
	};

	BloomPass.prototype.updateSize = function (size, renderer) {
		var sizeX = size.width / this.downsampleAmount;
		var sizeY = size.height / this.downsampleAmount;
		if (this.renderTargetX) {
			this.renderTargetX.destroy(renderer.context);
		}
		if (this.renderTargetY) {
			this.renderTargetY.destroy(renderer.context);
		}
		this.renderTargetX = new RenderTarget(sizeX, sizeY);
		this.renderTargetY = new RenderTarget(sizeX, sizeY);
	};

	BloomPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		// Brightness & contrast
		this.renderable.materials[0] = this.bcMaterial;

		this.bcMaterial.setTexture('DIFFUSE_MAP', readBuffer);
		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetY, true);

		// Blur Y
		this.renderable.materials[0] = this.convolutionMaterial;

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurY;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetX, true);

		// Blur X
		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionMaterial.uniforms.uImageIncrement = BloomPass.blurX;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetY, true);

		// Additive blend
		this.renderable.materials[0] = this.copyMaterial;
		this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtils.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtils.camera, [], readBuffer, this.clear);
		}
	};

	BloomPass.blurX = [0.001953125, 0.0];
	BloomPass.blurY = [0.0, 0.001953125];

	return BloomPass;
})(goo.Material,goo.FullscreenUtils,goo.RenderTarget,goo.ObjectUtils,goo.ShaderLib,goo.ShaderLibExtra,goo.Pass);
goo.BlurPass = (function (
	Material,
	FullscreenUtils,
	RenderTarget,
	ObjectUtils,
	ShaderLib,
	Pass
) {
	'use strict';

	/**
	 * <pre>
	 * settings: {
	 *     target: null,
	 *     strength: 1.0,
	 *     sigma: 4.0,
	 *     sizeX: 256,
	 *     sizeY: 256
	 * }
	 * </pre>
	 */
	function BlurPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var strength = settings.strength !== undefined ? settings.strength : 1.0;
		var sigma = settings.sigma !== undefined ? settings.sigma : 4.0;
		var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
		this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 4;

		this.blurX = [0.001953125, 0.0];
		this.blurY = [0.0, 0.001953125];

		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0,
			y: 0,
			width: width,
			height: height
		});

		this.renderable = {
			meshData: FullscreenUtils.quad,
			materials: []
		};

		this.copyMaterial = new Material(ShaderLib.copyPure);
		this.copyMaterial.uniforms.opacity = strength;
		this.copyMaterial.blendState.blending = 'CustomBlending';

		this.convolutionShader = ObjectUtils.deepClone(ShaderLib.convolution);
		this.convolutionShader.defines = {
			'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
			'KERNEL_SIZE_INT': kernelSize.toFixed(0)
		};
		this.convolutionShader.uniforms.uImageIncrement = this.blurX;
		this.convolutionShader.uniforms.cKernel = this.convolutionShader.buildKernel(sigma);
		this.convolutionMaterial = new Material(this.convolutionShader);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;
	}

	BlurPass.prototype = Object.create(Pass.prototype);
	BlurPass.prototype.constructor = BlurPass;

	BlurPass.prototype.destroy = function (renderer) {
		if (this.renderTargetX) {
			this.renderTargetX.destroy(renderer.context);
		}
		if (this.renderTargetY) {
			this.renderTargetY.destroy(renderer.context);
		}
		this.convolutionMaterial.shader.destroy();
		this.copyMaterial.shader.destroy();
	};

	BlurPass.prototype.invalidateHandles = function (renderer) {
		renderer.invalidateMaterial(this.convolutionMaterial);
		renderer.invalidateMaterial(this.copyMaterial);
		renderer.invalidateRenderTarget(this.renderTargetX);
		renderer.invalidateRenderTarget(this.renderTargetY);
		renderer.invalidateMeshData(this.renderable.meshData);
	};

	BlurPass.prototype.updateSize = function (size, renderer) {
		var sizeX = size.width / this.downsampleAmount;
		var sizeY = size.height / this.downsampleAmount;
		if (this.renderTargetX) {
			renderer._deallocateRenderTarget(this.renderTargetX);
		}
		if (this.renderTargetY) {
			renderer._deallocateRenderTarget(this.renderTargetY);
		}
		this.renderTargetX = new RenderTarget(sizeX, sizeY);
		this.renderTargetY = new RenderTarget(sizeX, sizeY);
	};

	BlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		this.renderable.materials[0] = this.convolutionMaterial;

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', readBuffer);
		this.convolutionMaterial.uniforms.uImageIncrement = this.blurY;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetX, true);

		this.convolutionMaterial.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionMaterial.uniforms.uImageIncrement = this.blurX;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetY, true);

		this.renderable.materials[0] = this.copyMaterial;
		this.copyMaterial.setTexture('DIFFUSE_MAP', this.renderTargetY);

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtils.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtils.camera, [], readBuffer, this.clear);
		}
	};

	return BlurPass;
})(goo.Material,goo.FullscreenUtils,goo.RenderTarget,goo.ObjectUtils,goo.ShaderLib,goo.Pass);
goo.DepthPass = (function (
	Material,
	RenderTarget,
	MeshData,
	Shader,
	ShaderFragment,
	RenderPass,
	FullscreenPass,
	Pass,
	BlurPass
) {
	'use strict';

	/**
	 * Depth pass
	 * @param renderList
	 * @param outShader
	 */
	function DepthPass(renderList, outShader) {
		this.depthPass = new RenderPass(renderList);
		var packDepthMaterial = new Material(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		this.blurTarget = new RenderTarget(256, 256);
		this.blurPass = new BlurPass({
			target: this.blurTarget
		});

		var shader = outShader || unpackDepth;
		this.outPass = new FullscreenPass(shader);
		this.outPass.useReadBuffer = false;
		// this.outPass.clear = true;

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		this.depthTarget = new RenderTarget(width, height);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	DepthPass.prototype = Object.create(Pass.prototype);
	DepthPass.prototype.constructor = DepthPass;

	DepthPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);

		this.blurPass.render(renderer, writeBuffer, readBuffer, delta);

		this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
		this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
		this.outPass.material.setTexture('BLUR_MAP', this.blurTarget);
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
//				nearPlane: Shader.NEAR_PLANE,
			farPlane: Shader.FAR_PLANE
		},
		vshader: [
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
		fshader: [
			'precision mediump float;',

//				'uniform float nearPlane;',
			'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'varying vec4 vPosition;',

			'void main(void)',
			'{',
			// ' float linearDepth = min(length(vPosition), farPlane) / (farPlane - nearPlane);',
			'	float linearDepth = min(length(vPosition), farPlane) / farPlane;',
			'	gl_FragColor = packDepth(linearDepth);',
			'}'//
		].join('\n')
	};

	var unpackDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			depthMap: Shader.DEPTH_MAP,
			diffuseMap: Shader.DIFFUSE_MAP
		},
		vshader: [
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
		fshader: [
			'precision mediump float;',

			'uniform sampler2D depthMap;',
			'uniform sampler2D diffuseMap;',

			'varying vec2 texCoord0;',

			ShaderFragment.methods.unpackDepth,

			'void main(void)',
			'{',
			'	vec4 depthCol = texture2D(depthMap, texCoord0);',
			'	vec4 diffuseCol = texture2D(diffuseMap, texCoord0);',
			'	float depth = unpackDepth(depthCol);',
			'	gl_FragColor = diffuseCol * vec4(depth);',
			'}'//
		].join('\n')
	};

	return DepthPass;
})(goo.Material,goo.RenderTarget,goo.MeshData,goo.Shader,goo.ShaderFragment,goo.RenderPass,goo.FullscreenPass,goo.Pass,goo.BlurPass);
goo.DofPass = (function (
	Material,
	RenderTarget,
	MeshData,
	Shader,
	ShaderFragment,
	RenderPass,
	FullscreenPass,
	BlurPass,
	RendererUtils,
	Skybox,
	MathUtils,
	Pass
) {
	'use strict';

	/**
	 * Deph of field pass
	 * @param renderList
	 * @param outShader
	 */
	function DofPass(renderList, outShader) {
		this.depthPass = new RenderPass(renderList, function (item) {
			return !(item instanceof Skybox);
		});
		this.regularPass = new RenderPass(renderList);
		var packDepthMaterial = new Material(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		var shader = outShader || unpackDepth;
		this.outPass = new FullscreenPass(shader);
		this.outPass.useReadBuffer = false;
		this.outPass.renderToScreen = true;

		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		var size = MathUtils.nearestPowerOfTwo(Math.max(width, height));
		this.depthTarget = new RenderTarget(width, height);
		this.regularTarget = new RenderTarget(size / 2, size / 2);
		this.regularTarget2 = new RenderTarget(width, height);
		this.regularTarget.generateMipmaps = true;
		this.regularTarget.minFilter = 'Trilinear';

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	DofPass.prototype = Object.create(Pass.prototype);
	DofPass.prototype.constructor = DofPass;

	DofPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);
		this.regularPass.render(renderer, null, this.regularTarget, delta);
		this.regularPass.render(renderer, null, this.regularTarget2, delta);

		this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
		this.outPass.material.setTexture(Shader.DIFFUSE_MAP, this.regularTarget);
		this.outPass.material.setTexture('DIFFUSE_MIP', this.regularTarget2);
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
//				nearPlane: Shader.NEAR_PLANE,
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
			'}'//
		].join('\n'),
		fshader: [
			'precision mediump float;',

//				'uniform float nearPlane;',
			'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'varying vec4 vPosition;',

			'void main(void)',
			'{',
				'float linearDepth = min(-vPosition.z, farPlane) / farPlane;',
				'gl_FragColor = packDepth(linearDepth);',
			'}'//
		].join('\n')
	};

	var unpackDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			worldMatrix: Shader.WORLD_MATRIX,
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			depthMap: Shader.DEPTH_MAP,
			diffuseMap: Shader.DIFFUSE_MAP,
			diffuseMip: 'DIFFUSE_MIP',
			zfar: Shader.FAR_PLANE,
			focalDepth: 100.0,
			fStop: 2.0,
			CoC: 0.003,
			focalLength: 75.0,
			maxBlur: 16.0
		},
		vshader: [
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
		fshader: '' +
		'uniform sampler2D diffuseMap;\n' +
		'uniform sampler2D diffuseMip;\n' +
		'uniform sampler2D depthMap;\n' +
		'uniform float zfar; //camera clipping end\n' +
		'uniform float focalDepth;\n' +
		'uniform float focalLength;\n' +
		'uniform float fStop;\n' +
		'uniform float CoC;\n' +
		'uniform float maxBlur;\n' +
		'varying vec2 texCoord0;\n' +

		ShaderFragment.methods.unpackDepth +

		'void main() {\n' +
			'float depth = unpackDepth(texture2D(depthMap,texCoord0)) * zfar;\n' +
			'float f = focalLength; //focal length in mm\n' +
			'float d = focalDepth*1000.0; //focal plane in mm\n' +
			'float o = depth*1000.0; //depth in mm\n' +

			'float a = (o*f)/(o-f);\n' +
			'float b = (d*f)/(d-f);\n' +
			'float c = (d-f)/(d*fStop*CoC); \n' +

			'float blur = clamp(abs(a-b)*c, 0.0, maxBlur);\n' +
			'if (blur < 0.3) {\n' +
				'gl_FragColor = texture2D(diffuseMip, texCoord0);\n' +
			'} else {\n' +
				'gl_FragColor = texture2D(diffuseMap, texCoord0, log2(blur));\n' +
			'}\n' +
			'gl_FragColor.a = 1.0;' +
		'}'
	};

	return DofPass;
})(goo.Material,goo.RenderTarget,goo.MeshData,goo.Shader,goo.ShaderFragment,goo.RenderPass,goo.FullscreenPass,goo.BlurPass,goo.RendererUtils,goo.Skybox,goo.MathUtils,goo.Pass);
goo.DogPass = (function (
	Material,
	FullscreenUtils,
	RenderTarget,
	ObjectUtils,
	ShaderLib,
	ShaderLibExtra,
	Pass
) {
	'use strict';

	/**
	* Difference of Gaussian Filter pass.
	* Usable for edge detection.
	*
	* A lower sigma will create thinner edgelines, tune to get the sweetspot.
	* Maximum sigma is 2.5.
	*
	* http://en.wikipedia.org/wiki/Difference_of_Gaussians
	* http://www.tara.tcd.ie/bitstream/2262/12840/1/eg07.pdf , Adaptive Abstraction of 3D Scenes in Real-Time by Redmond and Dingliana, 2007
	*/
	function DogPass(settings) {
		settings = settings || {};

		this.target = settings.target !== undefined ? settings.target : null;
		var width = settings.width !== undefined ? settings.width : 1024;
		var height = settings.height !== undefined ? settings.height : 1024;
		var sigma = settings.sigma !== undefined ? settings.sigma : 0.6;
		var threshold = settings.threshold !== undefined ? settings.threshold : 0.005;
		this.downsampleAmount = settings.downsampleAmount !== undefined ? Math.max(settings.downsampleAmount, 1) : 2;

		if (sigma > 2.5) {
			sigma = 2.5;
		}

		this.updateSize({ width: width, height: height });

		this.renderable = {
			meshData: FullscreenUtils.quad,
			materials: []
		};

		this.convolutionShader1 = ObjectUtils.deepClone(ShaderLib.convolution);
		this.convolutionShader2 = ObjectUtils.deepClone(ShaderLib.convolution);

		this.differenceShader = ObjectUtils.deepClone(ShaderLibExtra.differenceOfGaussians);
		this.differenceShader.uniforms.threshold = threshold;
		this.differenceMaterial = new Material(this.differenceShader);

		this.updateSigma(sigma);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	DogPass.prototype = Object.create(Pass.prototype);
	DogPass.prototype.constructor = DogPass;

	DogPass.prototype.destroy = function (renderer) {
		var context = renderer.context;
		if (this.convolutionMaterial1) {
			this.convolutionMaterial1.shader.destroy();
		}
		if (this.convolutionMaterial2) {
			this.convolutionMaterial2.shader.destroy();
		}
		this.differenceMaterial.shader.destroy();
		if (this.gaussian1) {
			this.gaussian1.destroy(context);
		}
		if (this.gaussian2) {
			this.gaussian2.destroy(context);
		}
		if (this.renderTargetX) {
			this.renderTargetX.destroy(context);
		}
		if (this.target) {
			this.target.destroy(context);
		}
	};

	DogPass.prototype.updateThreshold = function (threshold) {
		this.differenceMaterial.shader.uniforms.threshold = threshold;
	};

	DogPass.prototype.updateEdgeColor = function (color) {
		this.differenceMaterial.shader.uniforms.edgeColor = [color[0], color[1], color[2], 1.0];
	};

	DogPass.prototype.updateBackgroundColor = function (color) {
		this.differenceMaterial.shader.uniforms.backgroundColor = [color[0], color[1], color[2], 1.0];
	};

	DogPass.prototype.updateBackgroundMix = function (amount) {
		this.differenceMaterial.shader.uniforms.backgroundMix = amount;
	};

	DogPass.prototype.updateSize = function (size) {
		var sizeX = size.width / this.downsampleAmount;
		var sizeY = size.height / this.downsampleAmount;
		this.renderTargetX = new RenderTarget(sizeX, sizeY);
		this.gaussian1 = new RenderTarget(sizeX, sizeY);
		this.gaussian2 = new RenderTarget(sizeX, sizeY);

		this.blurX = [0.5 / sizeX, 0.0];
		this.blurY = [0.0, 0.5 / sizeY];
	};

	DogPass.prototype.updateSigma = function (sigma) {
		// Use a ratio between the sigmas of 1.6 to approximate the Laplacian of Gaussian [Marr–Hildreth].
		// The max kernelsize is 2.5 , as implemented at this time in the convolutionShader, this means the max sigma to be used properly is 4.0
		var kernel1 = this.convolutionShader1.buildKernel(sigma);
		var kernel2 = this.convolutionShader2.buildKernel(1.6 * sigma);

		var kernelSize = kernel1.length;

		this.convolutionShader1.defines = {
			'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
			'KERNEL_SIZE_INT': kernelSize.toFixed(0)
		};

		kernelSize = kernel2.length;

		this.convolutionShader2.defines = {
			'KERNEL_SIZE_FLOAT': kernelSize.toFixed(1),
			'KERNEL_SIZE_INT': kernelSize.toFixed(0)
		};

		this.convolutionShader1.uniforms.cKernel = kernel1;
		this.convolutionShader2.uniforms.cKernel = kernel2;

		this.convolutionMaterial1 = new Material(this.convolutionShader1);
		this.convolutionMaterial2 = new Material(this.convolutionShader2);
	};

	DogPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		// Gaussian sigma1
		this.renderable.materials[0] = this.convolutionMaterial1;

		this.convolutionMaterial1.setTexture('DIFFUSE_MAP', readBuffer);
		this.convolutionShader1.uniforms.uImageIncrement = this.blurX;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetX, true);

		this.convolutionMaterial1.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionShader1.uniforms.uImageIncrement = this.blurY;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.gaussian1, true);

		// Gaussian sigma2
		this.renderable.materials[0] = this.convolutionMaterial2;

		this.convolutionMaterial2.setTexture('DIFFUSE_MAP', readBuffer);
		this.convolutionShader2.uniforms.uImageIncrement = this.blurX;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.renderTargetX, true);

		this.convolutionMaterial2.setTexture('DIFFUSE_MAP', this.renderTargetX);
		this.convolutionShader2.uniforms.uImageIncrement = this.blurY;

		renderer.render(this.renderable, FullscreenUtils.camera, [], this.gaussian2, true);

		// OUT
		this.renderable.materials[0] = this.differenceMaterial;
		// produces the difference gaussian1 - gaussian2
		this.differenceMaterial.setTexture('BLUR1', this.gaussian1);
		this.differenceMaterial.setTexture('BLUR2', this.gaussian2);
		this.differenceMaterial.setTexture('ORIGINAL', readBuffer);

		if (this.target !== null) {
			renderer.render(this.renderable, FullscreenUtils.camera, [], this.target, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtils.camera, [], writeBuffer, this.clear);
		}
	};

	DogPass.prototype.invalidateHandles = function (renderer) {
		renderer.invalidateMaterial(this.convolutionMaterial1);
		renderer.invalidateMaterial(this.convolutionMaterial2);
		renderer.invalidateMaterial(this.differenceMaterial);
		renderer.invalidateMeshData(this.renderable.meshData);

		renderer.invalidateRenderTarget(this.renderTargetX);
		renderer.invalidateRenderTarget(this.gaussian1);
		renderer.invalidateRenderTarget(this.gaussian2);
	};

	return DogPass;
})(goo.Material,goo.FullscreenUtils,goo.RenderTarget,goo.ObjectUtils,goo.ShaderLib,goo.ShaderLibExtra,goo.Pass);
goo.MotionBlurPass = (function (
	Material,
	Shader,
	ShaderLib,
	FullscreenUtils,
	MeshData,
	RenderTarget,
	FullscreenPass,
	Pass
) {
	'use strict';

	function MotionBlurPass() {
		this.inPass = new FullscreenPass(blendShader);
		this.outPass = new FullscreenPass(ShaderLib.copyPure);

		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0,
			y: 0,
			width: width,
			height: height
		});
		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	MotionBlurPass.prototype = Object.create(Pass.prototype);
	MotionBlurPass.prototype.constructor = MotionBlurPass;

	MotionBlurPass.prototype.destroy = function (renderer) {
		this.inPass.destroy(renderer);
		this.outPass.destroy(renderer);
		if (this.targetSwap) {
			this.targetSwap[0].destroy(renderer.context);
			this.targetSwap[1].destroy(renderer.context);
			this.targetSwap = undefined;
		}
	};

	MotionBlurPass.prototype.invalidateHandles = function (renderer) {
		this.inPass.invalidateHandles(renderer);
		this.outPass.invalidateHandles(renderer);
		renderer.invalidateRenderTarget(this.targetSwap[0]);
		renderer.invalidateRenderTarget(this.targetSwap[1]);
	};

	MotionBlurPass.prototype.updateSize = function (size, renderer) {
		var sizeX = size.width;
		var sizeY = size.height;

		if (this.targetSwap) {
			for (var i = 0; i < this.targetSwap.length; i++) {
				renderer._deallocateRenderTarget(this.targetSwap[i]);
			}
		}

		this.targetSwap = [
			new RenderTarget(sizeX, sizeY),
			new RenderTarget(sizeX, sizeY)
		];
	};

	MotionBlurPass.prototype.render = function (renderer, writeBuffer, readBuffer) {
		this.inPass.material.setTexture('MOTION_MAP', this.targetSwap[1]);
		this.inPass.render(renderer, this.targetSwap[0], readBuffer);
		this.outPass.render(renderer, writeBuffer, this.targetSwap[0]);
		this.targetSwap.reverse();
	};

	var blendShader = {
		defines: {},
		processors: [function (shader, shaderInfo) {
			if (shaderInfo.material._textureMaps.MOTION_MAP.glTexture) {
				shader.setDefine('MOTION_MAP', true);
			} else {
				shader.removeDefine('MOTION_MAP');
			}
		}],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			blend: 0.90,
			scale: 1.0,
			diffuseMap: Shader.DIFFUSE_MAP,
			motionMap: 'MOTION_MAP'
		},
		vshader: [
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
		fshader: [
		'uniform sampler2D diffuseMap;',
		'uniform sampler2D motionMap;',
		'uniform float blend;',
		'uniform float scale;',

		'varying vec2 texCoord0;',

		'void main(void)',
		'{',
			'vec4 colA = texture2D(diffuseMap, texCoord0);',
			'#ifdef MOTION_MAP',
			'vec4 colB = texture2D(motionMap, (texCoord0 - 0.5) / scale + 0.5);',
			'float wBlend = blend;// * length(colB) / sqrt(3.0);',
			'gl_FragColor = mix(colA, colB, wBlend);',
			'#else',
			'gl_FragColor = colA;',
			'#endif',
		'}'
		].join('\n')
	};

	return MotionBlurPass;
})(goo.Material,goo.Shader,goo.ShaderLib,goo.FullscreenUtils,goo.MeshData,goo.RenderTarget,goo.FullscreenPass,goo.Pass);
goo.PassLib = (function (
	ShaderLibExtra,
	FullscreenPass,
	BloomPass,
	BlurPass,
	DogPass,
	MotionBlurPass,
	ObjectUtils
) {
	'use strict';

	function Bloom(id) {
		BloomPass.call(this);
		this.id = id;
	}

	Bloom.prototype = Object.create(BloomPass.prototype);
	Bloom.prototype.constructor = Bloom;

	Bloom.prototype.update = function (config) {
		var options = config.options || {};
		if (options.opacity !== undefined) {
			this.copyMaterial.uniforms.opacity = options.opacity / 100;
		}
		if (options.size !== undefined) {
			this.convolutionMaterial.uniforms.size = options.size;
		}
		if (options.brightness !== undefined) {
			this.bcMaterial.uniforms.brightness = options.brightness / 100;
		}
		if (options.contrast !== undefined) {
			this.bcMaterial.uniforms.contrast = options.contrast / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Bloom.label = 'Bloom';
	Bloom.options = [
		{
			key: 'opacity',
			name: 'Opacity',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 100,
			'default': 100
		},
		{
			key: 'size',
			name: 'Size',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 10,
			decimals: 1,
			'default': 2
		},
		{
			key: 'brightness',
			name: 'Gain',
			type: 'int',
			control: 'slider',
			min: -100,
			max: 100,
			'default': 0
		},
		{
			key: 'contrast',
			name: 'Intensity',
			type: 'int',
			control: 'slider',
			min: -100,
			max: 100,
			'default': 0
		}
	];

	function DiffOfGaussians(id) {
		DogPass.call(this, arguments);
		this.id = id;
	}

	//! AT: we use both "DiffOfGaussians" and "DoG"
	DiffOfGaussians.prototype = Object.create(DogPass.prototype);
	DiffOfGaussians.prototype.constructor = DiffOfGaussians;

	DiffOfGaussians.prototype.update = function (config) {
		var options = config.options || {};

		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}

		if (options.sigma !== undefined) {
			this.updateSigma(options.sigma);
		}

		if (options.threshold !== undefined) {
			this.updateThreshold(options.threshold);
		}

		if (options.edgeColor !== undefined) {
			this.updateEdgeColor(options.edgeColor);
		}

		if (options.backgroundColor !== undefined) {
			this.updateBackgroundColor(options.backgroundColor);
		}

		if (options.backgroundMix !== undefined) {
			this.updateBackgroundMix(options.backgroundMix);
		}
	};

	DiffOfGaussians.label = 'Edge detect';
	DiffOfGaussians.options = [
		{
			key: 'sigma',
			name: 'Gauss Sigma',
			type: 'float',
			control: 'slider',
			min: 0.01,
			max: 1.7,
			decimals: 2,
			'default': 0.6
		},
		{
			key: 'threshold',
			name: 'Threshold',
			type: 'float',
			control: 'slider',
			min: 0.00000000000001,
			max: 0.11,
			decimals: 20,
			'default': 0.005
		},
		{
			key: 'backgroundMix',
			name: 'Background %',
			type: 'float',
			control: 'slider',
			min: 0.0,
			max: 1.0,
			decimals: 2,
			'default': 0.0
		},
		{
			key: 'edgeColor',
			name: 'Edge Color',
			type: 'vec3',
			control: 'color',
			'default': [0.0, 1.0, 0.0]
		},
		{
			key: 'backgroundColor',
			name: 'Background Color',
			type: 'vec3',
			control: 'color',
			'default': [0.0, 0.0, 0.0]
		}
	];

	function Blur(id) {
		BlurPass.call(this, arguments);
		this.id = id;
	}
	Blur.prototype = Object.create(BlurPass.prototype);
	Blur.prototype.constructor = Blur;

	Blur.prototype.update = function (config) {
		var options = config.options || {};
		if (options.opacity !== undefined) {
			this.copyMaterial.uniforms.opacity = options.opacity / 100;
		}
		if (options.size !== undefined) {
			this.blurX = [0.001953125 * options.size, 0.0];
			this.blurY = [0.0, 0.001953125 * options.size];
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Blur.label = 'Blur';
	Blur.options = [
		{
			key: 'opacity',
			name: 'Amount',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 100,
			'default': 100
		},
		{
			key: 'size',
			name: 'Size',
			type: 'float',
			control: 'slider',
			min: 0.0,
			max: 5,
			decimals: 1,
			'default': 1
		}
	];

	function Vignette(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.vignette));
		this.id = id;
	}
	Vignette.prototype = Object.create(FullscreenPass.prototype);
	Vignette.prototype.construcor = Vignette;

	Vignette.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.offset !== undefined) {
			shader.uniforms.offset = options.offset;
		}
		if (options.darkness !== undefined) {
			shader.uniforms.darkness = options.darkness;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Vignette.label = 'Vignette';
	Vignette.options = [
		{
			key: 'offset',
			type: 'float',
			control: 'slider',
			name: 'Offset',
			min: 0,
			max: 10,
			decimals: 1,
			'default': 1
		},
		{
			key: 'darkness',
			type: 'float',
			control: 'slider',
			name: 'Darkness',
			min: 0,
			max: 2,
			decimals: 2,
			'default': 1.5
		}
	];

	function Sepia(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.sepia));
		this.id = id;
	}
	Sepia.prototype = Object.create(FullscreenPass.prototype);
	Sepia.prototype.constructor = Sepia;

	Sepia.prototype.update = function (config) {
		var options = config.options;
		if (options.amount !== undefined) {
			this.material.uniforms.amount = options.amount / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Sepia.label = 'Sepia';
	Sepia.options = [
		{
			key: 'amount',
			name: 'Amount',
			type: 'int',
			control: 'slider',
			min: 0,
			max: 100,
			'default': 100
		}
	];

	function Grain(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.film));
		this.id = id;
	}
	Grain.prototype = Object.create(FullscreenPass.prototype);
	Grain.prototype.constructor = Grain;

	Grain.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.nIntensity !== undefined) {
			shader.uniforms.nIntensity = options.nIntensity / 100;
		}
		if (options.sIntensity !== undefined) {
			shader.uniforms.sIntensity = options.sIntensity / 100;
		}
		if (options.sCount !== undefined) {
			shader.uniforms.sCount = options.sCount;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Grain.label = 'Film Grain';
	Grain.options = [{
		key: 'nIntensity',
		type: 'int',
		control: 'slider',
		name: 'Noise',
		min: 0,
		max: 100,
		'default': 50
	}, {
		key: 'sIntensity',
		type: 'int',
		control: 'slider',
		name: 'Line Intensity',
		min: 0,
		max: 100,
		'default': 50
	}, {
		key: 'sCount',
		type: 'int',
		control: 'slider',
		name: 'Line Count',
		min: 1,
		max: 4096,
		'default': 1024
	}];

	function Noise(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.noise));
		this.id = id;
	}
	Noise.prototype = Object.create(FullscreenPass.prototype);
	Noise.prototype.constructor = Noise;

	Noise.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.nIntensity !== undefined) {
			shader.uniforms.nIntensity = options.nIntensity / 100;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Noise.label = 'Noise';
	Noise.options = [
		{
			key: 'nIntensity',
			type: 'int',
			control: 'slider',
			name: 'Noise',
			min: 0,
			max: 100,
			'default': 50
		}
	];

	function RgbShift(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.rgbshift));
		this.id = id;
	}
	RgbShift.prototype = Object.create(FullscreenPass.prototype);
	RgbShift.prototype.constructor = RgbShift;

	RgbShift.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.amount !== undefined) {
			shader.uniforms.amount = options.amount;
		}
		if (options.angle !== undefined) {
			shader.uniforms.angle = options.angle;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	RgbShift.label = 'RgbShift';
	RgbShift.options = [
		{
			key: 'amount',
			type: 'float',
			control: 'slider',
			name: 'Amount',
			min: 0,
			max: 0.05,
			decimals: 3,
			'default': 0.005
		},
		{
			key: 'angle',
			type: 'float',
			control: 'slider',
			name: 'Angle',
			min: 0,
			max: 6.28,
			decimals: 1,
			'default': 0
		}
	];

	function Bleach(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.bleachbypass));
		this.id = id;
	}
	Bleach.prototype = Object.create(FullscreenPass.prototype);
	Bleach.prototype.constructor = Bleach;

	Bleach.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.opacity !== undefined) {
			shader.uniforms.opacity = options.opacity;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Bleach.label = 'Bleach';
	Bleach.options = [
		{
			key: 'opacity',
			type: 'float',
			control: 'slider',
			name: 'Opacity',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		}
	];

	function HSB(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.hsb));
		this.id = id;
	}
	HSB.prototype = Object.create(FullscreenPass.prototype);
	HSB.prototype.constructor = HSB;

	HSB.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.hue !== undefined) {
			shader.uniforms.hue = options.hue;
		}
		if (options.saturation !== undefined) {
			shader.uniforms.saturation = options.saturation;
		}
		if (options.brightness !== undefined) {
			shader.uniforms.brightness = options.brightness;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	HSB.label = 'HSB';
	HSB.options = [
		{
			key: 'hue',
			type: 'float',
			control: 'slider',
			name: 'Hue',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'saturation',
			type: 'float',
			control: 'slider',
			name: 'Saturation',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'brightness',
			type: 'float',
			control: 'slider',
			name: 'Brightness',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		}
	];

	function Colorify(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.colorify));
		this.id = id;
	}
	Colorify.prototype = Object.create(FullscreenPass.prototype);
	Colorify.prototype.constructor = Colorify;

	Colorify.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.color !== undefined) {
			shader.uniforms.color = options.color;
		}
		if (options.amount !== undefined) {
			shader.uniforms.amount = options.amount;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Colorify.label = 'Tint';
	Colorify.options = [
		{
			key: 'color',
			type: 'vec3',
			control: 'color',
			name: 'Color',
			'default': [1.0, 1.0, 1.0]
		},
		{
			key: 'amount',
			type: 'float',
			control: 'slider',
			name: 'Amount',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		}
	];

	function Hatch(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.hatch));
		this.id = id;
	}
	Hatch.prototype = Object.create(FullscreenPass.prototype);
	Hatch.prototype.constructor = Hatch;

	Hatch.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.width !== undefined) {
			shader.uniforms.width = options.width;
		}
		if (options.spread !== undefined) {
			shader.uniforms.spread = options.spread;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};
	Hatch.label = 'Hatch';
	Hatch.options = [
		{
			key: 'width',
			type: 'float',
			control: 'slider',
			name: 'Width',
			min: 0,
			max: 10,
			decimals: 1,
			'default': 2
		},
		{
			key: 'spread',
			type: 'int',
			control: 'slider',
			name: 'Spread',
			min: 1,
			max: 50,
			'default': 8
		}
	];

	function Dot(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.dotscreen));
		this.id = id;
	}
	Dot.prototype = Object.create(FullscreenPass.prototype);
	Dot.prototype.constructor = Dot;

	Dot.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.angle !== undefined) {
			shader.uniforms.angle = options.angle;
		}
		if (options.scale !== undefined) {
			shader.uniforms.scale = options.scale;
		}
		if (options.sizex !== undefined) {
			shader.uniforms.tSize[0] = options.sizex;
		}
		if (options.sizey !== undefined) {
			shader.uniforms.tSize[1] = options.sizey;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Dot.label = 'Dot';
	Dot.options = [
		{
			key: 'angle',
			type: 'float',
			control: 'slider',
			name: 'Angle',
			min: 0,
			max: 10,
			decimals: 2,
			'default': 1.57
		},
		{
			key: 'scale',
			type: 'float',
			control: 'slider',
			name: 'Scale',
			min: 0,
			max: 10,
			decimals: 2,
			'default': 1
		},
		{
			key: 'sizex',
			type: 'int',
			control: 'slider',
			name: 'SizeX',
			min: 0,
			max: 1024,
			'default': 256
		},
		{
			key: 'sizey',
			type: 'int',
			control: 'slider',
			name: 'SizeY',
			min: 0,
			max: 1024,
			'default': 256
		}
	];

	function Contrast(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.brightnesscontrast));
		this.id = id;
	}
	Contrast.prototype = Object.create(FullscreenPass.prototype);
	Contrast.prototype.constructor = Contrast;

	Contrast.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.brightness !== undefined) {
			shader.uniforms.brightness = options.brightness;
		}
		if (options.contrast !== undefined) {
			shader.uniforms.contrast = options.contrast;
		}
		if (options.saturation !== undefined) {
			shader.uniforms.saturation = options.saturation;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Contrast.label = 'Contrast';
	Contrast.options = [
		{
			key: 'brightness',
			type: 'float',
			control: 'slider',
			name: 'Brightness',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'contrast',
			type: 'float',
			control: 'slider',
			name: 'Contrast',
			min: 0,
			max: 1,
			'default': 0
		},
		{
			key: 'saturation',
			type: 'float',
			control: 'slider',
			name: 'Saturation',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0
		}
	];

	function MotionBlur(id) {
		MotionBlurPass.call(this);
		this.id = id;
	}
	MotionBlur.prototype = Object.create(MotionBlurPass.prototype);
	MotionBlur.prototype.constructor = MotionBlur;

	MotionBlur.prototype.update = function (config) {
		var options = config.options;
		var shader = this.inPass.material.shader;
		if (options.blend !== undefined) {
			shader.uniforms.blend = options.blend;
		}
		if (options.scale !== undefined) {
			shader.uniforms.scale = options.scale;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	MotionBlur.label = 'Motion Blur';

	MotionBlur.options = [
		{
			key: 'blend',
			type: 'float',
			control: 'slider',
			name: 'Amount',
			min: 0,
			max: 1,
			'default': 0.5
		},
		{
			key: 'scale',
			type: 'float',
			name: 'Scale',
			min: 0.2,
			'default': 1,
			scale: 0.01
		}
	];

	function Antialias(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.antialias));
		this.id = id;
	}
	Antialias.prototype = Object.create(FullscreenPass.prototype);
	Antialias.prototype.constructor = Antialias;

	Antialias.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.span !== undefined) {
			shader.uniforms.FXAA_SPAN_MAX = options.span;
			shader.uniforms.FXAA_REDUCE_MUL = 1 / options.span;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Antialias.label = 'Antialias';
	Antialias.options = [
		{
			key: 'span',
			type: 'int',
			control: 'slider',
			name: 'Span',
			min: 0,
			max: 16,
			'default': 8
		}
	];

	function Radial(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.radial));
		this.id = id;
	}
	Radial.prototype = Object.create(FullscreenPass.prototype);
	Radial.prototype.constructor = Radial;

	Radial.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.offset !== undefined) {
			shader.uniforms.offset = options.offset;
		}
		if (options.multiplier !== undefined) {
			shader.uniforms.multiplier = options.multiplier;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Radial.label = 'Radial';
	Radial.options = [
		{
			key: 'offset',
			type: 'float',
			control: 'slider',
			name: 'Offset',
			min: -1,
			max: 1,
			decimals: 2,
			'default': -0.5
		},
		{
			key: 'multiplier',
			type: 'float',
			control: 'slider',
			name: 'Multiplier',
			min: -1,
			max: 1,
			decimals: 2,
			'default': 0.75
		}
	];

	function Overlay(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.overlay));
		this.id = id;
	}
	Overlay.prototype = Object.create(FullscreenPass.prototype);
	Overlay.prototype.constructor = Overlay;

	Overlay.blendmodes = [
		'Normal',
		'Lighten',
		'Darken',
		'Multiply',
		'Average',
		'Add',
		'Substract',
		'Difference',
		'Negation',
		'Exclusion',
		'Screen',
		'Overlay',
		'SoftLight',
		'HardLight',
		'ColorDodge',
		'ColorBurn',
		'LinearLight',
		'VividLight',
		'PinLight',
		'HardMix',
		'Reflect',
		'Glow',
		'Phoenix'
	];

	Overlay.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		// if (options.url !== undefined) {
		// 	var texture = options.url; // fix texture handling in Create
		// 	if (!this.material.getTexture('OVERLAY_MAP')) {
		// 		this.material.setTexture('OVERLAY_MAP', texture);
		// 	}
		// }
		if (options.blendmode !== undefined) {
			var newBlendMode = Overlay.blendmodes.indexOf(options.blendmode);
			if (newBlendMode !== shader.defines.OVERLAY_TYPE) {
				shader.setDefine('OVERLAY_TYPE', newBlendMode);
				shader.uniforms.amount = options.amount - 0.01;
			}
		}
		if (options.amount !== undefined) {
			shader.uniforms.amount = options.amount;
		}
		if (options.url != null) {
			this.material.setTexture('OVERLAY_MAP', options.url);
		} else {
			this.material.removeTexture('OVERLAY_MAP');
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Overlay.label = 'Overlay';
	Overlay.options = [
		{
			key: 'url',
			name: 'Texture',
			type: 'texture',
			'default': { enabled: true }
		},
		{
			key: 'blendmode',
			name: 'Blend Mode',
			type: 'string',
			control: 'select',
			options: Overlay.blendmodes,
			'default': 'Normal'
		},
		{
			key: 'amount',
			name: 'Amount',
			type: 'float',
			control: 'slider',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		}
	];

	function Levels(id) {
		FullscreenPass.call(this, ObjectUtils.deepClone(ShaderLibExtra.levels));
		this.id = id;
	}
	Levels.prototype = Object.create(FullscreenPass.prototype);
	Levels.prototype.constructor = Levels;

	Levels.prototype.update = function (config) {
		var options = config.options;
		var shader = this.material.shader;
		if (options.gamma !== undefined) {
			shader.uniforms.gamma = options.gamma;
		}
		if (options.gamma !== undefined) {
			shader.uniforms.gamma = options.gamma;
		}
		if (options.minInput !== undefined) {
			shader.uniforms.minInput = options.minInput;
		}
		if (options.maxInput !== undefined) {
			shader.uniforms.maxInput = options.maxInput;
		}
		if (options.minOutput !== undefined) {
			shader.uniforms.minOutput = options.minOutput;
		}
		if (options.maxOutput !== undefined) {
			shader.uniforms.maxOutput = options.maxOutput;
		}
		if (config.enabled !== undefined) {
			this.enabled = config.enabled;
		}
	};

	Levels.label = 'Levels';
	Levels.options = [
		{
			key: 'gamma',
			type: 'float',
			control: 'slider',
			name: 'Gamma',
			min: 0,
			max: 5,
			decimals: 2,
			'default': 1
		},
		{
			key: 'minInput',
			type: 'float',
			control: 'slider',
			name: 'Min Input',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'maxInput',
			type: 'float',
			control: 'slider',
			name: 'Max Input',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		},
		{
			key: 'minOutput',
			type: 'float',
			control: 'slider',
			name: 'Min Output',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 0
		},
		{
			key: 'maxOutput',
			type: 'float',
			control: 'slider',
			name: 'Max Output',
			min: 0,
			max: 1,
			decimals: 2,
			'default': 1
		}
	];

	return {
		Bloom: Bloom,
		Blur: Blur,
		Vignette: Vignette,
		Sepia: Sepia,
		Grain: Grain,
		Noise: Noise,
		RgbShift: RgbShift,
		Bleach: Bleach,
		HSB: HSB,
		Colorify: Colorify,
		Hatch: Hatch,
		Dot: Dot,
		Contrast: Contrast,
		DiffOfGaussians: DiffOfGaussians,
		MotionBlur: MotionBlur,
		Antialias: Antialias,
		Radial: Radial,
		Overlay: Overlay,
		Levels: Levels
	};
})(goo.ShaderLibExtra,goo.FullscreenPass,goo.BloomPass,goo.BlurPass,goo.DogPass,goo.MotionBlurPass,goo.ObjectUtils);
goo.PosteffectsHandler = (function (
	ConfigHandler,
	ArrayUtils,
	RSVP,
	PromiseUtils,
	ObjectUtils,
	Composer,
	RenderPass,
	FullscreenPass,
	ShaderLib,
	PassLib
) {
	'use strict';

	/**
	 * Handler for loading posteffects into engine
	 * @extends ConfigHandler
	 * @param {World} world
	 * @param {Function} getConfig
	 * @param {Function} updateObject
	 * @private
	 */
	function PosteffectsHandler() {
		ConfigHandler.apply(this, arguments);
		this._composer = new Composer();
		var renderSystem = this.world.getSystem('RenderSystem');
		this._renderPass = new RenderPass(renderSystem.renderList);
		this._outPass = new FullscreenPass(ObjectUtils.deepClone(ShaderLib.copy));
		this._outPass.renderToScreen = true;
	}


	PosteffectsHandler.prototype = Object.create(ConfigHandler.prototype);
	PosteffectsHandler.prototype.constructor = PosteffectsHandler;
	ConfigHandler._registerClass('posteffects', PosteffectsHandler);

	/**
	 * Removes the posteffects, i e removes the composer from rendersystem.
	 * @param {ref}
	 */
	PosteffectsHandler.prototype._remove = function (ref) {
		var renderSystem = this.world.getSystem('RenderSystem');
		ArrayUtils.remove(renderSystem.composers, this._composer);

		this._objects.delete(ref);

		if (this.world) {
			this._composer.destroy(this.world.gooRunner.renderer);
		}

		this._composer = new Composer();
	};

	/**
	 * Creates an empty array which will hold the posteffects/RenderPasses
	 * @returns {Entity}
	 * @private
	 */
	PosteffectsHandler.prototype._create = function () {
		return [];
	};

	/**
	 * Creates/updates/removes a posteffectconfig
	 * @param {string} ref
	 * @param {Object} config
	 * @param {Object} options
	 * @returns {RSVP.Promise} Resolves with the updated posteffectsarray or null if removed
	 */
	PosteffectsHandler.prototype._update = function (ref, config, options) {
		var that = this;
		return ConfigHandler.prototype._update.call(this, ref, config, options).then(function (posteffects) {
			if (!posteffects) { return; }

			var oldEffects = posteffects.slice();
			var promises = [];
			ObjectUtils.forEach(config.posteffects, function (effectConfig) {
				promises.push(that._updateEffect(effectConfig, oldEffects, options));
			}, null, 'sortValue');

			return RSVP.all(promises).then(function (effects) {
				for (var i = 0; i < effects.length; i++) {
					posteffects[i] = effects[i];
				}

				posteffects.length = i;
				return posteffects;
			});
		}).then(function (posteffects) {
			if (!posteffects) { return; }

			var enabled = posteffects.some(function (effect) { return effect.enabled; });
			var renderSystem = that.world.getSystem('RenderSystem');
			var composer = that._composer;

			// If there are any enabled, add them
			if (enabled) {
				composer.passes = [];
				composer.addPass(that._renderPass);
				for (var i = 0; i < posteffects.length; i++) {
					var posteffect = posteffects[i];
					if (posteffect && posteffect.enabled) {
						composer.addPass(posteffects[i], that.world.gooRunner.renderer);
					}
				}
				composer.addPass(that._outPass);
				if (renderSystem.composers.indexOf(composer) === -1) {
					renderSystem.composers.push(composer);
				}
			} else {
				// No posteffects, remove composer
				ArrayUtils.remove(renderSystem.composers, that._composer);
			}

			return posteffects;
		});
	};

	/**
	 * Finds the already created effect from the configs id or creates a new one and updates it
	 * according to config
	 * @param {Object} config
	 * @param {Array<RenderPass>} posteffects array of engine posteffects/Renderpasses
	 * @param {Object} options
	 * @returns {RenderPass} effect
	 */
	PosteffectsHandler.prototype._updateEffect = function (originalConfig, posteffects, options) {
		// this gets mutated
		var config = ObjectUtils.deepClone(originalConfig);

		var that = this;
		function loadConfig(key, id) {
			return that._load(id, options).then(function (object) {
				config.options[key] = object;
			});
		}

		// ArrayUtils.find
		var effect;
		for (var i = 0; i < posteffects.length; i++) {
			if (posteffects[i].id === config.id) {
				effect = posteffects[i];
				break;
			}
		}

		if (!effect) {
			if (!PassLib[config.type]) {
				return null;
			}
			effect = new PassLib[config.type](config.id);
		}

		var promises = [];
		for (var i = 0; i < PassLib[config.type].options.length; i++) {
			var option = PassLib[config.type].options[i];
			var key = option.key;
			var type = option.type;

			if (type === 'texture') {
				if (config.options[key] && config.options[key].textureRef && config.options[key].enabled) {
					promises.push(loadConfig(key, config.options[key].textureRef));
				} else {
					config.options[key] = null;
				}
			} else if (type === 'entity') {
				if (config.options[key] && config.options[key].entityRef && config.options[key].enabled) {
					promises.push(loadConfig(key, config.options[key].entityRef));
				} else {
					config.options[key] = null;
				}
			}
		}

		return RSVP.all(promises).then(function () {
			effect.update(config);
			return effect;
		});
	};

	return PosteffectsHandler;
})(goo.ConfigHandler,goo.ArrayUtils,goo.rsvp,goo.PromiseUtils,goo.ObjectUtils,goo.Composer,goo.RenderPass,goo.FullscreenPass,goo.ShaderLib,goo.PassLib);
goo.SsaoPass = (function (
	Material,
	RenderTarget,
	ObjectUtils,
	MeshData,
	Shader,
	ShaderFragment,
	RenderPass,
	FullscreenPass,
	BlurPass,
	ShaderLibExtra,
	Pass
) {
	'use strict';

	/**
	 * Screen Space Ambient Occlusion pass
	 * @param renderList
	 * @hidden
	 */
	function SsaoPass(renderList) {
		this.depthPass = new RenderPass(renderList);
		this.depthPass.clearColor.setDirect(1, 1, 1, 1);
		var packDepthMaterial = new Material(packDepth);
		this.depthPass.overrideMaterial = packDepthMaterial;

		this.downsampleAmount = 4;
		var width = window.innerWidth || 1024;
		var height = window.innerHeight || 1024;
		this.updateSize({
			x: 0, y: 0, width: width, height: height
		});

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	SsaoPass.prototype = Object.create(Pass.prototype);
	SsaoPass.prototype.constructor = SsaoPass;

	SsaoPass.prototype.updateSize = function (size) {
		var width = Math.floor(size.width / this.downsampleAmount);
		var height = Math.floor(size.height / this.downsampleAmount);
		var shader = ObjectUtils.deepClone(ShaderLibExtra.ssao);
		shader.uniforms.size = [width, height];
		this.outPass = new FullscreenPass(shader);
		this.outPass.useReadBuffer = false;
//			 this.outPass.clear = true;
//			this.outPass.renderToScreen = true;

		this.blurPass = new BlurPass({
			sizeX: width,
			sizeY: height
		});
//			this.blurPass.needsSwap = true;

		this.depthTarget = new RenderTarget(width, height, {
			magFilter: 'NearestNeighbor',
			minFilter: 'NearestNeighborNoMipMaps'
		});
		console.log('UPDATE SSAOPASS: ', width, height);
	};

	SsaoPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta) {
		this.depthPass.render(renderer, null, this.depthTarget, delta);

		// this.blurPass.render(renderer, this.depthTarget, this.depthTarget, delta);

		this.outPass.material.setTexture(Shader.DIFFUSE_MAP, readBuffer);
		this.outPass.material.setTexture(Shader.DEPTH_MAP, this.depthTarget);
		this.outPass.render(renderer, writeBuffer, readBuffer, delta);
	};

	var packDepth = {
		attributes: {
			vertexPosition: MeshData.POSITION
		},
		uniforms: {
			viewMatrix: Shader.VIEW_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX
//				nearPlane: Shader.NEAR_PLANE,
//				farPlane: Shader.FAR_PLANE
		},
		vshader: [
			'attribute vec3 vertexPosition;',

			'uniform mat4 viewMatrix;',
			'uniform mat4 projectionMatrix;',
			'uniform mat4 worldMatrix;',

			'void main(void) {',
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);',
			'}'//
		].join('\n'),
		fshader: [
			'precision mediump float;',

//				'uniform float nearPlane;',
//				'uniform float farPlane;',

			ShaderFragment.methods.packDepth,

			'void main(void) {',
			'	gl_FragColor = packDepth(gl_FragCoord.z);',
			'}'//
		].join('\n')
	};

	return SsaoPass;
})(goo.Material,goo.RenderTarget,goo.ObjectUtils,goo.MeshData,goo.Shader,goo.ShaderFragment,goo.RenderPass,goo.FullscreenPass,goo.BlurPass,goo.ShaderLibExtra,goo.Pass);
if (typeof require === "function") {
define("goo/passpack/ShaderLibExtra", [], function () { return goo.ShaderLibExtra; });
define("goo/passpack/BloomPass", [], function () { return goo.BloomPass; });
define("goo/passpack/BlurPass", [], function () { return goo.BlurPass; });
define("goo/passpack/DepthPass", [], function () { return goo.DepthPass; });
define("goo/passpack/DofPass", [], function () { return goo.DofPass; });
define("goo/passpack/DogPass", [], function () { return goo.DogPass; });
define("goo/passpack/MotionBlurPass", [], function () { return goo.MotionBlurPass; });
define("goo/passpack/PassLib", [], function () { return goo.PassLib; });
define("goo/passpack/PosteffectsHandler", [], function () { return goo.PosteffectsHandler; });
define("goo/passpack/SsaoPass", [], function () { return goo.SsaoPass; });
}
