define(

function () {
	'use strict';

	/**
	 * Holds the renderer's state
	 * @hidden
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

		this.textureRecord = [];

		this.usedProgram = null;
		this.enabledAttributes = [];
		this.newlyEnabledAttributes = [];

		this.depthRecord = {}; // these can be initialized with their default values
		this.cullRecord = {};
		this.blendRecord = {};
		this.offsetRecord = {};
		this.lineRecord = {};

		this.shaderCache = new Map();
		this.attributeCache = [];

		// #ifdef DEBUG
		Object.seal(this);
		// #endif
	}

	RendererRecord.prototype.invalidateBuffer = function (target) {
		this.currentBuffer[target].buffer = null;
		this.currentBuffer[target].valid = false;
	};

	return RendererRecord;
});