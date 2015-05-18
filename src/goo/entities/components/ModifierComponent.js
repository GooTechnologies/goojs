define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Transform',
	'goo/math/MathUtils',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/Vector3'
],
/** @lends */
function(
	Component,
	MeshData,
	BoundingBox,
	Transform,
	MathUtils,
	Matrix3x3,
	Matrix4x4,
	Vector3
) {
	'use strict';

	function ModifierComponent() {
		Component.call(this);
		this.type = 'ModifierComponent';

		this.modifierTargets = new Map();

		this.objectModifiers = [];

		this.clones = [];

		this.calcvec = new Vector3();
		this.calcvec2 = new Vector3();
	}

	ModifierComponent.type = 'ModifierComponent';

	ModifierComponent.prototype = Object.create(Component.prototype);
	ModifierComponent.prototype.constructor = ModifierComponent;

	ModifierComponent.prototype._copyMeshData = function(meshData) {
		var newMeshData = new MeshData(meshData.attributeMap, meshData.vertexCount, meshData.indexCount);
		for (var key in meshData.dataViews) {
			var data = meshData.dataViews[key];
			newMeshData.getAttributeBuffer(key).set(data);
		}
		newMeshData.getIndexBuffer().set(meshData.getIndexBuffer());

		newMeshData.indexLengths = meshData.indexLengths;
		newMeshData.indexModes = meshData.indexModes;

		return newMeshData;
	};

	ModifierComponent.prototype.update = function(mod) {
		this.updateObjectModifiers();
	};

	ModifierComponent.prototype.updateObjectModifiers = function() {
		this.modifierTargets.forEach(function(modifierTarget) {
			modifierTarget.transform.copy(modifierTarget.origTransform);
		}.bind(this));

		var modifierCount = this.objectModifiers.length;
		for (var j = 0; j < modifierCount; j++) {
			var objectModifier = this.objectModifiers[j];
			if (objectModifier.setup) {
				objectModifier.setup();			
			}

			var index = 0;
			this.modifierTargets.forEach(function(modifierTarget) {
				this.calcvec.setVector(modifierTarget.bound.max).subVector(modifierTarget.bound.min);
				this.calcvec2.setVector(Vector3.ONE).scale(2.0).div(this.calcvec);
				this.calcvec.setVector(modifierTarget.transform.translation);
				this.calcvec.mulVector(this.calcvec2);

				objectModifier.updateObject(modifierTarget, this.modifierTargets, this.calcvec, index++);
				modifierTarget.entity.transformComponent.setUpdated();
			}.bind(this));
		}
	};

	ModifierComponent.prototype.shallowClone = function(entity) {
		// var newMeshData = this._copyMeshData(entity.meshDataComponent.meshData);
		var ent = entity._world.createEntity(entity.meshDataComponent.meshData, entity.meshRendererComponent.materials[0]);
		ent.addToWorld();
		return ent;
	};

	ModifierComponent.prototype.clone = function(entity, count) {
		count = Math.floor(count);
		if (count < 1) {
			return;
		}

		for (var i = 0; i < this.clones.length; i++) {
			this.clones[i].removeFromWorld();
		}
		this.clones = [];

		for (var i = 0; i < count; i++) {
			entity.traverse(function(entity) {
				if (entity.meshRendererComponent) {
					var clone = this.shallowClone(entity);
					this.clones.push(clone);
				}
			}.bind(this));
		}		

		for (var i = 0; i < this.clones.length; i++) {
			entity.attachChild(this.clones[i]);
		}

		this.updateModifiers(entity);

		this.update();

		// entity._world.processEntityChanges();
	};

	ModifierComponent.prototype.updateModifiers = function(entity) {
		this.modifierTargets.clear();
		var bound = null;
		entity.traverse(function(entity) {
			// if (entity.meshDataComponent) {
			// 	bound.merge(entity.meshDataComponent.modelBound);
			// }
			if (entity.meshRendererComponent) {
				var entityBound = entity.meshRendererComponent.worldBound;
				if (!bound) {
					bound = new BoundingBox(entityBound.center, entityBound.xExtent,
						entityBound.yExtent, entityBound.zExtent);
				} else {
					bound.merge(entityBound);
				}
			}
		}.bind(this));
		bound.center.subVector(entity.transformComponent.worldTransform.translation);
		bound.min.x = bound.center.x - bound.xExtent;
		bound.min.y = bound.center.y - bound.yExtent;
		bound.min.z = bound.center.z - bound.zExtent;
		bound.max.x = bound.center.x + bound.xExtent;
		bound.max.y = bound.center.y + bound.yExtent;
		bound.max.z = bound.center.z + bound.zExtent;

		entity.traverse(function(entity) {
			if (entity.meshDataComponent) {
				var origTransform = new Transform();
				origTransform.copy(entity.transformComponent.transform);

				var modifierTarget = {
					bound: bound,
					origMeshData: entity.meshDataComponent.meshData,
					entity: entity,
					transform: entity.transformComponent.transform,
					origTransform: origTransform
				};
				this.modifierTargets.set(entity, modifierTarget);
			}
		}.bind(this));
	};

	return ModifierComponent;
});