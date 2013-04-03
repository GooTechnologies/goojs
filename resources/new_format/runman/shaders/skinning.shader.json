{
	"name": "Skinning",
	"defines" : {
		"JOINT_COUNT" : 56,
		"WEIGHTS" : 4
	},
	"attributes": {
		"vertexPosition": "POSITION",
		"vertexUV0": "TEXCOORD0",
		"vertexWeights": "WEIGHTS",
		"vertexJointIDs": "JOINTIDS"
	},
	"uniforms": {
		"viewMatrix": "VIEW_MATRIX",
		"projectionMatrix": "PROJECTION_MATRIX",
		"worldMatrix": "WORLD_MATRIX",
		"diffuseMap": "TEXTURE0",
		"jointPalette": "function (shaderInfo) {   var skMesh = shaderInfo.meshData;   var pose = skMesh.currentPose;   if (pose !== null) {    var palette = pose._matrixPalette;    var buffLength = skMesh.paletteMap.length * 16;    var store = skMesh.store;    if (!store) {     store = new Float32Array(buffLength);     skMesh.store = store;    }    var refMat;    for (var index = 0; index < skMesh.paletteMap.length; index++) {     refMat = palette[skMesh.paletteMap[index]];     for (var i = 0; i < 4; i++) {      for (var j = 0; j < 4; j++) {       store[index * 16 + i * 4 + j] = refMat.data[j * 4 + i];      }     }    }    return store;   }  }"	
	},
	"vshaderRef": "shaders/skinning.vs",
	"fshaderRef": "shaders/skinning.fs"
}