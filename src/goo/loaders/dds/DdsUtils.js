/*jshint bitwise: false */
define([
	'goo/renderer/Capabilities'
], function (
	Capabilities
) {
	'use strict';

	function DdsUtils() {
	}

	DdsUtils.isSupported = function () {
		return !!Capabilities.CompressedTextureS3TC;
	};

	/**
	 * Get the necessary bit shifts needed to align mask with 0.
	 * @param mask the bit mask to test
	 * @returns number of bits to shift to the right to align mask with 0.
	 */
	DdsUtils.shiftCount = function (mask) {
		if (mask === 0) {
			return 0;
		}

		var i = 0;
		while ((mask & 0x1) === 0) {
			mask = mask >> 1;
			i++;
			if (i > 32) {
				throw "invalid mask!";
			}
		}

		return i;
	};

	/**
	 * Check a value against a bit mask to see if it is set.
	 * @param value the value to check
	 * @param bitMask our mask
	 * @returns true if the mask passes
	 */
	DdsUtils.isSet = function (value, bitMask) {
		return (value & bitMask) === bitMask;
	};

	/**
	 * Get the string as a dword int value.
	 * @param string our string... should only be 1-4 chars long. Expected to be 1 byte chars.
	 * @returns the int value
	 */
	DdsUtils.getIntFromString = function (string) {
		var bytes = [];
		for (var i = 0; i < string.length; i++) {
			bytes[i] = string.charCodeAt(i);
		}
		return DdsUtils.getIntFromBytes(bytes);
	};

	/**
	 * Get the byte array as a dword int value.
	 * @param bytes our array... should only be 1-4 bytes long.
	 * @returns the int value
	 */
	DdsUtils.getIntFromBytes = function (bytes) {
		var rVal = 0;
		rVal |= (bytes[0] & 0xff) << 0;
		if (bytes.length > 1) {
			rVal |= (bytes[1] & 0xff) << 8;
		}
		if (bytes.length > 2) {
			rVal |= (bytes[2] & 0xff) << 16;
		}
		if (bytes.length > 3) {
			rVal |= (bytes[3] & 0xff) << 24;
		}
		return rVal;
	};

	DdsUtils.getComponents = function (format) {
		switch (format)
		{
		case "Alpha":
			return 1;
		case "RGB":
			return 3;
		case "RGBA":
			return 4;
		case "Luminance":
			return 1;
		case "LuminanceAlpha":
			return 2;
		case "PrecompressedDXT1":
			return 1;
		case "PrecompressedDXT1A":
			return 1;
		case "PrecompressedDXT3":
			return 2;
		case "PrecompressedDXT5":
			return 2;
		}
		return 0;
	};

	/**
	 * Flip a dxt mipmap/image. Inspired by similar code in opentk and the nvidia sdk.
	 * @param rawData our unflipped image as raw bytes
	 * @param width our image's width
	 * @param height our image's height
	 * @param format our image's format
	 * @returns the flipped image as raw bytes.
	 */
	DdsUtils.flipDXT = function (rawData, width, height, format) {
		var returnData = new Uint8Array(rawData.length);

		var blocksPerColumn = width + 3 >> 2;
		var blocksPerRow = height + 3 >> 2;
		var bytesPerBlock = DdsUtils.getComponents(format) * 8;

		for (var sourceRow = 0; sourceRow < blocksPerRow; sourceRow++) {
			var targetRow = blocksPerRow - sourceRow - 1;
			for (var column = 0; column < blocksPerColumn; column++) {
				var target = (targetRow * blocksPerColumn + column) * bytesPerBlock;
				var source = (sourceRow * blocksPerColumn + column) * bytesPerBlock;
				switch (format)
				{
				case "PrecompressedDXT1":
				case "PrecompressedDXT1A":
					// case PrecompressedLATC_L:
					returnData[target + 0] = rawData[source + 0];
					returnData[target + 1] = rawData[source + 1];
					returnData[target + 2] = rawData[source + 2];
					returnData[target + 3] = rawData[source + 3];
					returnData[target + 4] = rawData[source + 7];
					returnData[target + 5] = rawData[source + 6];
					returnData[target + 6] = rawData[source + 5];
					returnData[target + 7] = rawData[source + 4];
					break;
				case "PrecompressedDXT3":
					// Alpha
					returnData[target + 0] = rawData[source + 6];
					returnData[target + 1] = rawData[source + 7];
					returnData[target + 2] = rawData[source + 4];
					returnData[target + 3] = rawData[source + 5];
					returnData[target + 4] = rawData[source + 2];
					returnData[target + 5] = rawData[source + 3];
					returnData[target + 6] = rawData[source + 0];
					returnData[target + 7] = rawData[source + 1];
					// Color
					returnData[target + 8] = rawData[source + 8];
					returnData[target + 9] = rawData[source + 9];
					returnData[target + 10] = rawData[source + 10];
					returnData[target + 11] = rawData[source + 11];
					returnData[target + 12] = rawData[source + 15];
					returnData[target + 13] = rawData[source + 14];
					returnData[target + 14] = rawData[source + 13];
					returnData[target + 15] = rawData[source + 12];
					break;
				case "PrecompressedDXT5":
					// Alpha, the first 2 bytes remain
					returnData[target + 0] = rawData[source + 0];
					returnData[target + 1] = rawData[source + 1];

					// extract 3 bits each and flip them
					DdsUtils.getBytesFromUInt24(returnData, target + 5, DdsUtils.flipUInt24(DdsUtils.getUInt24(rawData, source + 2)));
					DdsUtils.getBytesFromUInt24(returnData, target + 2, DdsUtils.flipUInt24(DdsUtils.getUInt24(rawData, source + 5)));

					// Color
					returnData[target + 8] = rawData[source + 8];
					returnData[target + 9] = rawData[source + 9];
					returnData[target + 10] = rawData[source + 10];
					returnData[target + 11] = rawData[source + 11];
					returnData[target + 12] = rawData[source + 15];
					returnData[target + 13] = rawData[source + 14];
					returnData[target + 14] = rawData[source + 13];
					returnData[target + 15] = rawData[source + 12];
					break;
				// case PrecompressedLATC_LA:
				// // alpha
				// System.arraycopy(rawData, source, returnData, target, 4);
				// returnData[target + 4] = rawData[source + 7];
				// returnData[target + 5] = rawData[source + 6];
				// returnData[target + 6] = rawData[source + 5];
				// returnData[target + 7] = rawData[source + 4];
				//
				// // Color
				// System.arraycopy(rawData, source + 8, returnData, target + 8, 4);
				// returnData[target + 12] = rawData[source + 15];
				// returnData[target + 13] = rawData[source + 14];
				// returnData[target + 14] = rawData[source + 13];
				// returnData[target + 15] = rawData[source + 12];
				// break;
				}
			}
		}
		return returnData;
	};

	// DXT5 Alpha block flipping, inspired by code from Evan Hart (nVidia SDK)
	DdsUtils.getUInt24 = function (input, offset) {
		var result = 0;
		result |= (input[offset + 0] & 0xff) << 0;
		result |= (input[offset + 1] & 0xff) << 8;
		result |= (input[offset + 2] & 0xff) << 16;
		return result;
	};

	DdsUtils.getBytesFromUInt24 = function (input, offset, uint24) {
		input[offset + 0] = (uint24 & 0x000000ff);
		input[offset + 1] = ((uint24 & 0x0000ff00) >> 8);
		input[offset + 2] = ((uint24 & 0x00ff0000) >> 16);
	};

	DdsUtils.ThreeBits = [[0, 0, 0, 0], [0, 0, 0, 0]];

	DdsUtils.flipUInt24 = function (uint24) {
		var threeBits = DdsUtils.ThreeBits;

		// extract 3 bits each into the array
		threeBits[0][0] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[0][1] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[0][2] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[0][3] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[1][0] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[1][1] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[1][2] = (uint24 & 0x7);
		uint24 >>= 3;
		threeBits[1][3] = (uint24 & 0x7);

		// stuff 8x 3bits into 3 bytes
		var result = 0;
		result = result | threeBits[1][0] << 0;
		result = result | threeBits[1][1] << 3;
		result = result | threeBits[1][2] << 6;
		result = result | threeBits[1][3] << 9;
		result = result | threeBits[0][0] << 12;
		result = result | threeBits[0][1] << 15;
		result = result | threeBits[0][2] << 18;
		result = result | threeBits[0][3] << 21;
		return result;
	};

	return DdsUtils;
});