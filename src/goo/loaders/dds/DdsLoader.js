/*jshint bitwise: false */
var DdsUtils = require('../../loaders/dds/DdsUtils');
var Capabilities = require('../../renderer/Capabilities');

function DdsPixelFormat() {
	this.dwSize = 0;
	this.dwFlags = 0;
	this.dwFourCC = 0;
	this.dwRGBBitCount = 0;
	this.dwRBitMask = 0;
	this.dwGBitMask = 0;
	this.dwBBitMask = 0;
	this.dwABitMask = 0;
}

DdsPixelFormat.HEADER_OFFSET = 19;

// ---- VALUES USED IN dwFlags ----
// Texture contains alpha data; dwABitMask contains valid data.
DdsPixelFormat.DDPF_ALPHAPIXELS = 0x1;
// Used in some older DDS files for alpha channel only uncompressed data (dwRGBBitCount contains the alpha channel
// bitcount; dwABitMask contains valid data)
DdsPixelFormat.DDPF_ALPHA = 0x2;
// Texture contains compressed RGB data; dwFourCC contains valid data.
DdsPixelFormat.DDPF_FOURCC = 0x4;
// Texture contains uncompressed RGB data; dwRGBBitCount and the RGB masks (dwRBitMask, dwGBitMask, dwBBitMask)
// contain valid data.
DdsPixelFormat.DDPF_RGB = 0x40;
// Used in some older DDS files for YUV uncompressed data (dwRGBBitCount contains the YUV bit count; dwRBitMask
// contains the Y mask, dwGBitMask contains the U mask, dwBBitMask contains the V mask)
DdsPixelFormat.DDPF_YUV = 0x200;
// Used in some older DDS files for single channel color uncompressed data (dwRGBBitCount contains the luminance
// channel bit count; dwRBitMask contains the channel mask). Can be combined with DDPF_ALPHAPIXELS for a two channel
// DDS file.
DdsPixelFormat.DDPF_LUMINANCE = 0x20000;
// ---- /end VALUES USED IN dwFlags ----

DdsPixelFormat.read = function (data) { // Int32Array
	var format = new DdsPixelFormat();
	format.dwSize = data[DdsPixelFormat.HEADER_OFFSET + 0];
	if (format.dwSize !== 32) {
		throw ('invalid pixel format size: ' + format.dwSize);
	}
	format.dwFlags = data[DdsPixelFormat.HEADER_OFFSET + 1];
	format.dwFourCC = data[DdsPixelFormat.HEADER_OFFSET + 2];
	format.dwRGBBitCount = data[DdsPixelFormat.HEADER_OFFSET + 3];
	format.dwRBitMask = data[DdsPixelFormat.HEADER_OFFSET + 4];
	format.dwGBitMask = data[DdsPixelFormat.HEADER_OFFSET + 5];
	format.dwBBitMask = data[DdsPixelFormat.HEADER_OFFSET + 6];
	format.dwABitMask = data[DdsPixelFormat.HEADER_OFFSET + 7];
	return format;
};

function DdsHeader() {
	this.dwSize = 0;
	this.dwFlags = 0;
	this.dwHeight = 0;
	this.dwWidth = 0;
	this.dwLinearSize = 0;
	this.dwDepth = 0;
	this.dwMipMapCount = 0;
	this.dwAlphaBitDepth = 0;
	this.dwReserved1 = [];
	this.ddpf = null;
	this.dwCaps = 0;
	this.dwCaps2 = 0;
	this.dwCaps3 = 0;
	this.dwCaps4 = 0;
	this.dwTextureStage = 0;
}

