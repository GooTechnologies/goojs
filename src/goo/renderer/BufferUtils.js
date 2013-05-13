define(
	/** @lends */
	function() {
	"use strict";

	function BufferUtils() {
	}

	BufferUtils.createIndexBuffer = function(indexCount, vertexCount) {
		var indices;
		if (vertexCount < 256) { // 2^8
			indices = new Uint8Array(indexCount);
		} else if (vertexCount < 65536) { // 2^16
			indices = new Uint16Array(indexCount);
		} else { // 2^32
			// XXX: Currently not allowed in WebGL. Max is 16 bits.
			throw new Error("Maximum number of vertices is 65535. Got: " + vertexCount);
			// indices = new Uint32Array(indexCount);
		}
		return indices;
	};

	return BufferUtils;
});