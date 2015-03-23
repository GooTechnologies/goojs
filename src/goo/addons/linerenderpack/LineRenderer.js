define([
		'goo/renderer/Material',
		'goo/renderer/MeshData',
		'goo/renderer/shaders/ShaderLib',
		'goo/renderer/Shader',
		'goo/math/Transform'
	],
	function (Material,
			  MeshData,
			  ShaderLib,
			  Shader,
			  Transform) {
		'use strict';

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

		LineRenderer.MAX_NUM_LINES = 32768;

		/**
		 * Used internally to update the vertexData in meshData
		 */
		LineRenderer.prototype._updateVertexData = function () {
			if (this._numRenderingLines !== 0 || this._meshData.vertexCount !== 0) {
				this._meshData.vertexCount = Math.min(this._numRenderingLines, LineRenderer.MAX_NUM_LINES) * 2;
				this._meshData.setVertexDataUpdated();
			}
		};

		/**
		 * Used internally to clear the rendering line counter
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
				return;
			}

			for (var i = 0; i < 3; i++) {
				var vertexIndex = this._numRenderingLines * 6;

				var firstVertexDataIndex = vertexIndex + i;
				var secondVertexDataIndex = vertexIndex + 3 + i;

				this._positions[firstVertexDataIndex] = start.data[i];
				this._positions[secondVertexDataIndex] = end.data[i];

				this._colors[firstVertexDataIndex] = color.data[i];
				this._colors[secondVertexDataIndex] = color.data[i];
			}

			this._numRenderingLines++;
		};

		return LineRenderer;
	});