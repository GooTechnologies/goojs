{
	"attributes" : {
		"vertexPosition" : "POSITION",
		"vertexNormal" : "NORMAL"
	},
	"uniforms" : {
		"viewMatrix" : "VIEW_MATRIX",
		"projectionMatrix" : "PROJECTION_MATRIX",
		"worldMatrix" : "WORLD_MATRIX",
		"cameraPosition" : "CAMERA",
		"lightPosition" : "LIGHT0",
		"materialAmbient" : "AMBIENT",
		"materialDiffuse" : "DIFFUSE",
		"materialSpecular" : "SPECULAR",
		"materialSpecularPower" : "SPECULAR_POWER"
	},
	"vs" : "shaders/simpleLit.vs",
	"fs" : "shaders/simpleLit.fs"
}