// Required caps flag.
DdsHeader.DDSD_CAPS = 0x1;
// Required caps flag.
DdsHeader.DDSD_HEIGHT = 0x2;
// Required caps flag.
DdsHeader.DDSD_WIDTH = 0x4;
// Required when pitch is provided for an uncompressed texture.
DdsHeader.DDSD_PITCH = 0x8;
// Required caps flag.
DdsHeader.DDSD_PIXELFORMAT = 0x1000;
// Required in a mipmapped texture.
DdsHeader.DDSD_MIPMAPCOUNT = 0x20000;
// Required when pitch is provided for a compressed texture.
DdsHeader.DDSD_LINEARSIZE = 0x80000;
// Required in a depth texture.
DdsHeader.DDSD_DEPTH = 0x800000;
// ---- /end VALUES USED IN dwFlags ----

// ---- VALUES USED IN dwCaps ----
// Optional; must be used on any file that contains more than one surface (a mipmap, a cubic environment map, or
// volume texture).
DdsHeader.DDSCAPS_COMPLEX = 0x8;
// Optional; should be used for a mipmap.
DdsHeader.DDSCAPS_MIPMAP = 0x400000;
// Required caps flag.
DdsHeader.DDSCAPS_TEXTURE = 0x1000;
// ---- /end VALUES USED IN dwCaps ----

// ---- VALUES USED IN dwCaps2 ----
// Required for a cube map.
DdsHeader.DDSCAPS2_CUBEMAP = 0x200;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
// Required when these surfaces are stored in a cube map.
DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
// Required for a volume texture.
DdsHeader.DDSCAPS2_VOLUME = 0x200000;
// ---- /end VALUES USED IN dwCaps2 ----

DdsHeader.read = function (data) { // Int32Array
	var header = new DdsHeader();
	header.dwSize = data[1];
	if (header.dwSize !== 124) {
		throw ('invalid dds header size: ' + header.dwSize);
	}
	header.dwFlags = data[2];
	header.dwHeight = data[3];
	header.dwWidth = data[4];
	header.dwLinearSize = data[5];
	header.dwDepth = data[6];
	header.dwMipMapCount = data[7];
	header.dwAlphaBitDepth = data[8];
	for (var i = 0; i < header.dwReserved1.length; i++) {
		header.dwReserved1[i] = data[9 + i];
	}
	header.ddpf = DdsPixelFormat.read(data);
	header.dwCaps = data[27];
	header.dwCaps2 = data[28];
	header.dwCaps3 = data[29];
	header.dwCaps4 = data[30];
	header.dwTextureStage = data[31];

	var expectedMipmaps = 1 + Math.ceil(Math.log(Math.max(header.dwHeight, header.dwWidth)) / Math.log(2));

	if (DdsUtils.isSet(header.dwCaps, DdsHeader.DDSCAPS_MIPMAP)) {
		if (!DdsUtils.isSet(header.dwFlags, DdsHeader.DDSD_MIPMAPCOUNT)) {
			header.dwMipMapCount = expectedMipmaps;
		} else if (header.dwMipMapCount !== expectedMipmaps) {
			console.warn('Got ' + header.dwMipMapCount + ' mipmaps, expected ' + expectedMipmaps);
		}
	} else {
		header.dwMipMapCount = 1;
	}

	return header;
};

function DdsImageInfo() {
	this.flipVertically = false;
	this.bpp = 0;
	this.header = null;
	this.headerDX10 = null;
	this.mipmapByteSizes = [];
}

DdsImageInfo.prototype.calcMipmapSizes = function (compressed) {
	var width = this.header.dwWidth;
	var height = this.header.dwHeight;
	var size = 0;

	for (var i = 0; i < this.header.dwMipMapCount; i++) {
		size = compressed ? ~~((width + 3) / 4) * ~~((height + 3) / 4) * this.bpp * 2 : ~~(width * height * this.bpp / 8);
		this.mipmapByteSizes.push(~~((size + 3) / 4) * 4);
		width = ~~(width / 2) > 1 ? ~~(width / 2) : 1;
		height = ~~(height / 2) > 1 ? ~~(height / 2) : 1;
	}
};

/**
 * Loads dds format images into a format usable by Goo.
 * @private
 */
