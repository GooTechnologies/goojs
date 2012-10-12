define([ 'entities/systems/System' ], function(System) {
	function RenderSystem(renderList) {
		System.call(this, 'RenderSystem', null, true);

		this.renderList = renderList;
	}

	RenderSystem.prototype = Object.create(System.prototype);

	RenderSystem.prototype.render = function(renderer) {
		for (i in renderList) {
			var entity = renderList[i];
			this.renderEntity(renderer, entity);
		}
	};

	RenderSystem.prototype.renderEntity = function(renderer, entity) {
		var shaderInfo = {
			meshData : entity.MeshDataComponent.meshData,
			transform : entity.TransformComponent.transform,
			materials : entity.MeshRendererComponent.materials
		};

		for (i in shaderInfo.materials) {
			var material = shaderInfo.materials[i];

			material.applyShader(shaderInfo, renderer);

			if (meshData.getIndices() != null) {
				renderer.bindData(meshData.getIndexData());
				if (meshData.getIndexLengths() != null) {
					renderer.drawElementsVBO(meshData.getIndices(), meshData.getIndexModes(), meshData
							.getIndexLengths());
				} else {
					renderer.drawElementsVBO(meshData.getIndices(), meshData.getIndexModes(), meshData.getIndices()
							.limit());
				}
			} else {
				if (meshData.getIndexLengths() != null) {
					renderer.drawArraysVBO(meshData.getIndexModes(), meshData.getIndexLengths());
				} else {
					renderer.drawArraysVBO(meshData.getIndexModes(), meshData.getVertexCount());
				}
			}

		}

	};

	return RenderSystem;
});