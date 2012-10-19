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
				buffer[outIndex] = val;
			}
		}
		console.log('out: ' + stride * tuples);
	};

	JsonUtils.getIntBuffer = function(indices, vertexCount) {
		var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
		indexBuffer.set(indices);
		return indexBuffer;
	};

	JsonUtils.getIntBufferFromCompressedString = function(indices, vertexCount) {
		var prev = 0;
		var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
		var min = 10000000;
		var max = 0;
		for ( var i = 0; i < indices.length; ++i) { // ++i?
			var word = indices.charAt(i);
			prev += JsonUtils.unzip(word);
			indexBuffer[i] = prev;
			if (prev > max) {
				max = prev;
			}
			if (prev < min) {
				min = prev;
			}
		}
		console.log(min + ' - ' + max);
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

	return JsonUtils;
});