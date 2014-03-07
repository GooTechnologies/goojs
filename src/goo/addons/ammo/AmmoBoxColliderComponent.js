define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function(
	Component,
	Box,
	Vector3
){
	function AmmoBoxColliderComponent(settings){
		this.type = "AmmoColliderComponent";

		settings = settings || {};
		var e = this.halfExtents = settings.halfExtents || new Vector3(0.5,0.5,0.5);

		// Automatically use half extents from mesh data components if they exist
		if(typeof(entity)!="undefined" && entity.meshDataComponent && entity.meshDataComponent.meshData) {
			var meshData = entity.meshDataComponent.meshData;
			if (meshData instanceof Box) {
				e.set_d(meshData.xExtent, meshData.yExtent, meshData.zExtent);
			}
		}

		// Create shape
		this.ammoShape = new Ammo.btBoxShape(new Ammo.btVector3(e.x, e.y, e.z));
	};
	AmmoBoxColliderComponent.prototype = Object.create(Component.prototype);
	AmmoBoxColliderComponent.constructor = AmmoBoxColliderComponent;

	return AmmoBoxColliderComponent;
});
