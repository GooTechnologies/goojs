define(['goo/renderer/Renderer', 'goo/renderer/Camera', 'goo/renderer/TextureCreator', 'goo/renderer/Material', 'goo/renderer/pass/FullscreenUtil',
		'goo/renderer/Texture'], function(Renderer, Camera, TextureCreator, Material, FullscreenUtil, Texture) {
	"use strict";

	function NesPass() {
		this.material = Material.createMaterial(nesShader);

		this.renderToScreen = false;

		this.renderable = {
			meshData : FullscreenUtil.quad,
			materials : [this.material],
		};

		// this.palette = new TextureCreator().loadTexture2D('resources/Palette_NTSC_small.png');
		// this.palette.magFilter = 'NearestNeighbor';
		// this.palette.generateMipmaps = false;

		function findNearestIndex(r, g, b) {
			var minDist = 1000000;
			var bestIndex = 0;
			for ( var i = 0; i < nesPalette.length; i += 3) {
				var rP = nesPalette[i + 0];
				var gP = nesPalette[i + 1];
				var bP = nesPalette[i + 2];
				var distance = Math.sqrt((r - rP) * (r - rP) + (g - gP) * (g - gP) + (b - bP) * (b - bP));

				if (distance < minDist) {
					minDist = distance;
					bestIndex = i;
				}
			}
			return bestIndex;
		}

		var colorInfo = [];
		for ( var r = 0; r < 8; r++) {
			for ( var g = 0; g < 8; g++) {
				for ( var b = 0; b < 8; b++) {
					var rgbIndex = r * 8 * 8 + g * 8 + b;
					var index = findNearestIndex(r * 36.4, g * 36.4, b * 36.4);
					colorInfo[rgbIndex * 3 + 0] = nesPalette[index + 0];
					colorInfo[rgbIndex * 3 + 1] = nesPalette[index + 1];
					colorInfo[rgbIndex * 3 + 2] = nesPalette[index + 2];
				}
			}
		}
		this.mapping = new Texture(new Uint8Array(colorInfo), {
			generateMipmaps : false,
			format : 'RGB'
		}, 512, 1);

		this.enabled = true;
		this.clear = false;
		this.needsSwap = true;
	}

	NesPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {
		this.material.textures[0] = readBuffer;
		this.material.textures[1] = this.mapping;

		if (this.renderToScreen) {
			renderer.render(this.renderable, FullscreenUtil.camera, [], null, this.clear);
		} else {
			renderer.render(this.renderable, FullscreenUtil.camera, [], writeBuffer, this.clear);
		}
	};

	var nesShader = {
		bindings : {
			"diffuse" : {
				type : "int",
				value : 0
			},
			"mapping" : {
				type : "int",
				value : 1
			},
		},
		vshader : Material.shaders.copy.vshader,
		fshader : [//
		"precision mediump float;",//

		"uniform sampler2D diffuse;",//
		"uniform sampler2D mapping;",//

		"varying vec2 texCoord0;",//

		"void main() {",//
		"	vec4 texCol = texture2D( diffuse, texCoord0 );",//

		" float r = floor(texCol.r * 7.0);",//
		" float g = floor(texCol.g * 7.0);",//
		" float b = floor(texCol.b * 7.0);",//
		" float index = r * 8.0 * 8.0 + g * 8.0 + b;",//
		" vec4 texPalette = texture2D( mapping, vec2(index / 512.0, 0.0) );",//

		" gl_FragColor = vec4( texPalette.rgb, 1.0 );",//
		"}"].join('\n')
	};

	var nesPalette = [124, 124, 124, 0, 0, 252, 0, 0, 188, 68, 40, 188, 148, 0, 132, 168, 0, 32, 168, 16, 0, 136, 20, 0, 80, 48, 0, 0, 120, 0, 0,
			104, 0, 0, 88, 0, 0, 64, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0, 188, 188, 188, 0, 120, 248, 0, 88, 248, 104, 68, 252, 216, 0, 204, 228, 0, 88,
			248, 56, 0, 228, 92, 16, 172, 124, 0, 0, 184, 0, 0, 168, 0, 0, 168, 68, 0, 136, 136, 0, 0, 0, 0, 0, 0, 0, 0, 0, 248, 248, 248, 60, 188,
			252, 104, 136, 252, 152, 120, 248, 248, 120, 248, 248, 88, 152, 248, 120, 88, 252, 160, 68, 248, 184, 0, 184, 248, 24, 88, 216, 84, 88,
			248, 152, 0, 232, 216, 120, 120, 120, 0, 0, 0, 0, 0, 0, 252, 252, 252, 164, 228, 252, 184, 184, 248, 216, 184, 248, 248, 184, 248, 248,
			164, 192, 240, 208, 176, 252, 224, 168, 248, 216, 120, 216, 248, 120, 184, 248, 184, 184, 248, 216, 0, 252, 252, 248, 216, 248, 0, 0, 0,
			0, 0, 0];

	return NesPass;
});