function DdsLoader() {
}

DdsLoader.updateDepth = function (image, info) {
	if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP)) {
		var depth = 0;
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEX)) {
			depth++;
		}
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEX)) {
			depth++;
		}
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEY)) {
			depth++;
		}
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEY)) {
			depth++;
		}
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_POSITIVEZ)) {
			depth++;
		}
		if (DdsUtils.isSet(info.header.dwCaps2, DdsHeader.DDSCAPS2_CUBEMAP_NEGATIVEZ)) {
			depth++;
		}

		if (depth !== 6) {
			throw new Error('Cubemaps without all faces defined are not currently supported.');
		}

		image.depth = depth;
	} else {
		// make sure we have at least depth of 1.
		image.depth = (info.header.dwDepth > 0 ? info.header.dwDepth : 1);
	}
};

DdsLoader.readDXT = function (imgData, totalSize, info, texture) {
	texture.image.isCompressed = true;

	if (!info.flipVertically) {
		return new Uint8Array(imgData.buffer, imgData.byteOffset + 0, totalSize);
	}

	// NB: since UNPACK_FLIP_Y_WEBGL doesn't handle compressed textures, we have to do it manually.
	var mipWidth = info.header.dwWidth;
	var mipHeight = info.header.dwHeight;

	// flip!
	var rVal = new Uint8Array(totalSize);
	var offset = 0;
	for (var mip = 0; mip < info.header.dwMipMapCount; mip++) {
		var data = imgData.subarray(offset, offset + info.mipmapByteSizes[mip]);

		var flipped = DdsUtils.flipDXT(data, mipWidth, mipHeight, texture.format);
		rVal.set(flipped, offset);
		offset += flipped.length;

		mipWidth = ~~(mipWidth / 2) > 1 ? ~~(mipWidth / 2) : 1;
		mipHeight = ~~(mipHeight / 2) > 1 ? ~~(mipHeight / 2) : 1;
	}
	return rVal;
};

DdsLoader.readUncompressed = function (imgData, totalSize, useRgb, useLum, useAlpha, useAlphaPixels, info, texture) {
	var redLumShift = DdsUtils.shiftCount(info.header.ddpf.dwRBitMask);
	var greenShift = DdsUtils.shiftCount(info.header.ddpf.dwGBitMask);
	var blueShift = DdsUtils.shiftCount(info.header.ddpf.dwBBitMask);
	var alphaShift = DdsUtils.shiftCount(info.header.ddpf.dwABitMask);

	var sourcebytesPP = ~~(info.header.ddpf.dwRGBBitCount / 8);
	var targetBytesPP = DdsUtils.getComponents(texture.format) * 1; // 1 byte per unsignedbyte store

	var rVal = new Uint8Array(totalSize);

	var mipWidth = info.header.dwWidth;
	var mipHeight = info.header.dwHeight;
	var dstOffset = 0, srcOffset = 0;
	var i = 0;
	var b = [];
	for (i = 0; i < sourcebytesPP; i++) {
		b.push(0);
	}

	for (var mip = 0; mip < info.header.dwMipMapCount; mip++) {
		for (var y = 0; y < mipHeight; y++) {
			for (var x = 0; x < mipWidth; x++) {
				for (i = 0; i < sourcebytesPP; i++) {
					b[i] = imgData[srcOffset++];
				}

				i = DdsUtils.getIntFromBytes(b);

				var redLum = ((i & info.header.ddpf.dwRBitMask) >> redLumShift);
				var green = ((i & info.header.ddpf.dwGBitMask) >> greenShift);
				var blue = ((i & info.header.ddpf.dwBBitMask) >> blueShift);
				var alpha = ((i & info.header.ddpf.dwABitMask) >> alphaShift);

				// Uncompressed, so handled by UNPACK_FLIP_Y_WEBGL instead.
				// if (info.flipVertically) {
				// dstOffset = ((mipHeight - y - 1) * mipWidth + x) * targetBytesPP;
				// }

				if (useAlpha) {
					rVal[dstOffset++] = alpha;
				} else if (useLum) {
					rVal[dstOffset++] = redLum;
					if (useAlphaPixels) {
						rVal[dstOffset++] = alpha;
					}
				} else if (useRgb) {
					rVal[dstOffset++] = redLum;
					rVal[dstOffset++] = green;
					rVal[dstOffset++] = blue;
					if (useAlphaPixels) {
						rVal[dstOffset++] = alpha;
					}
				}
			}
		}

		dstOffset += mipWidth * mipHeight * targetBytesPP;

		mipWidth = ~~(mipWidth / 2) > 1 ? ~~(mipWidth / 2) : 1;
		mipHeight = ~~(mipHeight / 2) > 1 ? ~~(mipHeight / 2) : 1;
	}

	return rVal;
};

