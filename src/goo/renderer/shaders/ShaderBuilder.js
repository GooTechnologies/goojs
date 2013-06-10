define([
		'goo/renderer/shaders/ShaderFragment',
		'goo/renderer/MeshData'
		// 'goo/renderer/Shader'
],
/** @lends */
function(
	ShaderFragment,
	MeshData
	// Shader
) {
	"use strict";

	/**
	 * @class Builds shaders
	 */
	function ShaderBuilder() {
		this.shader = {
			defines: [],
			attributes: {
				vertexPosition: MeshData.POSITION
			},
			uniforms: {},
			vshader: '',
			fshader: ''
		};
		this.vertex = {
			variables: [],
			code: []
		};
		this.fragment = {
			variables: [],
			code: []
		};
	}

	// ShaderBuilder.prototype.addFragment = function () {};

	// ShaderBuilder.prototype.build = function () {

	// 	var vertexShader = this.vertex.variables.join('\n') + this.vertex.code.join('\n');
	// 	var fragmentShader = this.fragment.variables.join('\n') + this.fragment.code.join('\n');
	// };

	// var lights = {

	// };

	// var diffuse = {
	// 	attributes: {
	// 		vertexUV0: MeshData.TEXCOORD0
	// 	},
	// 	uniforms: {
	// 		diffuseMap: Shader.TEXTURE0
	// 	},
	// 	varying: {
	// 		texCoord0: Shader.VEC2
	// 	},
	// 	vshader: {
	// 		// preCode: [
	// 			// 'float someFunction(vec2 blaha) {',
	// 			// '}'
	// 		// ].join('\n'),
	// 		code: [
	// 			'texCoord0 = vertexUV0;',
	// 			'gl_Position = vec4(vertexPosition, 1.0);'
	// 		]
	// 	},
	// 	fshader : {
	// 		code: [
	// 			'gl_FragColor = texture2D(diffuseMap, texCoord0);'
	// 		]
	// 	}
	// };

	return ShaderBuilder;
});