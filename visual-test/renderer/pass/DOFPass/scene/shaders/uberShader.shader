{
	"attributes": {
		"vertexColor": "COLOR",
		"vertexJointIDs": "JOINTIDS",
		"vertexNormal": "NORMAL",
		"vertexPosition": "POSITION",
		"vertexTangent": "TANGENT",
		"vertexUV0": "TEXCOORD0",
		"vertexUV1": "TEXCOORD1",
		"vertexWeights": "WEIGHTS"
	},
	"fshaderRef": "shaders/uberShader.frag",
	"name": "UberShader",
	"processors": [
		"uber",
		"light"
	],
	"uniforms": {
		"aoMap": "AO_MAP",
		"cameraPosition": "CAMERA",
		"diffuseMap": "DIFFUSE_MAP",
		"diffuseRepeat": [
			1,
			1
		],
		"emissiveMap": "EMISSIVE_MAP",
		"lightMap": "LIGHT_MAP",
		"normalMap": "NORMAL_MAP",
		"specularMap": "SPECULAR_MAP",
		"viewProjectionMatrix": "VIEW_PROJECTION_MATRIX",
		"worldMatrix": "WORLD_MATRIX",
		"materialAmbient": "AMBIENT",
		"materialEmissive": "EMISSIVE",
		"materialDiffuse": "DIFFUSE",
		"materialSpecular": "SPECULAR",
		"materialSpecularPower": "SPECULAR_POWER",
		"pointLightColor": [],
		"pointLight": [],
		"directionalLightColor": [
			1,
			1,
			0.949999988079071,
			1,
			0.23000000417232513,
			0.25999999046325684,
			0.28999999165534973,
			0,
			0.23999999463558197,
			0.15000000596046448,
			0.15000000596046448,
			0
		],
		"directionalLightDirection": [
			0.4558423161506653,
			-0.6837634444236755,
			-0.5698028802871704,
			-0.15617376565933228,
			-0.9370425939559937,
			0.31234753131866455,
			-0.2956562042236328,
			0.8869686126708984,
			0.3547874391078949
		],
		"spotLightColor": [],
		"spotLight": [],
		"spotLightDirection": [],
		"spotLightAngle": [],
		"spotLightExponent": []
	},
	"vshaderRef": "shaders/uberShader.vert"
}