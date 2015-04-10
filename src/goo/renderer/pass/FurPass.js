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
	function FurPass(renderList, layerCount) {
		this.renderList = renderList;

		this.renderToScreen = true;

		this.overrideMaterial = null;

		this.enabled = true;
		this.clear = false;
		this.needsSwap = false;

		// TODO : This stuff shall be fetched from the FurComponent, when it is implemented.
		this.opacityTextures = this.generateOpacityTextures(layerCount);

		this.furMaterial = Material.createEmptyMaterial(furShader, "FurMaterial");
		// TODO: How to best do the binding of texture?
		//this.furMaterial.setTexture('SPECULAR_MAP', this.opacityTextures[0]);
		// TODO: The blending method is maybe not correct... lets see.
		// 'AdditiveBlending', 'SubtractiveBlending', 'MultiplyBlending', 'CustomBlending'
		//this.furMaterial.blendState.blending = "AdditiveBlending";
		
		// this.furMaterial.depthState.write = false;
		this.furMaterial.cullState.enabled = false;

		this.furUniforms = this.furMaterial.shader.uniforms;
	}

	FurPass.OPACITY_MAP = 'OPACITY_MAP'

	FurPass.prototype.regenerateLayers = function(layerCount) {
		this.opacityTextures = this.generateOpacityTextures(layerCount);		
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
			time: Shader.TIME,
			curlFrequency: 0.0,
			curlRadius: 0.2,
			furRepeat: 5,
			gravity: 9.81,
			sinusAmount: 1,
			shadow: 1.2,
			// Color settings
			specularPower: 120,
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
			'uniform float time;',
			'uniform float curlFrequency;',
			'uniform float curlRadius;',
			'uniform float furRepeat;',
			'uniform float gravity;',
			'uniform float sinusAmount;',

			'varying vec2 texCoord0;',
			'varying vec2 furTexCoord;',
			'varying vec3 T;',
			'varying vec3 viewPosition;',
			'varying vec3 L;',
			'varying float TxL;',
			'varying float TxE;',

			'void main(void) {',

			// Pos will hold the final position
			'	vec3 pos;',
			
			'	vec3 normal = normalize(normalMatrix * vertexNormal);',
			'	vec3 p_root = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;',
			'	vec3 p_0 = p_root + (normal * hairLength);',
			'	float L_0 = length(p_0 - p_root);',
			// Gravity

			/*
	vec3 gravity = vec3(0,-1,0) * 9.81*mass;
	vec3 test = 14* sin(time*2.0) * mass * vec3(1,0,0);

	//k in Newtonmeters
	float k = length(gravity)/(L_0*0.5);

	lightDir = vec3(p_0 - gl_LightSource[0].position);
	float windDistance = length(lightDir);
	lightDir = normalize(lightDir);

	vec3 wind = (10 + windStrength)*mass*lightDir;


	//Hooke's law F = -kx <-> x = -F/k
	vec3 p = (gravity + wind)/k + p_0;
	*/
			// TODO: Refactor to use external displacement vec3 instead

			'	float mass =  0.00001;',
			
			'	vec3 sinusNoise = 20.0 * sin(time*4.0) * mass * vec3(1,0,0);',
			'	sinusNoise *= sinusAmount;',

			'	vec3 gravityForce = vec3(0,-1,0) * gravity * mass;',

			'	float k = length(gravityForce)/(L_0 * 0.5);',
			'	vec3 p = ((gravityForce + sinusNoise)/k) + p_0;',

			// CONSTRAINTS
			// 2 constraints for the instant position p, to constrain p in a hemisphere abouve the surface
			// c1: |p-p_root| <= L_0
			// c2: dot((p-p_root),normal) >= 0
			'	vec3 constraint = p - p_root;',
			'	float c1 = length(constraint);',
			'	if (c1 > L_0) {',
			'		p = p_root + ( L_0 * normalize(constraint));',
			'	}',

			'	float c2 = dot((p-p_0),normal);',
			'	if (c2 < 0.0) {',
				//If p is below the surface, add the depth in the normal's direction

				// Depth is calculated as the projection of the vector from the root
				// to the point p projected at the negative normal
			'	p = p + normal * -c2;',
			'	}',

			'	if (normalizedLength < 1.0) {',
			//Qudratic bezier approximation of the curvture of the hair
			//pos = (1-h)^2 * proot + 2h(1-h)p0 + h^2 *p
			//pos = a*a*proot + 2*h*a*p0 + h*h*p
			'		float a = (1.0-normalizedLength);',
			'		pos = (a*a*p_root) + (2.0*normalizedLength*a*p_0) + (normalizedLength*normalizedLength*p);',
			//Derivative of bezier curve == hair tangent
			//The tangent is used for lighting computations in the fragment shader
			'		T = (2.0*a*(p_0 - p_root) + 2.0*normalizedLength*(p-p_0));',
			'}',
			'else {',
			'		pos = p;',
			'		T = 2.0*(p - p_0);',
			'}',

			// Curliness Control
			// Displace the pos in a circle in the surface plane to create curls!
			'vec3 tangent = normalize(normalMatrix * vertexTangent.xyz);',
			'vec3 binormal = cross(normal, tangent) * vec3(vertexTangent.w);',

			'float wh = curlFrequency * normalizedLength;',
			'pos += curlRadius * normalizedLength * (cos(wh) * tangent + sin(wh) * binormal);',

			// Set varying variables
			'texCoord0 = vertexUV0;',
			'furTexCoord = vertexUV0 * furRepeat;',
			'viewPosition = cameraPosition - pos;',
			'T = normalize(T);',
			'L = vec3(0, 1, 0);',
			'TxL = length(cross(T, L));',
			'TxE = length(cross(T, normalize(viewPosition)));',
			'gl_Position = viewProjectionMatrix * vec4(pos, 1.0);',

			'}'//
		].join("\n"),
		fshader: [

			//ShaderBuilder.light.prefragment,

			'uniform float normalizedLength;',
			'uniform float furRepeat;',
			'uniform float gravity;',
			'uniform float shadow;',
			'uniform float lightCutoff;',
			'uniform float specularPower;',


			'uniform sampler2D colorTexture;',
			'uniform sampler2D opacityTexture;',

			'varying vec2 furTexCoord;',
			'varying vec2 texCoord0;',
			'varying vec3 T;',
			'varying vec3 viewPosition;',
			'varying vec3 L;',
			'varying float TxL;',
			'varying float TxE;',

			'void main(void)',
			'{',
			'	vec4 opacity = texture2D(opacityTexture, furTexCoord);',
			'	if (opacity.a <= 0.0) discard;',
			/*
			Kajiya and Kay , 1989 , Illumination model
			https://www.cs.drexel.edu/~david/Classes/CS586/Papers/p271-kajiya.pdf

			http://http.developer.nvidia.com/GPUGems/gpugems_ch33.html
			http://vilsen.se/Evaluation_of_Hair_Modeling_Simulation_and_Rendering_Algorithms_for_a_VFX_Hair_Modeling_System.pdf
			http://publications.dice.se/attachments/RealTimeHairSimAndVis.pdf
			http://web.media.mit.edu/~bandy/fur/CGI10fur.pdf
			*/
			//'	vec4 texCol = texture2D(colorTexture, texCoord0);',
			'	vec4 texCol = vec4(1, 0, 0, 1.0);',
			'	vec3 diffuse = texCol.rgb;',

			"vec3 specularColor = vec3(0,0,1.0);",
			"vec3 materialAmbient = vec3(0.1,0,0);",

			'vec3 tangent = normalize(T);',
			'vec3 lightDir = normalize(L);',
			'vec3 eye = normalize(viewPosition);',
			'float specularAmount = pow(((dot(tangent, lightDir) * dot(tangent, eye)) + TxL * TxE), specularPower);',
			'vec3 color = (diffuse * TxL) + (specularColor * specularAmount);',
			//'vec3 color = (diffuse * TxL);',
			//'vec3 color = (specularColor * specularAmount);',

			// "Simple shadow effect"
			'float shadowFactor = (shadow - 1.0 + normalizedLength)/shadow;',
			'color *= shadowFactor;',

			'gl_FragColor = vec4(color, 1.0);',
			
			'}'//
		].join("\n")
	};

