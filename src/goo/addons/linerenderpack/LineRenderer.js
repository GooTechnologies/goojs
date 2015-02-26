define([
		'goo/renderer/Material',
		'goo/renderer/MeshData',
		'goo/renderer/shaders/ShaderLib',
		'goo/math/Vector3'
	],
	function (Material,
			  MeshData,
			  ShaderLib) {
		'use strict';

		/**
		 * Used internally to render a batch of lines all with the same color
		 * @param {LineRenderSystem} lineRenderSystemOwner
		 * @param {Vector3} color
		 */
		function LineRenderer(lineRenderSystemOwner, color) {
			this.lineRenderSystemOwner = lineRenderSystemOwner;


			this._material = new Material(ShaderLib.simpleColored);
			this._material.uniforms.color = [color.x, color.y, color.z];

			this._meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), this.MAX_NUM_LINES * 2, 0);
			this._meshData.indexModes = ['Lines'];

			this._vertices = this._meshData.getAttributeBuffer(MeshData.POSITION);

			//create an empty entity used solely for running the simpleColored shader
			this._entity = this.lineRenderSystemOwner.world.createEntity(this._meshData, this._material).addToWorld();
			this._entity.meshRendererComponent.cullMode = 'Never';

			this._numRenderingLines = 0;
			this._meshData.vertexCount = 0;
		}

		LineRenderer.prototype.MAX_NUM_LINES = 170000;


		LineRenderer.prototype.update = function () {
			if (this._numRenderingLines !== 0 || this._meshData.vertexCount !== 0) {
				this._meshData.vertexCount = Math.min(this._numRenderingLines, this.MAX_NUM_LINES) * 2;
				this._meshData.setVertexDataUpdated();
			}
			this._numRenderingLines = 0;
		};

		LineRenderer.prototype.remove = function () {
			this._entity.removeFromWorld();

			this._meshData.destroy(this.lineRenderSystemOwner.world.gooRunner.renderer.context);
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