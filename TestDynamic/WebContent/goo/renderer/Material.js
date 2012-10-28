define(['goo/renderer/Shader', 'goo/renderer/TextureCreator'], function(Shader, TextureCreator) {
	"use strict";

	/**
	 * Creates a new Material
	 * 
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
	}

	Material.shaders = {
		simple : {
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

			'void main(void) {', //
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'void main(void)',//
			'{',//
			'	gl_FragColor = vec4(1.0);',//
			'}',//
			].join('\n')
		},
		textured : {
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//

			'varying vec2 texCoord0;',//

			'void main(void) {', //
			'texCoord0 = vertexUV0;',//
			'	gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap; //!TEXTURE0',//

			'varying vec2 texCoord0;',//

			'void main(void)',//
			'{',//
			'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
			'	gl_FragColor = texCol;',//
			'}',//
			].join('\n')
		},
		texturedLit : {
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec3 vertexNormal; //!NORMAL', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//
			'uniform vec3 cameraPosition; //!CAMERA', //
			'uniform vec3 lightPosition; //!LIGHT0', //

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

			'uniform sampler2D diffuseMap; //!TEXTURE0',//

			'uniform vec4 materialAmbient; //!AMBIENT',//
			'uniform vec4 materialDiffuse; //!DIFFUSE',//
			'uniform vec4 materialSpecular; //!SPECULAR',//
			'uniform float materialSpecularPower; //!SPECULAR_POWER',//

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

			'	float lambertTerm = dot(N,L);',//

			'	if(lambertTerm > 0.0)',//
			'	{',//
			'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * ',//
			'					   lambertTerm;	',//
			'		vec3 E = normalize(eyeVec);',//
			'		vec3 R = reflect(-L, N);',//
			'		float specular = pow( max(dot(R, E), 0.0),',// 
			'						materialSpecularPower);',//
			'		final_color += materialSpecular * // gl_LightSource[0].specular * ',//
			'					   specular;	',//
			'	}',//
			'	gl_FragColor = vec4(texCol.rgb * final_color.rgb, texCol.a);',//
			'}',//
			].join('\n')
		},
		texturedNormalAOLit : {
			vshader : [ //
			'attribute vec3 vertexPosition; //!POSITION', //
			'attribute vec3 vertexNormal; //!NORMAL', //
			'attribute vec4 vertexTangent; //!TANGENT', //
			'attribute vec2 vertexUV0; //!TEXCOORD0', //
			'attribute vec2 vertexUV1; //!TEXCOORD1', //

			'uniform mat4 viewMatrix; //!VIEW_MATRIX', //
			'uniform mat4 projectionMatrix; //!PROJECTION_MATRIX',//
			'uniform mat4 worldMatrix; //!WORLD_MATRIX',//
			'uniform vec3 cameraPosition; //!CAMERA', //
			'uniform vec3 lightPosition; //!LIGHT0', //

			'varying vec3 normal;',//
			'varying vec3 binormal;',//
			'varying vec3 tangent;',//
			'varying vec3 lightDir;',//
			'varying vec3 eyeVec;',//
			'varying vec2 texCoord0;',//
			'varying vec2 texCoord1;',//

			'void main(void) {', //
			'	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);', //
			'	gl_Position = projectionMatrix * viewMatrix * worldPos;', //

			'	normal = normalize((worldMatrix * vec4(vertexNormal, 0.0)).xyz);', //
			'	tangent = normalize((worldMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);', //
			'	binormal = cross(normal, tangent)*vec3(vertexTangent.w);', //

			'	texCoord0 = vertexUV0;', //
			'	texCoord1 = vertexUV1;', //

			'	lightDir = lightPosition - worldPos.xyz;', //
			'	eyeVec = cameraPosition - worldPos.xyz;', //
			'}'//
			].join('\n'),
			fshader : [//
			'precision mediump float;',//

			'uniform sampler2D diffuseMap; //!TEXTURE0',//
			'uniform sampler2D normalMap; //!TEXTURE1',//
			'uniform sampler2D aoMap; //!TEXTURE2',//

			'uniform vec4 materialAmbient; //!AMBIENT',//
			'uniform vec4 materialDiffuse; //!DIFFUSE',//
			'uniform vec4 materialSpecular; //!SPECULAR',//
			'uniform float materialSpecularPower; //!SPECULAR_POWER',//

			'varying vec3 normal;',//
			'varying vec3 binormal;',//
			'varying vec3 tangent;',//
			'varying vec3 lightDir;',//
			'varying vec3 eyeVec;',//
			'varying vec2 texCoord0;',//
			'varying vec2 texCoord1;',//

			'void main(void)',//
			'{',//
			'	mat3 tangentToWorld = mat3(tangent,',//
			'								binormal,',//
			'								normal);',//

			'	vec4 texCol = texture2D(diffuseMap, texCoord0);',//
			'	vec4 final_color = materialAmbient;',//

			'	vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz - vec3(0.5, 0.5, 0.5);',//
			'	vec3 worldNormal = (tangentToWorld * tangentNormal);',//
			'	vec3 N = normalize(worldNormal);',//

			'	vec4 aoCol = texture2D(aoMap, vec2(1.0-texCoord0.x, 1.0-texCoord1.y));',//

			'	vec3 L = normalize(lightDir);',//

			'	float lambertTerm = dot(N,L);',//

			'	if(lambertTerm > 0.0)',//
			'	{',//
			'		final_color += materialDiffuse * // gl_LightSource[0].diffuse * ',//
			'					   lambertTerm;	',//
			'		vec3 E = normalize(eyeVec);',//
			'		vec3 R = reflect(-L, N);',//
			'		float specular = pow( max(dot(R, E), 0.0),',// 
			'						materialSpecularPower);',//
			'		final_color += materialSpecular * // gl_LightSource[0].specular * ',//
			'					   specular;	',//
			'	}',//
			// ' gl_FragColor = vec4(texCol.rgb * aoCol.rgb * final_color.rgb, texCol.a);',//
			'	gl_FragColor = vec4(texCol.rgb * final_color.rgb, texCol.a);',//
			'}',//
			].join('\n')
		}
	};

	Material.createDefaultMaterial = function(shader) {
		var material = new Material('DefaultMaterial');

		var vs = shader.vshader;
		var fs = shader.fshader;
		material.shader = new Shader('DefaultShader', vs, fs);

		// var texture = new TextureCreator().loadTexture2D('resources/pitcher.jpg');
		// material.textures.push(texture);

		return material;
	};

	return Material;
});