DdsLoader.populate = function (texture, info, data) {
	var flags = info.header.ddpf.dwFlags;

	var compressedFormat = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_FOURCC);
	var rgb = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_RGB);
	var alphaPixels = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_ALPHAPIXELS);
	var lum = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_LUMINANCE);
	var alpha = DdsUtils.isSet(flags, DdsPixelFormat.DDPF_ALPHA);
	texture.type = 'UnsignedByte';

	if (compressedFormat) {
		var fourCC = info.header.ddpf.dwFourCC;
		// DXT1 format
		if (fourCC === DdsUtils.getIntFromString('DXT1')) {
			info.bpp = 4;
			// if (isSet(flags, DdsPixelFormat.DDPF_ALPHAPIXELS)) {
			// XXX: many authoring tools do not set alphapixels, so we'll error on the side of alpha
//				console.info('DDS format: DXT1A');
			texture.format = 'PrecompressedDXT1A';
			// } else {
			// logger.finest('DDS format: DXT1');
			// texture.setDataFormat(ImageDataFormat.PrecompressedDXT1);
			// }
		}

		// DXT3 format
		else if (fourCC === DdsUtils.getIntFromString('DXT3')) {
//				console.info('DDS format: DXT3');
			info.bpp = 8;
			texture.format = 'PrecompressedDXT3';
		}

		// DXT5 format
		else if (fourCC === DdsUtils.getIntFromString('DXT5')) {
//				console.info('DDS format: DXT5');
			info.bpp = 8;
			texture.format = 'PrecompressedDXT5';
		}

		// DXT10 info present...
		else if (fourCC === DdsUtils.getIntFromString('DX10')) {
			// switch (info.headerDX10.dxgiFormat) {
			// case DXGI_FORMAT_BC4_UNORM:
			// console.info('DXGI format: BC4_UNORM');
			// info.bpp = 4;
			// texture.setDataFormat(ImageDataFormat.PrecompressedLATC_L);
			// break;
			// case DXGI_FORMAT_BC5_UNORM:
			// console.info('DXGI format: BC5_UNORM');
			// info.bpp = 8;
			// texture.setDataFormat(ImageDataFormat.PrecompressedLATC_LA);
			// break;
			// default:
			// throw new Error('dxgiFormat not supported: ' + info.headerDX10.dxgiFormat);
			// }
			throw new Error('dxt10 LATC formats not supported currently: ' + info.headerDX10.dxgiFormat);
		}

		// DXT2 format - unsupported
		else if (fourCC === DdsUtils.getIntFromString('DXT2')) {
			throw 'DXT2 is not supported.';
		}

		// DXT4 format - unsupported
		else if (fourCC === DdsUtils.getIntFromString('DXT4')) {
			throw 'DXT4 is not supported.';
		}

		// Unsupported compressed type.
		else {
			throw 'unsupported compressed dds format found (' + fourCC + ')';
		}
	}

	// not a compressed format
	else {
		// TODO: more use of bit masks?
		// TODO: Use bit size instead of hardcoded 8 bytes? (need to also implement in readUncompressed)

		info.bpp = info.header.ddpf.dwRGBBitCount;

		// One of the RGB formats?
		if (rgb) {
			if (alphaPixels) {
//					console.info('DDS format: uncompressed rgba');
				texture.format = 'RGBA';
			} else {
//					console.info('DDS format: uncompressed rgb ');
				texture.format = 'RGB';
			}
		}

		// A luminance or alpha format
		else if (lum || alphaPixels) {
			if (lum && alphaPixels) {
//					console.info('DDS format: uncompressed LumAlpha');
				texture.format = 'LuminanceAlpha';
			}

			else if (lum) {
//					console.info('DDS format: uncompressed Lum');
				texture.format = 'Luminance';
			}

			else if (alpha) {
//					console.info('DDS format: uncompressed Alpha');
				texture.format = 'Alpha';
			}
		} // end luminance/alpha type

		// Unsupported type.
		else {
			throw new Error('unsupported uncompressed dds format found.');
		}
	}

	info.calcMipmapSizes(compressedFormat);
	texture.image.mipmapSizes = (info.mipmapByteSizes);

	// Add up total byte size of single depth layer
	var totalSize = 0;
	for (var i = 0; i < info.mipmapByteSizes.length; i++) {
		totalSize += info.mipmapByteSizes[i];
	}

	// Go through and load in image data
	var imageData = [];
	for (var i = 0; i < texture.image.depth; i++) {
		// read in compressed data
		if (compressedFormat) {
			imageData.push(DdsLoader.readDXT(data, totalSize, info, texture));
		}

		// read in uncompressed data
		else if (rgb || lum || alpha) {
			imageData.push(DdsLoader.readUncompressed(data, totalSize, rgb, lum, alpha, alphaPixels, info, texture));
		}
	}

	// set on image
	texture.image.data = texture.image.depth === 1 ? imageData[0] : imageData;
	texture.image.useArrays = true;
};

