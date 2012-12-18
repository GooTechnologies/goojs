define(['goo/renderer/Shader', 'goo/renderer/TextureCreator', 'goo/renderer/MeshData', 'goo/renderer/shaders/ShaderFragments'],
	function (Shader, TextureCreator, MeshData, ShaderFragments) {
	"use strict";

	/**
	 * @name Material
	 * @class A Material defines the look of an object
	 * @param {String} name Material name
	 * @property {String} name Material name
	 * @property {Shader} shader Shader to use when rendering
	 * @property {Texture[]} textures Array of textures in use
	 */
	function Material(name) {
		this.name = name;

		this.shader = null;
		this.textures = [];
		this.materialState = undefined;
		// {
		// ambient : {r : 0.1, g : 0.1, b : 0.1, a : 1.0},
		// diffuse : {r : 1.0, g : 1.0, b : 1.0, a : 1.0},
		// emissive : {r : 0.1, g : 0.0, b : 0.0, a : 1.0},
		// specular : {r : 0.7, g : 0.7, b : 0.7, a : 1.0},
		// shininess: 16.0
		// };
		this.cullState = {
			enabled : true,
			cullFace : 'Back', // Front, Back, FrontAndBack
			frontFace : 'CCW' // CW, CCW
		};
		this.blendState = {
			blending : 'NoBlending' //, NoBlending, AdditiveBlending, SubtractiveBlending,
		// MultiplyBlending, CustomBlending
		// blendEquation : 'AddEquation', 'SubtractEquation', 'ReverseSubtractEquation'
		// blendSrc : 'ZeroFactor', 'OneFactor', 'SrcColorFactor', 'OneMinusSrcColorFactor',
		// 'SrcAlphaFactor', 'OneMinusSrcAlphaFactor', 'DstAlphaFactor', 'OneMinusDstAlphaFactor'
		// blendDst : 'DstColorFactor', 'OneMinusDstColorFactor', 'SrcAlphaSaturateFactor'
		};
		this.depthState = {
			enabled : true
		};

		this.wireframe = false;
	}

	Material.shaders = {
		copy : {
			includes : [ShaderFragments.features.fog],
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				opacity : 1.0,
				diffuseMap : Shader.TEXTURE0
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec2 vertexUV0;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'varying vec2 texCoord0;',//

				'void main(void) {', //
				'	texCoord0 = vertexUV0;',//
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform sampler2D diffuseMap;',//
				'uniform float opacity;',//

				'varying vec2 texCoord0;',//

				'void main(void)',//
				'{',//
				'	gl_FragColor = vec4(texture2D(diffuseMap, texCoord0).rgb, opacity);',//
				'}'//
			].join('\n')
		},
		simple : {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'void main(void) {', //
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'void main(void)',//
				'{',//
				'	gl_FragColor = vec4(1.0);',//
				'}'//
			].join('\n')
		},
		simpleColored : {
			attributes : {
				vertexPosition : MeshData.POSITION
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				color : [1.0, 1.0, 1.0]
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'void main(void) {', //
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform vec3 color;',//

				'void main(void)',//
				'{',//
				'	gl_FragColor = vec4(color, 1.0);',//
				'}'//
			].join('\n')
		},
		textured : {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				diffuseMap : Shader.TEXTURE0
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec2 vertexUV0;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'varying vec2 texCoord0;',//

				'void main(void) {', //
				'texCoord0 = vertexUV0;',//
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform sampler2D diffuseMap;',//

				'varying vec2 texCoord0;',//

				'void main(void)',//
				'{',//
				'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
				'	gl_FragColor = texCol;',//
				'}'//
			].join('\n')
		},
		texturedLit : {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexNormal : MeshData.NORMAL,
				vertexUV0 : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				cameraPosition : Shader.CAMERA,
				lightPosition : Shader.LIGHT0,
				diffuseMap : Shader.TEXTURE0,
				materialAmbient : Shader.AMBIENT,
				materialDiffuse : Shader.DIFFUSE,
				materialSpecular : Shader.SPECULAR,
				materialSpecularPower : Shader.SPECULAR_POWER
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec3 vertexNormal;', //
				'attribute vec2 vertexUV0;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//
				'uniform vec3 cameraPosition;', //
				'uniform vec3 lightPosition;', //

				'varying vec3 normal;',//
				'varying vec3 lightDir;',//
				'varying vec3 eyeVec;',//
				'varying vec2 texCoord0;',//

				'void main(void) {', //
				'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
				'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //

				'	normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;', //
				'	texCoord0 = vertexUV0;', //
				'	lightDir = lightPosition - worldPos.xyz;', //
				'	eyeVec = cameraPosition - worldPos.xyz;', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform sampler2D diffuseMap;',//

				'uniform vec4 materialAmbient;',//
				'uniform vec4 materialDiffuse;',//
				'uniform vec4 materialSpecular;',//
				'uniform float materialSpecularPower;',//

				'varying vec3 normal;',//
				'varying vec3 lightDir;',//
				'varying vec3 eyeVec;',//
				'varying vec2 texCoord0;',//

				'void main(void)',//
				'{',//
				'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//

				'	vec4 final_color = materialAmbient;',//

				'	vec3 N = normalize(normal);',//
				'	vec3 L = normalize(lightDir);',//

				'	float lambertTerm = dot(N,L)*0.75+0.25;',//

				'	if(lambertTerm > 0.0)',//
				'	{',//
				'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * lambertTerm;',//
				'		vec3 E = normalize(eyeVec);',//
				'		vec3 R = reflect(-L, N);',//
				'		float specular = pow( max(dot(R, E), 0.0), materialSpecularPower);',//
				'		final_color += materialSpecular * // gl_LightSource[0].specular * specular;',//
				'		final_color = clamp(final_color, vec4(0.0), vec4(1.0));',//
				'	}',//
				'	gl_FragColor = vec4(texCol.rgb * final_color.rgb, texCol.a);',//
				'}'//
			].join('\n')
		},
		texturedNormalAOLit : {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexNormal : MeshData.NORMAL,
				vertexTangent : MeshData.TANGENT,
				vertexUV0 : MeshData.TEXCOORD0,
				vertexUV1 : MeshData.TEXCOORD1,
				vertexUV2 : MeshData.TEXCOORD2
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				cameraPosition : Shader.CAMERA,
				lightPosition : Shader.LIGHT0,
				diffuseMap : Shader.TEXTURE0,
				normalMap : Shader.TEXTURE1,
				aoMap : Shader.TEXTURE2,
				materialAmbient : Shader.AMBIENT,
				materialDiffuse : Shader.DIFFUSE,
				materialSpecular : Shader.SPECULAR,
				materialSpecularPower : Shader.SPECULAR_POWER
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec3 vertexNormal;', //
				'attribute vec4 vertexTangent;', //
				'attribute vec2 vertexUV0;', //
				'attribute vec2 vertexUV1;', //
				'attribute vec2 vertexUV2;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//
				'uniform vec3 cameraPosition;', //
				'uniform vec3 lightPosition;', //

				'varying vec3 normal;',//
				'varying vec3 binormal;',//
				'varying vec3 tangent;',//
				'varying vec3 lightDir;',//
				'varying vec3 eyeVec;',//
				'varying vec2 texCoord0;',//
				'varying vec2 texCoord1;',//
				'varying vec2 texCoord2;',//

				'void main(void) {', //
				'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
				'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //

				'	normal = normalize((worldMatrix * vec4(vertexNormal, 0.0)).xyz);', //
				'	tangent = normalize((worldMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);', //
				'	binormal = cross(normal, tangent)*vec3(vertexTangent.w);', //

				'	texCoord0 = vertexUV0;', //
				'	texCoord1 = vertexUV1;', //
				'	texCoord2 = vertexUV2;', //

				'	lightDir = lightPosition - worldPos.xyz;', //
				'	eyeVec = cameraPosition - worldPos.xyz;', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform sampler2D diffuseMap;',//
				'uniform sampler2D normalMap;',//
				'uniform sampler2D aoMap;',//

				'uniform vec4 materialAmbient;',//
				'uniform vec4 materialDiffuse;',//
				'uniform vec4 materialSpecular;',//
				'uniform float materialSpecularPower;',//

				'varying vec3 normal;',//
				'varying vec3 binormal;',//
				'varying vec3 tangent;',//
				'varying vec3 lightDir;',//
				'varying vec3 eyeVec;',//
				'varying vec2 texCoord0;',//
				'varying vec2 texCoord1;',//
				'varying vec2 texCoord2;',//

				'void main(void)',//
				'{',//
				'	mat3 tangentToWorld = mat3(tangent,',//
				'								binormal,',//
				'								normal);',//

				'	vec4 texCol = texture2D(diffuseMap, texCoord1);',//
				'	vec4 final_color = materialAmbient;',//

				'	vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz - vec3(0.5, 0.5, 0.5);',//
				'	vec3 worldNormal = (tangentToWorld * tangentNormal);',//
				'	vec3 N = normalize(worldNormal);',//

				'	vec4 aoCol = texture2D(aoMap, texCoord2);',//

				'	vec3 L = normalize(lightDir);',//

				'	float lambertTerm = dot(N,L)*0.75+0.25;',//

				'	if(lambertTerm > 0.0)',//
				'	{',//
				'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * lambertTerm;',//
				'		vec3 E = normalize(eyeVec);',//
				'		vec3 R = reflect(-L, N);',//
				'		float specular = pow( max(dot(R, E), 0.0),',//
				'						materialSpecularPower);',//
				'		final_color += materialSpecular * // gl_LightSource[0].specular * specular;',//
				'	}',//
				' gl_FragColor = vec4(texCol.rgb * aoCol.rgb * final_color.rgb, texCol.a);',//
				// ' gl_FragColor = vec4(texCol.rgb, texCol.a);',//
				'}'//
			].join('\n')
		},
		convolution : {
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
				tDiffuse : 0,
				uImageIncrement : [0.001953125, 0.0],
				cKernel : []
			},
			vshader : [//
				'attribute vec3 position;', //
				'attribute vec2 uv;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'uniform vec2 uImageIncrement;',//

				'varying vec2 vUv;',//

				'void main() {',//
				'	vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;',//
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',//
				'}'//
			].join("\n"),
			fshader : [//
				'precision mediump float;',//

				'uniform float cKernel[ KERNEL_SIZE_INT ];',//
				'uniform sampler2D tDiffuse;',//
				'uniform vec2 uImageIncrement;',//

				'varying vec2 vUv;',//

				'void main() {',//
				'	vec2 imageCoord = vUv;',//
				'	vec4 sum = vec4( 0.0 );',//

				'	for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {',//
				'		sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];',//
				'		imageCoord += uImageIncrement;',//
				'	}',//

				'	gl_FragColor = sum;',//
				'}'//
			].join("\n"),
			buildKernel : function (sigma) {
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
		},
		showDepth : {
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
			vshader : [ //
				'attribute vec3 vertexPosition;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'void main(void) {', //
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
				'}'//
			].join('\n'),
			fshader : [//
				'precision mediump float;',//

				'uniform float near;',//
				'uniform float far;',//

				'void main(void)',//
				'{',//
				'	float depth = gl_FragCoord.z / gl_FragCoord.w;',//
				'	float d = 1.0 - smoothstep( near, far, depth );',//
				'	gl_FragColor = vec4(d);',//
				'}'//
			].join('\n')
		},
		showNormals : {
			attributes : {
				vertexPosition : MeshData.POSITION,
				vertexNormal : MeshData.NORMAL
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				opacity : 1.0
			},
			vshader : [ //
				'attribute vec3 vertexPosition;', //
				'attribute vec3 vertexNormal;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//

				'varying vec3 vNormal;', //

				'void main() {', //
				'vec4 mvPosition = viewMatrix * worldMatrix * vec4( vertexPosition, 1.0 );', //
				'vNormal = vec3(viewMatrix * worldMatrix * vec4(vertexNormal, 0.0)); //normalMatrix * vertexNormal;', //
				'gl_Position = projectionMatrix * mvPosition;', //
				'}' //
			].join("\n"),
			fshader : [ //
				'precision mediump float;',//

				'uniform float opacity;', //
				'varying vec3 vNormal;', //

				'void main() {', //
				'gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );', //
				'}' //
			].join("\n")
		},
		bokehShader : {
			attributes : {
				position : MeshData.POSITION,
				uv : MeshData.TEXCOORD0
			},
			uniforms : {
				viewMatrix : Shader.VIEW_MATRIX,
				projectionMatrix : Shader.PROJECTION_MATRIX,
				worldMatrix : Shader.WORLD_MATRIX,
				tColor : 0,
				tDepth : 1,
				focus : 1.0,
				aspect : 1.0,
				aperture : 0.025,
				maxblur : 1.0
			},
			vshader : [//
				'attribute vec3 position;', //
				'attribute vec2 uv;', //

				'uniform mat4 viewMatrix;', //
				'uniform mat4 projectionMatrix;',//
				'uniform mat4 worldMatrix;',//
				'varying vec2 vUv;',//

				'void main() {',//
				'	vUv = uv;',//
				'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4( position, 1.0 );',//
				'}'//
			].join("\n"),
			fshader : [//
				'precision mediump float;',//

				'varying vec2 vUv;',//

				'uniform sampler2D tColor;',//
				'uniform sampler2D tDepth;',//
				'uniform float maxblur;', // max blur amount
				'uniform float aperture;', // aperture - bigger values for shallower depth of field
				'uniform float focus;',//
				'uniform float aspect;',//

				'void main() {',//
				'vec2 aspectcorrect = vec2( 1.0, aspect );',//
				'vec4 depth1 = texture2D( tDepth, vUv );',//
				'float factor = depth1.x - focus;',//
				'vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );',//
				'vec2 dofblur9 = dofblur * 0.9;',//
				'vec2 dofblur7 = dofblur * 0.7;',//
				'vec2 dofblur4 = dofblur * 0.4;',//

				'vec4 col = vec4( 0.0 );',//

				'col += texture2D( tColor, vUv.xy );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );',//

				'col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );',//

				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );',//

				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );',//
				'col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );',//

				'gl_FragColor = col / 41.0;',//
				'gl_FragColor.a = 1.0;',//
				'}'//
			].join("\n")
		}
	};

	Material.createShader = function (shaderDefinition, name) {
		return new Shader(name || 'DefaultShader', shaderDefinition);
	};

	Material.createMaterial = function (shaderDefinition, name) {
		var material = new Material(name || 'DefaultMaterial');

		material.shader = Material.createShader(shaderDefinition);

		return material;
	};

	return Material;
});