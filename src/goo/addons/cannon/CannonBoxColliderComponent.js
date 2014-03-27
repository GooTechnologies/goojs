define([
	'goo/entities/components/Component',
	'goo/shapes/Box',
	'goo/math/Vector3'
], function(
	Component,
	Box,
	Vector3
){

	// Todo: copy pasted from Ammo, convert to Cannon
	function CannonBoxColliderComponent(settings){
		this.type = "CannonColliderComponent";

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
		this.cannonShape = new Cannon.btBoxShape(new Cannon.btVector3(e.x, e.y, e.z));
	};
	CannonBoxColliderComponent.prototype = Object.create(Component.prototype);
	CannonBoxColliderComponent.constructor = CannonBoxColliderComponent;

	return CannonBoxColliderComponent;
});
