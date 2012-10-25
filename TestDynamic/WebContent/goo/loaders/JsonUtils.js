define(['goo/renderer/Util', 'goo/renderer/MeshData', 'goo/renderer/BufferUtils', 'goo/math/Transform'], function(Util,
	MeshData, BufferUtils, Transform) {
	"use strict";

	function JsonUtils() {

	}

	JsonUtils.fillAttributeBufferFromCompressedString = function(attribs, meshData, attributeKey, scales, offsets) {
		var buffer = meshData.getAttributeBuffer(attributeKey);
		var stride = scales.length;
		var tuples = attribs.length / scales.length;
		var prev, word, outIndex, i, j;
		for (j = 0; j < stride; j++) {
			prev = 0;
			for (i = 0; i < tuples; i++) {
				word = attribs.charCodeAt(i + j * tuples);
				outIndex = i * stride + j;
				prev += JsonUtils.unzip(word);
				var val = (prev + offsets[j]) * scales[j];
				buffer[outIndex] = val;
			}
		}
	};

	JsonUtils.getIntBuffer = function(indices, vertexCount) {
		var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
		indexBuffer.set(indices);
		return indexBuffer;
	};

	JsonUtils.getIntBufferFromCompressedString = function(indices, vertexCount) {
		var prev = 0;
		var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
		for ( var i = 0; i < indices.length; ++i) {
			var word = indices.charCodeAt(i);
			prev += JsonUtils.unzip(word);
			indexBuffer[i] = prev;
		}
		return indexBuffer;
	};

	JsonUtils.unzip = function(word) {
		if (word >= 0xE000) {
			word -= 0x0800;
		}
		word -= 0x23;
		// un-zigzag
		word = (word >> 1) ^ (-(word & 1));

		return word;
	};

	JsonUtils.parseTransform = function(object) {
		var transform = new Transform();

		transform.translation = JsonUtils.parseVector3(object.Translation);
		transform.scale = JsonUtils.parseVector3(object.Scale);
		// TODO
		// transform.rotation = JsonUtils.parseMatrix3(object.Rotation);
		var m = JsonUtils.parseMatrix3(object.Rotation).elements;
		var mat4 = new THREE.Matrix4(m[0], m[1], m[2], 0, m[3], m[4], m[5], 0, m[6], m[7], m[8], 0, 0, 0, 0, 0);
		transform.rotation.setEulerFromRotationMatrix(mat4, 'XYZ');

		return transform;
	};

	JsonUtils.parseMatrix3 = function(array) {
		var matrix = new THREE.Matrix3();
		matrix.elements.set(array);
		return matrix;
	};

	JsonUtils.parseVector3 = function(array) {
		return new THREE.Vector3(array[0], array[1], array[2]);
	};

	return JsonUtils;
});