define([
		'goo/entities/systems/System',
		'goo/entities/SystemBus',
		'goo/addons/linerenderpack/LineRenderer',
		'goo/math/Vector3'
	],
	function (System,
			  SystemBus,
			  LineRenderer,
			  Vector3) {
		'use strict';

		/**
		 * Updates all of it's LineRenderers and exposes methods for drawing primitive line shapes.
		 * @param {World} world the world this system exists in.
		 */
		function LineRenderSystem(world) {
			System.call(this, 'LineRenderSystem', []);

			//an associative array for the LineRenderers
			this._lineRenderers = {};
			this._lineRendererKeys = [];

			this.world = world;
			this.camera = null;

			/**
			 *A managed array of all the LineRenderers render objects.
			 * @type {Object[]}
			 * */
			this.renderList = [];


			//add the camera
			SystemBus.addListener('goo.setCurrentCamera', function (newCam) {
				this.camera = newCam.camera;
			}.bind(this));
		}

		LineRenderSystem.prototype = Object.create(System.prototype);
		LineRenderSystem.prototype.constructor = LineRenderSystem;

		var tmpVec1 = new Vector3();
		var tmpVec2 = new Vector3();
		var tmpVec3 = new Vector3();

		//setup a preset of colors
		LineRenderSystem.prototype.WHITE = new Vector3(1, 1, 1);
		LineRenderSystem.prototype.RED = new Vector3(1, 0, 0);
		LineRenderSystem.prototype.GREEN = new Vector3(0, 1, 0);
		LineRenderSystem.prototype.BLUE = new Vector3(0, 0, 1);
		LineRenderSystem.prototype.AQUA = new Vector3(0, 0.5, 0.5);
		LineRenderSystem.prototype.MAGENTA = new Vector3(1, 0, 1);
		LineRenderSystem.prototype.YELLOW = new Vector3(1, 1, 0);
		LineRenderSystem.prototype.BLACK = new Vector3(0, 0, 0);


		/**
		 * Encodes a {@link Vector3} color to a number.
		 * Assumes that the color components are between 0-1.
		 * @param {Vector3} color
		 * @returns {number} The encoded color.
		 * @example
		 * var encodedColorRed = lineRenderSystem.encodeColor(lineRenderSystem.RED);
		 * console.log(encodedColorRed); // would output: 16777216
		 */
		LineRenderSystem.prototype.encodeColor = function (color) {
			var r = Math.floor(color.r * 255);
			var g = Math.floor(color.g * 255);
			var b = Math.floor(color.b * 255);

			return r * 65536 + g * 256 + b;
		};

		/**
		 * Draws a line between two {@link Vector3}'s with the specified color.
		 * @param {Vector3} start
		 * @param {Vector3} end
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @example
		 * var vector1 = new Vector3(0,0,0);
		 * var vector2 = new Vector3(13,3,7);
		 * var redColor = lineRenderSystem.RED;
		 * lineRenderSystem.drawLine(v1, v2, redColor);
		 */
		LineRenderSystem.prototype.drawLine = function (start, end, color) {

			var encodedColor = this.encodeColor(color);

			var lineRenderer = this._lineRenderers[encodedColor];
			if (!lineRenderer) {
				lineRenderer = this._lineRenderers[encodedColor] = new LineRenderer(this.world, color);
				this._lineRendererKeys = Object.keys(this._lineRenderers);
			}
			lineRenderer._addLine(start, end);
		};

		/**
		 * Used internally to calculate the line segments in an axis aligned box, and render them.
		 * @param {Vector3} start
		 * @param {Vector3} startEndDelta
		 * @param {number} startDataIndex
		 * @param {number} endDataIndex
		 * @param {number} startPolarity
		 * @param {number} endPolarity
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {Matrix4x4} transformMatrix
		 */
		LineRenderSystem.prototype._drawAxisLine = function (start, startEndDelta, startDataIndex, endDataIndex, startPolarity, endPolarity, color, transformMatrix) {
			var lineStart = tmpVec2.setVector(start);
			lineStart.data[startDataIndex] += startEndDelta.data[startDataIndex] * startPolarity;

			var lineEnd = tmpVec3.setVector(lineStart);
			lineEnd.data[endDataIndex] += startEndDelta.data[endDataIndex] * endPolarity;

			if (transformMatrix !== undefined) {
				transformMatrix.applyPostPoint(lineStart);
				transformMatrix.applyPostPoint(lineEnd);
			}

			this.drawLine(lineStart, lineEnd, color);
		};

		/**
		 * Draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix.
		 * @param {Vector3} min
		 * @param {Vector3} max
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {Matrix4x4} [transformMatrix]
		 */
		LineRenderSystem.prototype.drawAABox = function (min, max, color, transformMatrix) {
			var diff = tmpVec1.setVector(max).subVector(min);

			for (var a = 0; a < 3; a++) {

				for (var b = 0; b < 3; b++) {
					if (b !== a) {
						this._drawAxisLine(min, diff, a, b, 1, 1, color, transformMatrix);
					}
				}

				this._drawAxisLine(max, diff, a, a, -1, 1, color, transformMatrix);
				this._drawAxisLine(min, diff, a, a, 1, -1, color, transformMatrix);
			}
		};

		/**
		 * Draws a cross at a position with the given color and size.
		 * @param {Vector3} position
		 * @param {Vector3} color A vector with its components between 0-1.
		 * @param {number} [size=0.05]
		 */
		LineRenderSystem.prototype.drawCross = function (position, color, size) {

			size = size || 0.05;

			var start = tmpVec1.setVector(position).addDirect(-size, 0.0, -size);
			var end = tmpVec2.setVector(position).addDirect(size, 0.0, size);
			this.drawLine(start, end, color);

			start = tmpVec1.setVector(position).addDirect(size, 0.0, -size);
			end = tmpVec2.setVector(position).addDirect(-size, 0.0, size);
			this.drawLine(start, end, color);

			start = tmpVec1.setVector(position).addDirect(0, -size, 0.0);
			end = tmpVec2.setVector(position).addDirect(0.0, size, 0.0);
			this.drawLine(start, end, color);
		};

		LineRenderSystem.prototype.render = function (renderer) {
			for (var i = 0; i < this._lineRendererKeys.length; i++) {
				var lineRenderer = this._lineRenderers[this._lineRendererKeys[i]];
				lineRenderer._updateVertexData();
				lineRenderer._manageRenderList(this.renderList);
				lineRenderer._clear();
			}

			renderer.checkResize(this.camera);

			if (this.camera) {
				renderer.render(this.renderList, this.camera, null, null, false);
			}
		};

		LineRenderSystem.prototype.clear = function () {
			for (var i = 0; i < this._lineRendererKeys.length; i++) {
				var lineRenderer = this._lineRenderers[this._lineRendererKeys[i]];
				lineRenderer._remove();
			}
			delete this._lineRenderers;

			this.world.gooRunner.renderer.clearShaderCache();
		};

		return LineRenderSystem;
	});