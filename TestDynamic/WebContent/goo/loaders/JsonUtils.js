define([ 'goo/renderer/Util', 'goo/renderer/MeshData', 'goo/renderer/BufferUtils' ], function(Util, MeshData,
		BufferUtils) {
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
				word = attribs.charAt(i + j * tuples);
				outIndex = i * stride + j;
				prev += JsonUtils.unzip(word);
				var val = (prev + offsets[j]) * scales[j];
				buffer.set([ val ], outIndex);
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
			var word = indices.charAt(i);
			prev += JsonUtils.unzip(word);
			indexBuffer.set([ prev ], i);
		}
		return indexBuffer;
	};

	JsonUtils.unzip = function(word) {
		if (word >= 0xD800 + 0x0800) {
			word -= 0x0800;
		}
		word -= 0x23;
		// un-zigzag
		word = word >> 1 ^ -(word & 1);
		return word;
	};

	return JsonUtils;
});