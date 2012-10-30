define(function() {
	"use strict";

	/**
	 * Creates a new RenderTarget object
	 * 
	 * @name RenderTarget
	 * @class Post processing handler
	 * @param {Number} width Width of rendertarget
	 * @param {Number} height Height of rendertarget
	 * @param {Parameters} parameters Settings
	 */
	function RenderTarget(width, height, parameters) {
		this._glTexture = null;
	}

	RenderTarget.prototype.addPass = function(pass) {
		this.passes.push(pass);
	};

	return RenderTarget;
});