/*

 uniform sampler2D opacityTexture;
 uniform sampler2D colorTexture;
 uniform sampler2D furMaskTexture;
 uniform float normalizedLength;

 uniform float curlRadius;
 uniform float curlFrequency;

 uniform float l;
 uniform float time;
 uniform float windStrength;

 varying vec3 lightDir;
 varying vec3 eye;

 varying vec2 v_texCoord;
 varying vec3 T;

 void main( void )
 {

 Fur strand model!
 -----------------

 The final position is written to pos.

	vec3 pos;

	 The point p_0 is positioned at half the length of a hair.
	 pStart is the point at the tip of the hair and is where the springsystem has it's equiilbrium.





	//Move all calculations to world space

	vec3 normal = normalize(gl_NormalMatrix * gl_Normal);
	vec3 p_root = (gl_ModelViewMatrix * gl_Vertex).xyz;
	vec3 p_0 = p_root + (normal*l);
	float L_0 = length(p_0 - p_root);




	 Mass particle spring system




	 http://www.answerbag.com/q_view/2159502
	 According to a scientific study of trace elements in hair,
	 a single strand of hair 4 1/2 inches in length weighs, on average, 0.62 milligram,
	 with weights varying from 0.25 milligram to just under 1 milligram.

	//1 mg = 0.00001 kg
	float mass =  0.00001;

	//Gravity
	vec3 gravity = vec3(0,-1,0) * 9.81*mass;
	vec3 test = 14* sin(time*2.0) * mass * vec3(1,0,0);

	//k in Newtonmeters
	float k = length(gravity)/(L_0*0.5);

	lightDir = vec3(p_0 - gl_LightSource[0].position);
	float windDistance = length(lightDir);
	lightDir = normalize(lightDir);

	vec3 wind = (10 + windStrength)*mass*lightDir;


	//Hooke's law F = -kx <-> x = -F/k
	vec3 p = (gravity + wind)/k + p_0;


	 CONSTRAINTS
	 2 constraints for the instant position p, to constrain p in a hemisphere abouve the surface
	 |p-p_root| <= L_0
	 dot((p-p_root),normal) >= 0


	vec3 constraint = p-p_root;

	float c1 = length(constraint);
	if ( c1 > L_0 )
	{
		p = p_root + ( L_0 * normalize(constraint));
	}

	float c2 = dot((p-p_0),normal);
	if ( c2 < 0 )
	{

		 If p is below the surface, add the depth in the normal's direction

		 depth is calculated as the projection of the vector from the root
		 to the point p projected at the negative normal

		p = p + normal * -c2;

	}

	if ( normalizedLength < 1.0 )
	{
		 Qudratic bezier approximation of the curvture of the hair
		 pos = (1-h)^2 * proot + 2h(1-h)p0 + h^2 *p
		 pos = a*a*proot + 2*h*a*p0 + h*h*p


		float a = (1.0-normalizedLength);

		pos = (a*a*p_root) + (2.0*normalizedLength*a*p_0) + (normalizedLength*normalizedLength*p);


		 Derivative of bezier curve == tangent?
		 The tangent is used for lighting computations in the fragment shader

		T = (2.0*a*(p_0 - p_root) + 2.0*normalizedLength*(p-p_0));

	}
	else
	{
		pos = p;
		T = 2.0*(p-p_0);
	}

	T = normalize(gl_ModelViewMatrix * vec4(T,0.0));



	 Curliness Control!
	 ------------------
	 http://www.ozone3d.net/tutorials/mesh_deformer_p2.php#tangent_space

	 Displace the pos in a circle in the surface plane to create curls!


	vec3 tangent;
	vec3 binormal;

	vec3 x1 = cross(gl_Normal, vec3(0.0, 0.0, 1.0));
	vec3 x2 = cross(gl_Normal, vec3(0.0, 1.0, 0.0));

	if(length(x1)>length(x2))
	{
		tangent = x1;
	}
	else
	{
		tangent = x2;
	}

	tangent = normalize(tangent);
	binormal = cross(gl_Normal, tangent);
	binormal = normalize(binormal);

	tangent = normalize((gl_ModelViewMatrix * vec4(tangent,0.0)).xyz);
	binormal = normalize((gl_ModelViewMatrix * vec4(binormal,0.0)).xyz);

	float wh = curlFrequency*normalizedLength;
	pos += curlRadius*normalizedLength*(cos(wh)*tangent + sin(wh)*binormal );


	 End of the vertex shader.
	 Set the position and send the varying vectors to the fragshader.



	//gl_Position = gl_ModelViewProjectionMatrix * (vec4(pos,gl_Vertex.w));
	gl_Position = gl_ProjectionMatrix * (vec4(pos,gl_Vertex.w));

	lightDir = vec3(gl_LightSource[0].position - vec4(pos,0));
	eye =  -pos;
	lightDir = normalize(lightDir);
	eye = normalize(eye);
	v_texCoord = gl_MultiTexCoord0.xy;
}

*/


