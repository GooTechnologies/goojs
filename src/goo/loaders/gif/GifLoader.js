define(function () {
	"use strict";

	/**
	 * @name GifLoader
	 * @class The purpose of this class is to hold additional information regarding a typedarray buffer, like vbo 'usage' flags
	 * @param {ArrayBuffer} data Data to wrap
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function GifLoader() {
	}

	// Generic functions
	var bitsToNum = function (ba) {
		return ba.reduce(function (s, n) {
			return s * 2 + n;
		}, 0);
	};

	var byteToBitArr = function (bite) {
		var a = [];
		for (var i = 7; i >= 0; i--) {
			a.push(!!(bite & (1 << i)));
		}
		return a;
	};

	// Stream
	/**
	 * @constructor
	 */
	// Make compiler happy.
	var Stream = function (data) {
		this.data = data;
		this.len = this.data.length;
		this.pos = 0;

		this.readByte = function () {
			if (this.pos >= this.data.length) {
				throw new Error('Attempted to read past end of stream.');
			}
			return data.charCodeAt(this.pos++) & 0xFF;
		};

		this.readBytes = function (n) {
			var bytes = [];
			for (var i = 0; i < n; i++) {
				bytes.push(this.readByte());
			}
			return bytes;
		};

		this.read = function (n) {
			var s = '';
			for (var i = 0; i < n; i++) {
				s += String.fromCharCode(this.readByte());
			}
			return s;
		};

		this.readUnsigned = function () { // Little-endian.
			var a = this.readBytes(2);
			return (a[1] << 8) + a[0];
		};
	};

	var lzwDecode = function (minCodeSize, data) {
		// TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
		var pos = 0; // Maybe this streaming thing should be merged with the Stream?

		var readCode = function (size) {
			var code = 0;
			for (var i = 0; i < size; i++) {
				if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
					code |= 1 << i;
				}
				pos++;
			}
			return code;
		};

		var output = [];

		var clearCode = 1 << minCodeSize;
		var eoiCode = clearCode + 1;

		var codeSize = minCodeSize + 1;

		var dict = [];

		var clear = function () {
			dict = [];
			codeSize = minCodeSize + 1;
			for (var i = 0; i < clearCode; i++) {
				dict[i] = [i];
			}
			dict[clearCode] = [];
			dict[eoiCode] = null;

		};

		var code;
		var last;

		while (true) {
			last = code;
			code = readCode(codeSize);

			if (code === clearCode) {
				clear();
				continue;
			}
			if (code === eoiCode) {
				break;
			}

			if (code < dict.length) {
				if (last !== clearCode) {
					dict.push(dict[last].concat(dict[code][0]));
				}
			} else {
				if (code !== dict.length) {
					throw new Error('Invalid LZW code.');
				}
				dict.push(dict[last].concat(dict[last][0]));
			}
			output.push.apply(output, dict[code]);

			if (dict.length === (1 << codeSize) && codeSize < 12) {
				// If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
				codeSize++;
			}
		}

		// I don't know if this is technically an error, but some GIFs do it.
		// if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
		return output;
	};

	// The actual parsing; returns an object with properties.
	var parseGIF = function (st, handler) {
		handler || (handler = {});

		// LZW (GIF-specific)
		var parseCT = function (entries) { // Each entry is 3 bytes, for RGB.
			var ct = [];
			for (var i = 0; i < entries; i++) {
				ct.push(st.readBytes(3));
			}
			return ct;
		};

		var readSubBlocks = function () {
			var size, data;
			data = '';
			do {
				size = st.readByte();
				data += st.read(size);
			} while (size !== 0);
			return data;
		};

		var parseHeader = function () {
			var hdr = {};
			hdr.sig = st.read(3);
			hdr.ver = st.read(3);
			if (hdr.sig !== 'GIF') {
				throw new Error('Not a GIF file.'); // XXX: This should probably be handled more nicely.
			}

			hdr.width = st.readUnsigned();
			hdr.height = st.readUnsigned();

			var bits = byteToBitArr(st.readByte());
			hdr.gctFlag = bits.shift();
			hdr.colorRes = bitsToNum(bits.splice(0, 3));
			hdr.sorted = bits.shift();
			hdr.gctSize = bitsToNum(bits.splice(0, 3));

			hdr.bgColor = st.readByte();
			hdr.pixelAspectRatio = st.readByte(); // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64

			if (hdr.gctFlag) {
				hdr.gct = parseCT(1 << (hdr.gctSize + 1));
			}
			handler.hdr && handler.hdr(hdr);
		};

		var parseExt = function (block) {
			var parseGCExt = function (block) {
				var blockSize = st.readByte(); // Always 4

				var bits = byteToBitArr(st.readByte());
				block.reserved = bits.splice(0, 3); // Reserved; should be 000.
				block.disposalMethod = bitsToNum(bits.splice(0, 3));
				block.userInput = bits.shift();
				block.transparencyGiven = bits.shift();

				block.delayTime = st.readUnsigned();

				block.transparencyIndex = st.readByte();

				block.terminator = st.readByte();

				handler.gce && handler.gce(block);
			};

			var parseComExt = function (block) {
				block.comment = readSubBlocks();
				handler.com && handler.com(block);
			};

			var parsePTExt = function (block) {
				// No one *ever* uses this. If you use it, deal with parsing it yourself.
				var blockSize = st.readByte(); // Always 12
				block.ptHeader = st.readBytes(12);
				block.ptData = readSubBlocks();
				handler.pte && handler.pte(block);
			};

			var parseAppExt = function (block) {
				var parseNetscapeExt = function (block) {
					var blockSize = st.readByte(); // Always 3
					block.unknown = st.readByte(); // ??? Always 1? What is this?
					block.iterations = st.readUnsigned();
					block.terminator = st.readByte();
					handler.app && handler.app.NETSCAPE && handler.app.NETSCAPE(block);
				};

				var parseUnknownAppExt = function (block) {
					block.appData = readSubBlocks();
					// FIXME: This won't work if a handler wants to match on any identifier.
					handler.app && handler.app[block.identifier] && handler.app[block.identifier](block);
				};

				var blockSize = st.readByte(); // Always 11
				block.identifier = st.read(8);
				block.authCode = st.read(3);
				switch (block.identifier) {
					case 'NETSCAPE':
						parseNetscapeExt(block);
						break;
					default:
						parseUnknownAppExt(block);
						break;
				}
			};

			var parseUnknownExt = function (block) {
				block.data = readSubBlocks();
				handler.unknown && handler.unknown(block);
			};

			block.label = st.readByte();
			switch (block.label) {
				case 0xF9:
					block.extType = 'gce';
					parseGCExt(block);
					break;
				case 0xFE:
					block.extType = 'com';
					parseComExt(block);
					break;
				case 0x01:
					block.extType = 'pte';
					parsePTExt(block);
					break;
				case 0xFF:
					block.extType = 'app';
					parseAppExt(block);
					break;
				default:
					block.extType = 'unknown';
					parseUnknownExt(block);
					break;
			}
		};

		var parseImg = function (img) {
			var deinterlace = function (pixels, width) {
				// Of course this defeats the purpose of interlacing. And it's *probably*
				// the least efficient way it's ever been implemented. But nevertheless...

				var newPixels = new Array(pixels.length);
				var rows = pixels.length / width;
				var cpRow = function (toRow, fromRow) {
					var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
					newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
				};

				// See appendix E.
				var offsets = [0, 4, 2, 1];
				var steps = [8, 8, 4, 2];

				var fromRow = 0;
				for (var pass = 0; pass < 4; pass++) {
					for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
						cpRow(toRow, fromRow);
						fromRow++;
					}
				}

				return newPixels;
			};

			img.leftPos = st.readUnsigned();
			img.topPos = st.readUnsigned();
			img.width = st.readUnsigned();
			img.height = st.readUnsigned();

			var bits = byteToBitArr(st.readByte());
			img.lctFlag = bits.shift();
			img.interlaced = bits.shift();
			img.sorted = bits.shift();
			img.reserved = bits.splice(0, 2);
			img.lctSize = bitsToNum(bits.splice(0, 3));

			if (img.lctFlag) {
				img.lct = parseCT(1 << (img.lctSize + 1));
			}

			img.lzwMinCodeSize = st.readByte();

			var lzwData = readSubBlocks();

			img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData);

			if (img.interlaced) { // Move
				img.pixels = deinterlace(img.pixels, img.width);
			}

			handler.img && handler.img(img);
		};

		var parseBlock = function () {
			var block = {};
			block.sentinel = st.readByte();

			switch (String.fromCharCode(block.sentinel)) { // For ease of matching
				case '!':
					block.type = 'ext';
					parseExt(block);
					break;
				case ',':
					block.type = 'img';
					parseImg(block);
					break;
				case ';':
					block.type = 'eof';
					handler.eof && handler.eof(block);
					break;
				default:
					throw new Error('Unknown block: 0x' + block.sentinel.toString(16)); // TODO: Pad this with a 0.
			}

			if (block.type !== 'eof') {
				setTimeout(parseBlock, 0);
			}
		};

		var parse = function () {
			parseHeader();
			setTimeout(parseBlock, 0);
		};

		parse();
	};

	// BEGIN_NON_BOOKMARKLET_CODE
	if (typeof exports !== 'undefined') {
		exports.Stream = Stream;
		exports.parseGIF = parseGIF;
	}
	// END_NON_BOOKMARKLET_CODE

	return GifLoader;

	// TODO
	// -----------------------------------------------------------------------------
	// loadGif
	// -----------------------------------------------------------------------------
	function loadGif(img, onload) {
		console.log("loadGif: " + img);
		// Init
		var gif = {};
		gif.tex = [];
		gif.frame = 0;
		gif.loaded = false;
		gif.length = 1;
		gif.time = 0;
		gif.reset = function (time) {
			this.time = 0;
		};
		gif.setFps = function (fps) {
			this.length = this.tex.length / fps;
		};
		gif.setLength = function (length) {
			this.length = length;
		};
		gif.update = function (time) {
			var f = (time - this.time) % this.length;
			this.frame = Math.floor((f / this.length) * this.tex.length);
		};
		gif.getTexture = function () {
			return this.tex[this.frame];
		};

		// loadImage
		var canvas, ctx;
		var hdr;
		var tcanvas;

		// Do nothing
		var doNothing = function () {
		};

		// Do header
		var doHdr = function (_hdr) {
			hdr = _hdr;
		};

		var doGCE = function (gce) {
			canvas = document.createElement('canvas');
			canvas.width = hdr.width;
			canvas.height = hdr.height;
			ctx = canvas.getContext('2d');
		};

		// Do Image
		var doImg = function (img) {
			// Load pixels
			var ct = img.lctFlag ? img.lct : hdr.gct;
			var cData = ctx.getImageData(img.leftPos, img.topPos, img.width, img.height);
			img.pixels.forEach(function (pixel, i) {
				cData.data[i * 4 + 0] = ct[pixel][0];
				cData.data[i * 4 + 1] = ct[pixel][1];
				cData.data[i * 4 + 2] = ct[pixel][2];
				cData.data[i * 4 + 3] = 255;
			});
			ctx.putImageData(cData, img.leftPos, img.topPos);
			ctx.drawImage(canvas, 0, 0, img.width, img.height);

			// Create texture
			var texture = new Texture(canvas);
			texture.needsUpdate = true;
			gif.tex.push(texture);
		};

		var doEof = function (block) {
			gif.loaded = true;
			gif.reset(0);
			if (onload) {
				onload();
			}
		};

		// Gif Handler
		var gifHandler = {
			hdr : doHdr,
			gce : doGCE,
			com : doNothing,
			app : {
				NETSCAPE : doNothing
			},
			img : doImg,
			eof : doEof
		};

		var xhr = new XMLHttpRequest();
		xhr.open("GET", img, true);
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.onload = function (e) {
			var buffer = xhr.responseText;
			parseGIF(new Stream(buffer), gifHandler);
		};
		xhr.send(null);

		return gif;
	}

});