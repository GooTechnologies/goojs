define(function() {
	"use strict";

	function RendererRecord() {
		this.currentBuffer = {
			'ArrayBuffer' : {
				buffer : null,
				valid : false
			},
			'ElementArrayBuffer' : {
				buffer : null,
				valid : false
			}
		};
		this.clippingTestValid = false;
		this.clippingTestEnabled = false;
		this.clips = [];
		this.enabledTextures = 0;
		this.texturesValid = false;
		this.currentTextureArraysUnit = 0;

		this.textureRecord = [];

		this.usedProgram = null;
		this.boundAttributes = [];

		this.cullRecord = {};
	}

	RendererRecord.prototype.invalidateBuffer = function(target) {
		this.currentBuffer.buffer = null;
		this.currentBuffer.valid = false;
	};

	return RendererRecord;
});