define(function() {
	"use strict";

	function BufferUtils() {
	}

	BufferUtils.createIntBuffer = function(indexCount, vertexCount) {
		var indices;
		if (vertexCount < 256) { // 2^8
			indices = new Int8Array(indexCount);
		} else if (vertexCount < 65536) { // 2^16
			indices = new Int16Array(indexCount);
		} else { // 2^32
			// XXX: Currently not allowed in WebGL. Max is 16 bits.
			throw new Error("Maximum number of vertices is 65536. Got: " + vertexCount);
			// indices = new Int32Array(indexCount);
		}
		return indices;
	};

	return BufferUtils;
});