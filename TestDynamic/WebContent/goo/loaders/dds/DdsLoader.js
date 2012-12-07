define(['goo/loaders/dds/DdsUtils'], function(DdsUtils) {
	"use strict";

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

	DdsPixelFormat.read = function(data) { // Int32Array
		var format = new DdsPixelFormat();
		format.dwSize = data[DdsPixelFormat.HEADER_OFFSET + 0];
		if (format.dwSize != 32) {
			throw ("invalid pixel format size: " + format.dwSize);
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

	DdsHeader.read = function(data) { // Int32Array
		var header = new DdsHeader();
		header.dwSize = data[1];
		if (header.dwSize != 124) {
			throw ("invalid dds header size: " + header.dwSize);
		}
		header.dwFlags = data[2];
		header.dwHeight = data[3];
		header.dwWidth = data[4];
		header.dwLinearSize = data[5];
		header.dwDepth = data[6];
		header.dwMipMapCount = data[7];
		header.dwAlphaBitDepth = data[8];
		for ( var i = 0; i < header.dwReserved1.length; i++) {
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
			} else if (header.dwMipMapCount != expectedMipmaps) {
				console.warn("Got " + header.dwMipMapCount + " mipmaps, expected " + expectedMipmaps);
			}
		} else {
			header.dwMipMapCount = 1;
		}

		return header;
	};

	/**
	 * @name DdsLoader
	 * @class Loads dds format images into a format usable by Goo.
	 */
	function DdsLoader() {
	}

	DdsLoader.prototype.load = function(buffer, tex, flipped, arrayByteOffset, arrayByteLength) {
		var header = new Int32Array(buffer, arrayByteOffset + 0, 32);

		// Read and check magic word...
		var dwMagic = header.get(0);
		if (dwMagic != DdsUtils.getInt("DDS ")) {
			throw "Not a dds file.";
		}
		console.info("Reading DDS file.");

		// Create our data store;
		var info = new DdsImageInfo();

		info.flipVertically = flipped;

		// Read standard dds header
		info.header = DdsHeader.read(header);

		// if applicable, read DX10 header
		info.headerDX10 = info.header.ddpf.dwFourCC == DdsUtils.getInt("DX10") ? DdsHeaderDX10.read(Int32Array.create(buffer, arrayByteOffset + 128,
			5)) : null;

		// Create our new image
		var image = tex.getImageData();
		if (image == null) {
			image = new ImageData();
		}
		image.setWidth(info.header.dwWidth);
		image.setHeight(info.header.dwHeight);

		// update depth based on flags / header
		DdsLoader.updateDepth(image, info);

		// add our format and image data.
		var contentOffset = 128 + (info.headerDX10 != null ? 20 : 0);
		var texFormat = DdsLoader.populateImage(image, info, Uint8Array.create(buffer, arrayByteOffset + contentOffset, arrayByteLength
			- contentOffset));

		// convert to Texture
		tex.setDataType(ImageDataType.UnsignedByte);
		tex.setImageData(image);
		tex.setTextureStoreFormat(texFormat);

		image.setDataReady(true);
		tex.getTextureKey().setDirty(true);
		tex.fireTextureLoaded();
	};

	DdsLoader.SUPPORTS_DDS = true;

	DdsLoader.prototype.isSupported = function() {
		return DdsLoader.SUPPORTS_DDS;
	};

	DdsLoader.prototype.toString = function() {
		return "DdsLoader";
	};

	return DdsLoader;
});