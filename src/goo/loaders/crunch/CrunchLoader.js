/*
 * Copyright (c) 2012 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

/*jshint bitwise: false */
define([
	'goo/loaders/dds/DdsLoader',
	'goo/loaders/crunch/crn_decomp'
],
/** @lends */
function(
	DdsLoader,
	Module
) {

	function CrunchLoader() {
	}

	// If you want to force crunch to decode in a worker set this to true.
	// Otherwise it will decode in the main browser process by default.
	CrunchLoader.CRUNCH_DECODE_IN_WORKER = false;

	// Taken from crnlib.h
	CrunchLoader.cCRNFmtInvalid = -1;

	CrunchLoader.cCRNFmtDXT1 = 0;
	CrunchLoader.cCRNFmtDXT3 = 1;
	CrunchLoader.cCRNFmtDXT5 = 2;

	// Various DXT5 derivatives
	CrunchLoader.cCRNFmtDXT5_CCxY = 3; // Luma-chroma
	CrunchLoader.cCRNFmtDXT5_xGxR = 4; // Swizzled 2-component
	CrunchLoader.cCRNFmtDXT5_xGBR = 5; // Swizzled 3-component
	CrunchLoader.cCRNFmtDXT5_AGBR = 6; // Swizzled 4-component

	// ATI 3DC and X360 DXN
	CrunchLoader.cCRNFmtDXN_XY = 7;
	CrunchLoader.cCRNFmtDXN_YX = 8;

	// DXT5 alpha blocks only
	CrunchLoader.cCRNFmtDXT5A = 9;

	CrunchLoader.prototype.arrayBufferCopy = function(src, dst, dstByteOffset, numBytes) {
		var dst32Offset = dstByteOffset / 4,
			tail = (numBytes % 4),
			src32 = new Uint32Array(src.buffer, 0, (numBytes - tail) / 4),
			dst32 = new Uint32Array(dst.buffer),
			i;

		for (i = 0; i < src32.length; i++) {
			dst32[dst32Offset + i] = src32[i];
		}
		for (i = numBytes - tail; i < numBytes; i++) {
			dst[dstByteOffset + i] = src[i];
		}
	};

	CrunchLoader.prototype.load = function(arrayBuffer, texture/*, flipped, arrayByteOffset, arrayByteLength*/) {
		var bytes = new Uint8Array(arrayBuffer),
			srcSize = arrayBuffer.byteLength,
			src = Module._malloc(srcSize),
			format, dst, dstSize,
			width, height, levels, dxtData, i;

		this.arrayBufferCopy(bytes, Module.HEAPU8, src, srcSize);

		texture.type = 'UnsignedByte';

		format = Module._crn_get_dxt_format(src, srcSize);

		var bpp;
		switch (format) {
			case CrunchLoader.cCRNFmtDXT1:
				texture.format = "PrecompressedDXT1A";
				bpp = 4;
				break;
			case CrunchLoader.cCRNFmtDXT3:
				texture.format = "PrecompressedDXT3";
				bpp = 8;
				break;
			case CrunchLoader.cCRNFmtDXT5:
				texture.format = "PrecompressedDXT5";
				bpp = 8;
				break;
			default:
				console.error("Unsupported image format");
				return 0;
		}

		texture.image.isCompressed = true;

		width = Module._crn_get_width(src, srcSize);
		height = Module._crn_get_height(src, srcSize);
		levels = Module._crn_get_levels(src, srcSize);
		dstSize = Module._crn_get_uncompressed_size(src, srcSize, 0);
		dst = Module._malloc(dstSize);

		var image = texture.image;
		if (typeof image === 'undefined' || image === null) {
			image = {};
			texture.image = image;
		}

		image.width = width;
		image.height = height;
		image.depth = 1;

		// if (ext) {
			var imageData = [];
			var mipmapByteSizes = [];
			for (i = 0; i < levels; ++i) {
				if (i) {
					dstSize = Module._crn_get_uncompressed_size(src, srcSize, i);
				}
				Module._crn_decompress(src, srcSize, dst, dstSize, i);
				dxtData = new Uint8Array(Module.HEAPU8.buffer, dst, dstSize);

				mipmapByteSizes.push(dstSize);
				imageData.push(dxtData);

				width *= 0.5;
				height *= 0.5;
			}
		// } else {
		// 	if (format === CrunchLoader.cCRNFmtDXT1) {
		// 		Module._crn_decompress(src, srcSize, dst, dstSize, 0);
		// 		rgb565Data = this.dxtToRgb565(Module.HEAPU16, dst / 2, width, height); //// only place where dss is used
		// 		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, rgb565Data);
		// 		if (loadMipmaps) {
		// 			gl.generateMipmap(gl.TEXTURE_2D);
		// 		}
		// 	} else {
		// 		console.error("No manual decoder for format and no native support");
		// 		return 0;
		// 	}
		// }

		var totalSize = 0;
		for (var i = 0; i < mipmapByteSizes.length; i++) {
			totalSize += mipmapByteSizes[i];
		}

		var imageBuffer = new Uint8Array(totalSize);
		var offset = 0;
		for (i = 0; i < levels; i++) {
			var data = imageData[i];
			imageBuffer.set(data, offset);
			offset += data.length;
		}

		texture.image.mipmapSizes = mipmapByteSizes;
		texture.image.data = imageBuffer;
		texture.image.useArrays = true;

		if (levels <= 1) {
			texture.minFilter = 'BilinearNoMipMaps';
		}

		image.bpp = bpp;
		image.dataReady = true;
		texture.needsUpdate = true;

		Module._free(src);
		Module._free(dst);
	};

	/**
	 * Transcodes DXT into RGB565.
	 * Optimizations:
	 * 1. Use integer math to compute c2 and c3 instead of floating point
	 *    math.  Specifically:
	 *      c2 = 5/8 * c0 + 3/8 * c1
	 *      c3 = 3/8 * c0 + 5/8 * c1
	 *    This is about a 40% performance improvement.  It also appears to
	 *    match what hardware DXT decoders do, as the colors produced
	 *    by this integer math match what hardware produces, while the
	 *    floating point in dxtToRgb565Unoptimized() produce slightly
	 *    different colors (for one GPU this was tested on).
	 * 2. Unroll the inner loop.  Another ~10% improvement.
	 * 3. Compute r0, g0, b0, r1, g1, b1 only once instead of twice.
	 *    Another 10% improvement.
	 * 4. Use a Uint16Array instead of a Uint8Array.  Another 10% improvement.
	 * @author Evan Parker
	 * @param {Uint16Array} src The src DXT bits as a Uint16Array.
	 * @param {number} srcByteOffset
	 * @param {number} width
	 * @param {number} height
	 * @return {Uint16Array} dst
	 */
	CrunchLoader.prototype.dxtToRgb565 = function(src, src16Offset, width, height) {
		var c = new Uint16Array(4);
		var dst = new Uint16Array(width * height);
		// var nWords = (width * height) / 4;
		var m = 0;
		var dstI = 0;
		var i = 0;
		var r0 = 0,
			g0 = 0,
			b0 = 0,
			r1 = 0,
			g1 = 0,
			b1 = 0;

		var blockWidth = width / 4;
		var blockHeight = height / 4;
		for (var blockY = 0; blockY < blockHeight; blockY++) {
			for (var blockX = 0; blockX < blockWidth; blockX++) {
				i = src16Offset + 4 * (blockY * blockWidth + blockX);
				c[0] = src[i];
				c[1] = src[i + 1];
				r0 = c[0] & 0x1f;
				g0 = c[0] & 0x7e0;
				b0 = c[0] & 0xf800;
				r1 = c[1] & 0x1f;
				g1 = c[1] & 0x7e0;
				b1 = c[1] & 0xf800;
				// Interpolate between c0 and c1 to get c2 and c3.
				// Note that we approximate 1/3 as 3/8 and 2/3 as 5/8 for
				// speed.  This also appears to be what the hardware DXT
				// decoder in many GPUs does :)
				c[2] = ((5 * r0 + 3 * r1) >> 3) | (((5 * g0 + 3 * g1) >> 3) & 0x7e0) | (((5 * b0 + 3 * b1) >> 3) & 0xf800);
				c[3] = ((5 * r1 + 3 * r0) >> 3) | (((5 * g1 + 3 * g0) >> 3) & 0x7e0) | (((5 * b1 + 3 * b0) >> 3) & 0xf800);
				m = src[i + 2];
				dstI = (blockY * 4) * width + blockX * 4;
				dst[dstI] = c[m & 0x3];
				dst[dstI + 1] = c[(m >> 2) & 0x3];
				dst[dstI + 2] = c[(m >> 4) & 0x3];
				dst[dstI + 3] = c[(m >> 6) & 0x3];
				dstI += width;
				dst[dstI] = c[(m >> 8) & 0x3];
				dst[dstI + 1] = c[(m >> 10) & 0x3];
				dst[dstI + 2] = c[(m >> 12) & 0x3];
				dst[dstI + 3] = c[(m >> 14)];
				m = src[i + 3];
				dstI += width;
				dst[dstI] = c[m & 0x3];
				dst[dstI + 1] = c[(m >> 2) & 0x3];
				dst[dstI + 2] = c[(m >> 4) & 0x3];
				dst[dstI + 3] = c[(m >> 6) & 0x3];
				dstI += width;
				dst[dstI] = c[(m >> 8) & 0x3];
				dst[dstI + 1] = c[(m >> 10) & 0x3];
				dst[dstI + 2] = c[(m >> 12) & 0x3];
				dst[dstI + 3] = c[(m >> 14)];
			}
		}
		return dst;
	};

	CrunchLoader.prototype.isSupported = function () {
		return DdsLoader.SUPPORTS_DDS;
	};

	CrunchLoader.prototype.toString = function () {
		return "CrunchLoader";
	};

	return CrunchLoader;
});