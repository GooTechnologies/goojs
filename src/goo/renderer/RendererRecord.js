define(
/** @lends */
function() {
	'use strict';

	/**
	 * @constructor
	 */
	function RendererRecord() {
		this.currentBuffer = {
			'ArrayBuffer': {
				buffer: null,
				valid: false
			},
			'ElementArrayBuffer': {
				buffer: null,
				valid: false
			}
		};
		this.currentFrameBuffer = null;
		this.clippingTestValid = false;
		this.clippingTestEnabled = false;
		this.clips = [];
		this.enabledTextures = 0;
		this.texturesValid = false;
		this.currentTextureArraysUnit = 0;

		this.textureRecord = [];

		this.usedProgram = null;
		this.boundAttributes = [];
		this.enabledAttributes = [];
		this.newlyEnabledAttributes = [];

		this.depthRecord = {};
		this.cullRecord = {};
		this.blendRecord = {};
		this.offsetRecord = {};
		this.lineRecord = {};
		this.pointRecord = {};

		this.shaderCache = {};
		this.attributeCache = [];
	}

	RendererRecord.prototype.invalidateBuffer = function (target) {
		this.currentBuffer[target].buffer = null;
		this.currentBuffer[target].valid = false;
	};

	return RendererRecord;
});