define([
		'goo/renderer/Material',
		'goo/renderer/MeshData',
		'goo/renderer/shaders/ShaderLib',
		'goo/math/Transform'
	],
	function (Material,
			  MeshData,
			  ShaderLib,
			  Transform) {
		'use strict';

		/**
		 * Used internally to render a batch of lines all with the same color.
		 * @param {World} world The world lines are rendered in.
		 * @param {Vector3} color
		 */
		function LineRenderer(world, color) {
			this.world = world;


			this._material = new Material(ShaderLib.simpleColored);
			this._material.uniforms.color = [color.x, color.y, color.z];

			this._meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), this.MAX_NUM_LINES * 2, 0);
			this._meshData.indexModes = ['Lines'];

			this._vertices = this._meshData.getAttributeBuffer(MeshData.POSITION);

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

		LineRenderer.prototype.MAX_NUM_LINES = 20000;

		/**
		 * Used internally to update the vertexData in meshData
		 */
		LineRenderer.prototype._updateVertexData = function () {
			if (this._numRenderingLines !== 0 || this._meshData.vertexCount !== 0) {
				this._meshData.vertexCount = Math.min(this._numRenderingLines, this.MAX_NUM_LINES) * 2;
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
		 */
		LineRenderer.prototype._addLine = function (start, end) {
			//no need to continue if we already reached MAX_NUM_LINES
			if (this._numRenderingLines >= this.MAX_NUM_LINES) {
				return;
			}

			for (var i = 0; i < 3; i++) {
				this._vertices[this._numRenderingLines * 6 + i] = start.data[i];
				this._vertices[this._numRenderingLines * 6 + 3 + i] = end.data[i];
			}

			this._numRenderingLines++;
		};

		return LineRenderer;
	});