DdsLoader.prototype.load = function (buffer, tex, flipped, arrayByteOffset, arrayByteLength) {
	var header = new Int32Array(buffer, arrayByteOffset + 0, 32);

	// Read and check magic word...
	var dwMagic = header[0];
	if (dwMagic !== DdsUtils.getIntFromString('DDS ')) {
		throw 'Not a dds file.';
	}
//		console.info('Reading DDS file.');

	// Create our data store;
	var info = new DdsImageInfo();

	info.flipVertically = flipped;

	// Read standard dds header
	info.header = DdsHeader.read(header);

	// if applicable, read DX10 header
	info.headerDX10 = info.header.ddpf.dwFourCC === DdsUtils.getIntFromString('DX10') ? DdsHeader.read(Int32Array.create(buffer,
		arrayByteOffset + 128, 5)) : null;

	// Create our new image
	var image = tex.image;
	if (typeof image === 'undefined' || image === null) {
		image = {};
		tex.image = image;
	}
	image.width = info.header.dwWidth;
	image.height = info.header.dwHeight;

	// update depth based on flags / header
	DdsLoader.updateDepth(image, info);

	// add our format and image data.
	var contentOffset = 128 + (info.headerDX10 ? 20 : 0);
	DdsLoader.populate(tex, info, new Uint8Array(buffer, arrayByteOffset + contentOffset, arrayByteLength - contentOffset));

	if (!info.mipmapByteSizes || info.mipmapByteSizes.length < 2) {
		tex.minFilter = 'BilinearNoMipMaps';
	}

	image.bpp = info.bpp;
	image.dataReady = true;
	image.isData = true;
	tex.needsUpdate = true;
};

DdsLoader.prototype.isSupported = function () {
	return !!Capabilities.CompressedTextureS3TC;
};

DdsLoader.prototype.toString = function () {
	return 'DdsLoader';
};

module.exports = DdsLoader;