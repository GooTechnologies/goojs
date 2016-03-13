var Component = require('../entities/components/Component');



	/**
	 * This component contains the triangle mesh which forms an occluder shape for the
	 * entity which this component is attached to. The occluder geometry is used for rendering
	 * a depth buffer during occlusion culling.
	 * @param {MeshData} meshData The triangle occluder geometry.
	 * @property {string} type The type string. Same as the class name.
	 * @property {MeshData} meshData The triangle occluder geometry.
	 */
	function OccluderComponent(meshData) {
		Component.apply(this, arguments);

		this.type = 'OccluderComponent';
		this.meshData = meshData;
	}

	OccluderComponent.prototype = Object.create(Component.prototype);

	module.exports = OccluderComponent;