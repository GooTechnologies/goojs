define([
	'goo/renderer/Material',
	'goo/math/Vector4',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Texture',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/noise/Noise',
	'goo/noise/ValueNoise',
],
/** @lends */
function (
	Material,
	Vector4,
	MeshData,
	Shader,
	Texture,
	ShaderBuilder,
	Noise,
	ValueNoise
	) {
	"use strict";

	/**
	 *
	 * @class A pass that renders provided renderlist to the rendertarget or screen
	 * Original paper : http://web.media.mit.edu/~bandy/fur/ by Paulo Silva, Yosuke Bando, Bing-Yu Chen and Tomoyuki Nishita
	 */
	function FurPass(renderList, layerCount, diffuseTexture) {
		this.renderList = renderList;

		this.renderToScreen = true;

		this.overrideMaterial = null;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;

		this.opacityTextures = this.generateOpacityTextures(layerCount);

		this.furMaterial = Material.createEmptyMaterial(furShader, "FurMaterial");
		// this.furMaterial.depthState.write = false;
		this.furMaterial.cullState.enabled = false;
		this.furUniforms = this.furMaterial.shader.uniforms;

		if (diffuseTexture === undefined) {
			this.generateDiffuseTexture();
		}
	}

	FurPass.OPACITY_MAP = 'OPACITY_MAP'

	FurPass.prototype.regenerateLayers = function(layerCount) {
		this.opacityTextures = this.generateOpacityTextures(layerCount);		
	}

	FurPass.prototype.generateDiffuseTexture = function(width, height) {
		if (width === undefined || height === undefined) {
			width = height = 256 * 1;
		}

		var textureSettings = {
			format: "RGB"
		};

		var channels = 3;
		var dataLength = width * height * channels;

		// Create an array to hold the image data representaiton.
		var noiseData = new Uint8Array(dataLength);

		var i = 0;
		var scale = 10;
		var octaves = 2;
		var persistance = 0.5; // Amplitude persistance between octaves.
		var lacunarity = 2; // Frequency scale between octaves.
		for (var x=0; x < width; x++) {
			for (var y=0; y < height; y++) {
				var n1 = Noise.fractal2d(x, y, scale, octaves, persistance, lacunarity, ValueNoise)
				var n2 = Noise.fractal2d(x, y, scale * 2, octaves, persistance, lacunarity, ValueNoise)
				var n3 = Noise.fractal2d(x, y, scale * 0.1, octaves, persistance, lacunarity, ValueNoise)
				noiseData[i] = Math.round(n1 * 255);
				i++;
				noiseData[i] = Math.round(0.1 * n2 * 255);
				i++;
				noiseData[i] = Math.round(0.6 * n3 * 255);
				i++;
			}
		}

		var texture = new Texture(noiseData, textureSettings, width, height);
		this.furMaterial.setTexture('DIFFUSE_MAP', texture);

	}

	/**
	* Returns an array of generated opacity textures.
	*/
	FurPass.prototype.generateOpacityTextures = function(numberOfLayers, width, height) {

		if (width === undefined || height === undefined) {
			width = height = 256 * 1;
		}

		var textureSettings = {
			format: "Alpha",
			generateMipmaps: false,
			minFilter: 'NearestNeighborNoMipMaps',
			magFilter: 'NearestNeighbor',
		};

		var channels = 1;
		var dataLength = width * height * channels;

		// Create an array to hold the image data representaiton.
		var noiseData = new Uint8Array(dataLength);

		var i = 0;
		var scale = 1;
		var octaves = 2;
		var persistance = 0.5;
		var lacunarity = 2;
		for (var x=0; x < width; x++) {
			for (var y=0; y < height; y++) {
				var n = Noise.fractal2d(x, y, scale, octaves, persistance, lacunarity, ValueNoise)
				noiseData[i] = Math.round(n * 255);
				i++;
			}
		}

		// Treshold the noise 
		// TODO : Save the output as binary data if possible. Texture seeems to only be able to use uint8
		var textures = new Array(numberOfLayers);
		var threshold = 0.7;
		var maxThreshold = 0.99;
		var thresholdIncrement = (maxThreshold - threshold) / numberOfLayers;
		for (var layerIndex = 0; layerIndex < numberOfLayers; layerIndex++) {
			var currentThresh = Math.round(threshold * 255);
			var layerData = this.thresholdData(noiseData, currentThresh);
			threshold += thresholdIncrement;
			textures[layerIndex] = new Texture(layerData, textureSettings, width, height);
		}

		return textures;
	};

	/**
	 * Threshholds the data and returns a new array with the thresholded data.
	 * @param sourceData
	 * @param thresholdValue
	 */
	FurPass.prototype.thresholdData = function (sourceData, thresholdValue) {

		var data = new Uint8Array(sourceData.length);

		for (var i = 0; i < data.length; i++) {
			if (sourceData[i] < thresholdValue) {
				data[i] = 0;
			} else {
				data[i] = 255;
			}
		}

		return data;
	};


	// RenderPasses may have a fourth additional parameter called delta
	FurPass.prototype.render = function (renderer, writeBuffer, readBuffer, delta, maskActive, camera, lights) {
		var layers = this.opacityTextures.length;
		for (var i = 0; i < this.renderList.length; i++) {
			for (var layerIndex = 0; layerIndex < layers; layerIndex++) {
				// update opacity texture and uniforms per layer here.
				this.furUniforms.normalizedLength = (layerIndex + 1) / layers;
				this.furMaterial.setTexture(FurPass.OPACITY_MAP, this.opacityTextures[layerIndex]);
				renderer.render(this.renderList[i], camera, lights, null, this.clear, this.furMaterial);
			}
		}
	};

	var furShader = {
		processors: [
			ShaderBuilder.light.processor
		],
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexNormal: MeshData.NORMAL,
			vertexTangent: MeshData.TANGENT,
			vertexUV0: MeshData.TEXCOORD0
		},
		uniforms: {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			normalMatrix: Shader.NORMAL_MATRIX,
			cameraPosition : Shader.CAMERA,
			normalizedLength : 0.0,
			hairLength : 2,
			colorTexture: Shader.DIFFUSE_MAP,
			opacityTexture: FurPass.OPACITY_MAP,
			curlFrequency: 0.0,
			curlRadius: 0.2,
			furRepeat: 5,
			displacement: [0, 0, 0],
			vertDistancePos: [0, 0, 0],
			vertDisplacement: 1.0,
			vertDisplacementRadius: 10.0,
			// Color settings
			specularBlend: 0.5,
			specularPower: 25,
			shadow: 1.0,
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexNormal;',
			'attribute vec4 vertexTangent;',
			'attribute vec2 vertexUV0;',

			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform mat3 normalMatrix;',
			'uniform vec3 cameraPosition;',
			'uniform float normalizedLength;',
			'uniform float hairLength;',
			'uniform float curlFrequency;',
			'uniform float curlRadius;',
			'uniform float furRepeat;',
			'uniform vec3 displacement;',
			'uniform vec3 vertDistancePos;',
			'uniform float vertDisplacement;',
			'uniform float vertDisplacementRadius;',


			'varying vec2 texCoord0;',
			'varying vec2 furTexCoord;',
			'varying vec3 T;',
			'varying vec3 viewPosition;',

			'void main(void) {',

			'vec3 pos;',
			'vec3 normal = normalize(normalMatrix * vertexNormal);',
			'vec3 p_root = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',
			'vec3 p_0 = p_root + (normal * hairLength);',
			'float L_0 = length(p_0 - p_root);',

			// Displacement 
			'vec3 displacementDirection = p_0 - vertDistancePos;',
			'float vertDisplaceAmount = smoothstep(0.0, 1.0, vertDisplacementRadius - length(displacementDirection));',
			'vec3 vDisplacement = vertDisplaceAmount * vertDisplacement * normalize(displacementDirection);',
			'vec3 p = displacement + vDisplacement + p_0;',

			// Curliness Control
			// Displace the pos in a circle in the surface plane to create curls!
			'vec3 tangent = normalize(normalMatrix * vertexTangent.xyz);',
			'vec3 binormal = cross(normal, tangent) * vec3(vertexTangent.w);',
			'float wh = curlFrequency * normalizedLength;',
			
			// CONSTRAINTS
			// 2 constraints for the instant position p, to constrain p in a hemisphere abouve the surface
			// c1: |p-p_root| <= L_0
			// c2: dot((p-p_root),normal) >= 0
			'vec3 constraint = p - p_root;',
			'float c1 = length(constraint);',
			'if (c1 > L_0) {',
			'	p = p_root + ( L_0 * normalize(constraint));',
			'}',

			'float c2 = dot((p-p_0),normal);',
			'if (c2 < 0.0) {',
				//If p is below the surface, add the depth in the normal's direction

				// Depth is calculated as the projection of the vector from the root
				// to the point p projected at the negative normal
			'	p = p + normal * -c2;',
			'}',

			'if (normalizedLength < 1.0) {',
				//Qudratic bezier approximation of the curvture of the hair
				//pos = (1-h)^2 * proot + 2h(1-h)p0 + h^2 *p
				//pos = a*a*proot + 2*h*a*p0 + h*h*p
			'	float norm2 = 2.0 * normalizedLength;',
			'	float a = 1.0 - normalizedLength;',
			'	pos = (a * a * p_root) + (norm2 * a * p_0) + (normalizedLength * normalizedLength * p);',
				//Derivative of bezier curve == hair tangent
				//The tangent is used for lighting computations in the fragment shader
			'	pos += curlRadius * normalizedLength * (cos(wh) * tangent + sin(wh) * binormal);',
			'	T = (2.0 * a * (p_0 - p_root) + norm2 * (pos - p_0));',
			'}',
			'else {',
			'	pos = p;',
			'	pos += curlRadius * normalizedLength * (cos(wh) * tangent + sin(wh) * binormal);',
			'	T = 2.0 * (pos - p_0);',
			'}',


			// Set varying variables
			'texCoord0 = vertexUV0;',
			'furTexCoord = vertexUV0 * furRepeat;',
			'viewPosition = cameraPosition - pos;',
			'gl_Position = viewProjectionMatrix * vec4(pos, 1.0);',

			'}'//
		].join("\n"),
		fshader: [

			'uniform float normalizedLength;',
			'uniform float furRepeat;',
			'uniform float gravity;',
			'uniform float shadow;',
			'uniform float specularPower;',
			'uniform float specularBlend;',

			'uniform sampler2D colorTexture;',
			'uniform sampler2D opacityTexture;',

			'varying vec2 furTexCoord;',
			'varying vec2 texCoord0;',
			'varying vec3 T;',
			'varying vec3 viewPosition;',

			'void main(void)',
			'{',
			'vec4 opacity = texture2D(opacityTexture, furTexCoord);',
			'if (opacity.a <= 0.0) discard;',
			/*
			Kajiya and Kay , 1989 , Illumination model
			https://www.cs.drexel.edu/~david/Classes/CS586/Papers/p271-kajiya.pdf

			http://http.developer.nvidia.com/GPUGems/gpugems_ch33.html
			http://vilsen.se/Evaluation_of_Hair_Modeling_Simulation_and_Rendering_Algorithms_for_a_VFX_Hair_Modeling_System.pdf
			http://publications.dice.se/attachments/RealTimeHairSimAndVis.pdf
			http://web.media.mit.edu/~bandy/fur/CGI10fur.pdf
			*/
			'vec4 texCol = texture2D(colorTexture, texCoord0);',
			'vec3 diffuse = texCol.rgb;',

			"vec3 specularColor = vec3(1, 1, 1);",

			'vec3 tangent = normalize(T);',
			'vec3 lightDir = normalize(vec3(1, 1, 0));',
			'vec3 eye = normalize(viewPosition);',

			// Specular
			'float TcrossL = length(cross(tangent, lightDir));',
			'float TcrossE = length(cross(tangent, eye));',
			'float dotFactor = dot(tangent, lightDir) * dot(tangent, eye);',
			'float crossFactor = TcrossL * TcrossE;',
			'float specularAmount = max(pow(dotFactor + crossFactor, specularPower), 0.0);',

			//TODO: Revise mixing of diffuse and specular.
			//'vec3 color = mix((diffuse * TcrossL), specularColor, specularAmount);',
			'vec3 color = (diffuse * TcrossL) + specularBlend * (specularColor * specularAmount);',

			// "Simple shadow effect"
			'float shadowFactor = (shadow - 1.0 + normalizedLength)/shadow;',
			'color *= shadowFactor;',

			'gl_FragColor = vec4(color, 1.0);',
			
			'}'//
		].join("\n")
	};

	return FurPass;
});