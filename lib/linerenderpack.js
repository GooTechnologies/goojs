/* Goo Engine UNOFFICIAL
 * Copyright 2016 Goo Technologies AB
 */

webpackJsonp([10],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(382);


/***/ },

/***/ 382:
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
		LineRenderer: __webpack_require__(383),
		LineRenderSystem: __webpack_require__(384)
	};

	if (typeof(window) !== 'undefined') {
		for (var key in module.exports) {
			window.goo[key] = module.exports[key];
		}
	}

/***/ },

/***/ 383:
/***/ function(module, exports, __webpack_require__) {

	var Material = __webpack_require__(30);
	var MeshData = __webpack_require__(14);
	var Shader = __webpack_require__(31);
	var Transform = __webpack_require__(41);

	/**
	 * Used internally to render a batch of lines all with the same color.
	 * @param {World} world The world lines are rendered in.
	 */
	function LineRenderer(world) {
		this.world = world;

		this._material = new Material(LineRenderer.COLORED_LINE_SHADER);

		this._meshData = new MeshData(LineRenderer.ATTRIBUTE_MAP, LineRenderer.MAX_NUM_LINES * 2);
		this._meshData.indexModes = ['Lines'];

		this._positions = this._meshData.getAttributeBuffer('POSITION');
		this._colors = this._meshData.getAttributeBuffer('RGB_COLOR');

		this._renderObject = {
			meshData: this._meshData,
			transform: new Transform(),
			materials: [this._material]
		};

		this._rendering = false;

		this._numRenderingLines = 0;
		this._meshData.vertexCount = 0;

		this._meshData.vertexData.setDataUsage('DynamicDraw');
	}

	LineRenderer.ATTRIBUTE_MAP = {
		POSITION: MeshData.createAttribute(3, 'Float'),
		RGB_COLOR: MeshData.createAttribute(3, 'Float')
	};

	LineRenderer.COLORED_LINE_SHADER = {
		attributes: {
			vertexPosition: 'POSITION',
			vertexColor: 'RGB_COLOR'
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec3 vertexColor;',

			'uniform mat4 viewProjectionMatrix;',

			'varying vec3 color;',

			'void main(void) {',
			'gl_Position = viewProjectionMatrix * vec4(vertexPosition, 1.0);',
			'color = vertexColor;',
			'}'
		].join('\n'),
		fshader: [
			'varying vec3 color;',

			'void main(void)',
			'{',
			'gl_FragColor = vec4(color, 1.0);',
			'}'
		].join('\n')
	};

	LineRenderer.MAX_NUM_LINES = 65536;

	/**
	 * Used internally to update the vertexData in meshData.
	 */
	LineRenderer.prototype._updateVertexData = function () {
		if (this._numRenderingLines !== 0 || this._meshData.vertexCount !== 0) {
			this._meshData.vertexCount = Math.min(this._numRenderingLines, LineRenderer.MAX_NUM_LINES) * 2;

			this._meshData.setAttributeDataUpdated('POSITION');
			this._meshData.setAttributeDataUpdated('RGB_COLOR');
		}
	};

	/**
	 * Used internally to clear the rendering line counter.
	 */
	LineRenderer.prototype._clear = function () {
		this._numRenderingLines = 0;
	};

	/**
	 * Used internally to push or remove itself from the renderList.
	 * @param {Object[]} renderList An array of all the renderObjects to send to the Renderer.
	 */
	LineRenderer.prototype._manageRenderList = function (renderList) {
		if (!this._rendering && this._numRenderingLines !== 0) {
			renderList.push(this._renderObject);
			this._rendering = true;
		}
		else if (this._rendering && this._numRenderingLines === 0) {
			renderList.splice(renderList.indexOf(this._renderObject), 1);
			this._rendering = false;
		}
	};

	/**
	 * Used internally to remove itself.
	 */
	LineRenderer.prototype._remove = function () {
		this._meshData.destroy(this.world.gooRunner.renderer.context);
	};

	/**
	 * Used internally to add a line to the LineRenderer to be rendered next frame.
	 * @param {Vector3} start
	 * @param {Vector3} end
	 * @param {Vector3} color
	 */
	LineRenderer.prototype._addLine = function (start, end, color) {
		//We can not continue if there is no more space in the buffers.
		if (this._numRenderingLines >= LineRenderer.MAX_NUM_LINES) {
			console.warn('MAX_NUM_LINES has been exceeded in the LineRenderer.');
			return;
		}

		var vertexIndex = this._numRenderingLines * 6;

		for (var i = 0; i < 3; i++) {
			var firstVertexDataIndex = vertexIndex + i;
			var secondVertexDataIndex = vertexIndex + 3 + i;

			this._positions[firstVertexDataIndex] = start.getComponent(i);
			this._positions[secondVertexDataIndex] = end.getComponent(i);

			this._colors[firstVertexDataIndex] = color.getComponent(i);
			this._colors[secondVertexDataIndex] = color.getComponent(i);
		}

		this._numRenderingLines++;
	};

	module.exports = LineRenderer;


/***/ },

