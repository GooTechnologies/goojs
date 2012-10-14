define([ 'entities/systems/System' ], function(System) {
	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null, true);

		this.renderList = renderList;
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		renderer.clear();

		for (i in this.renderList) {
			var entity = this.renderList[i];
			this.renderEntity(renderer, entity);
		}

		renderer.flush();
	};

	RenderSystem.prototype.renderEntity = function(renderer, entity) {
		var shaderInfo = {
			meshData : entity.MeshDataComponent.meshData,
			transform : entity.TransformComponent.transform,
			materials : entity.MeshRendererComponent.materials
		};

		// bind our interleaved data
		renderer.bindData(shaderInfo.meshData.vertexData);

		for (i in shaderInfo.materials) {
			var material = shaderInfo.materials[i];

			if (material.shader == null) {
				return;
			}

			// for (final StateType type : StateType.values) {
			// renderer.applyState(type, material.getRenderState(type));
			// }

			shaderInfo.material = material;
			material.shader.apply(shaderInfo, renderer);

			var meshData = shaderInfo.meshData;
			if (meshData.getIndexBuffer() != null) {
				renderer.bindData(meshData.getIndexData());
				if (meshData.getIndexLengths() != null) {
					renderer.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), meshData
							.getIndexLengths());
				} else {
					renderer.drawElementsVBO(meshData.getIndexBuffer(), meshData.getIndexModes(), [ meshData
							.getIndexBuffer().length ]);
				}
			} else {
				if (meshData.getIndexLengths() != null) {
					renderer.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths());
				} else {
					renderer.drawArraysVBO(meshData.getIndexModes(), [ meshData.getVertexCount() ]);
				}
			}
		}
	};

	return RenderSystem;
});