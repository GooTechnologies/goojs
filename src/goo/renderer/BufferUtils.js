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
			indices = new Int32Array(indexCount);
		}
		return indices;
	};

	return BufferUtils;
});