/*
 uniform sampler2D opacityTexture;
 uniform sampler2D colorTexture;
 uniform sampler2D furMaskTexture;
 uniform float normalizedLength;

 uniform float hairFrequency;


 varying vec3 lightDir;
 varying vec3 eye;

 varying vec2 v_texCoord;
 varying vec3 T;

 void main( void )
 {
 vec4 outputColor= vec4(0.0);
 float opacity = texture2D(opacityTexture,v_texCoord*hairFrequency).r;

 float furMask = texture2D(furMaskTexture,v_texCoord).r;

 float Ka = 0.05;
 vec3 color = texture2D(colorTexture,v_texCoord).rgb;

 if ( opacity > 0.0 && furMask > 0.0)
 {

 float Kshadow = 1.2;
 float Kd = 0.8;
 float Ks = 0.15;

 float phongExponent = 64;


 //Normalize the varying vectors
 vec3 L = normalize(lightDir);
 vec3 tangent = normalize(T);

 Kajiya and Kay , 1989 , Illumination model

 http://http.developer.nvidia.com/GPUGems/gpugems_ch33.html
 http://vilsen.se/Evaluation_of_Hair_Modeling_Simulation_and_Rendering_Algorithms_for_a_VFX_Hair_Modeling_System.pdf
 http://publications.dice.se/attachments/RealTimeHairSimAndVis.pdf

	float TdotL = dot(T,L);

	if ( TdotL > -0.3)
	{
		vec3 E = normalize(eye);

		float TdotE = dot(T,E);
		float sinTL = sin(acos(TdotL));
		float sinTE = sin(acos(TdotE));

		float diffuse = max(Kd * sinTL,0);
		float specular = max(Ks * pow(TdotL*TdotE + sinTL*sinTE,phongExponent),0.0);

		// "Simple shadow effect"
		float shadowFactor = (Kshadow - 1.0 + normalizedLength)/Kshadow;

		color = shadowFactor * ( color * (diffuse + specular + Ka));
	}
	else
	{
		color *= Ka;
	}
}
else
{
	//color = vec3(0,0,0);
	opacity = 0;
}

outputColor = vec4(color,opacity);
gl_FragColor = outputColor;

//gl_FragColor = vec4(vec3(opacity),opacity);

}
*/

	return FurPass;
});