/***/ 384:
/***/ function(module, exports, __webpack_require__) {

	var System = __webpack_require__(42);
	var SystemBus = __webpack_require__(44);
	var LineRenderer = __webpack_require__(383);
	var Vector3 = __webpack_require__(8);

	/**
	 * Updates all of it's LineRenderers and exposes methods for drawing primitive line shapes.
	 * @param {World} world the world this system exists in.
	 */
	function LineRenderSystem(world) {
		System.call(this, 'LineRenderSystem', []);

		this._lineRenderers = [];

		this.world = world;

		//adds a new LineRenderer to the list
		this._lineRenderers.push(new LineRenderer(this.world));

		this.camera = null;

		/**
		 * A managed array of all the LineRenderers render objects.
		 * @type {Object}
		 */
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

	LineRenderSystem.axis = ['x', 'y', 'z'];

	//setup a preset of colors
	LineRenderSystem.prototype.WHITE = new Vector3(1, 1, 1);
	LineRenderSystem.prototype.RED = new Vector3(1, 0, 0);
	LineRenderSystem.prototype.GREEN = new Vector3(0, 1, 0);
	LineRenderSystem.prototype.BLUE = new Vector3(0, 0, 1);
	LineRenderSystem.prototype.AQUA = new Vector3(0, 1, 1);
	LineRenderSystem.prototype.MAGENTA = new Vector3(1, 0, 1);
	LineRenderSystem.prototype.YELLOW = new Vector3(1, 1, 0);
	LineRenderSystem.prototype.BLACK = new Vector3(0, 0, 0);

	/**
	 * Draws a line between two {@link Vector3}'s with the specified color.
	 * @param {Vector3} start
	 * @param {Vector3} end
	 * @param {Vector3} color A vector with its components between 0-1.
	 * @example
	 * var vector1 = new Vector3(0, 0, 0);
	 * var vector2 = new Vector3(13, 3, 7);
	 * var redColor = lineRenderSystem.RED;
	 * lineRenderSystem.drawLine(v1, v2, redColor);
	 */
	LineRenderSystem.prototype.drawLine = function (start, end, color) {
		var lineRenderer = this._lineRenderers[0];

		lineRenderer._addLine(start, end, color);
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
	 * @param {Matrix4} transformMatrix
	 */
	LineRenderSystem.prototype._drawAxisLine = function (start, startEndDelta, startDataIndex, endDataIndex, startPolarity, endPolarity, color, transformMatrix) {
		var startAxis = LineRenderSystem.axis[startDataIndex];
		var endAxis = LineRenderSystem.axis[endDataIndex];

		var lineStart = tmpVec2.set(start);
		lineStart[startAxis] += startEndDelta[startAxis] * startPolarity;

		var lineEnd = tmpVec3.set(lineStart);
		lineEnd[endAxis] += startEndDelta[endAxis] * endPolarity;

		if (transformMatrix !== undefined) {
			lineStart.applyPostPoint(transformMatrix);
			lineEnd.applyPostPoint(transformMatrix);
		}

		this.drawLine(lineStart, lineEnd, color);
	};

	/**
	 * Draws an axis aligned box between the min and max points, can be transformed to a specific space using the matrix.
	 * @param {Vector3} min
	 * @param {Vector3} max
	 * @param {Vector3} color A vector with its components between 0-1.
	 * @param {Matrix4} [transformMatrix]
	 */
	LineRenderSystem.prototype.drawAABox = function (min, max, color, transformMatrix) {
		var diff = tmpVec1.set(max).sub(min);

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

		var start = tmpVec1.set(position).addDirect(-size, 0, -size);
		var end = tmpVec2.set(position).addDirect(size, 0, size);
		this.drawLine(start, end, color);

		start = tmpVec1.set(position).addDirect(size, 0, -size);
		end = tmpVec2.set(position).addDirect(-size, 0, size);
		this.drawLine(start, end, color);

		start = tmpVec1.set(position).addDirect(0, -size, 0);
		end = tmpVec2.set(position).addDirect(0, size, 0);
		this.drawLine(start, end, color);
	};

	LineRenderSystem.prototype.render = function (renderer) {
		for (var i = 0; i < this._lineRenderers.length; i++) {
			var lineRenderer = this._lineRenderers[i];
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
		for (var i = 0; i < this._lineRenderers.length; i++) {
			var lineRenderer = this._lineRenderers[i];
			lineRenderer._remove();
		}
		delete this._lineRenderers;

		this.world.gooRunner.renderer.clearShaderCache();
	};

	module.exports = LineRenderSystem;


/***/ }

});
