define([
	'goo/entities/components/Component',
	'goo/renderer/MeshData',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/MathUtils',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/Vector3'
],
/** @lends */
function (
	Component,
	MeshData,
	BoundingBox,
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
		this.vertexModifiers = [];

		this.offset = new Vector3(0, 0, 0);
		this.bend = 0;
		this.spin = new Vector3(0, 0, 0);
		this.modifierType = 'Y';
	}

	ModifierComponent.type = 'ModifierComponent';

	ModifierComponent.prototype = Object.create(Component.prototype);
	ModifierComponent.prototype.constructor = ModifierComponent;

	function BendModifier() {
		this.modifierType = 'Y';
		this.bendAngle = 0;
	}
	BendModifier.prototype.update = function (position, normal, normalizedVert) {

	};

	ModifierComponent.prototype._copyMeshData = function (meshData) {
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

	ModifierComponent.prototype.updateVertexModifiers = function () {
		var matrix3 = new Matrix3x3();
		// var matrix4 = new Matrix4x4();

		var normalizedVert = new Vector3();
		var calcvec = new Vector3();
		var calcvec2 = new Vector3();
		var dirvec = new Vector3();

		this.modifierTargets.forEach(function (modifierTarget) {
			var posSource = modifierTarget.origMeshData.getAttributeBuffer(MeshData.POSITION);
			var posTarget = modifierTarget.newMeshData.getAttributeBuffer(MeshData.POSITION);
			var normalSource = modifierTarget.origMeshData.getAttributeBuffer(MeshData.NORMAL);
			var normalTarget = modifierTarget.newMeshData.getAttributeBuffer(MeshData.NORMAL);

			calcvec.setVector(modifierTarget.bound.max).subVector(modifierTarget.bound.min);
			// calcvec2.setVector(Vector3.ONE).scale(Math.PI * 4.0).div(calcvec);
			calcvec2.setVector(Vector3.ONE).scale(2.0).div(calcvec);

			var worldTrans = modifierTarget.entity.transformComponent.worldTransform.matrix;
			var worldTransInv = Matrix4x4.invert(modifierTarget.entity.transformComponent.worldTransform.matrix);

			var viewLength = posSource.length;
			var position = new Vector3();
			var normal = new Vector3();
			var modifierCount = this.vertexModifiers.length;
			for (var i = 0; i < viewLength; i += 3) {
				position.setDirect(posSource[i + 0], posSource[i + 1], posSource[i + 2]);
				worldTrans.applyPostPoint(position);
				position.subVector(modifierTarget.bound.center);

				normal.setDirect(normalSource[i + 0], normalSource[i + 1], normalSource[i + 2]);
				worldTrans.applyPostVector(normal);

				normalizedVert.setVector(position);
				normalizedVert.mulVector(calcvec2);

				for (var j = 0; j < modifierCount; j++) {
					this.vertexModifiers[j].update(position, normal, normalizedVert);
				}

				var angleval = 0;
				if (this.modifierType === 'X') {
					calcvec.setDirect(0, 0, -position.z);
					angleval = (this.bend * normalizedVert.z);
					dirvec.setDirect(
						0,
						0,
						position.z * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI)
					);
				} else if (this.modifierType === 'Y') {
					calcvec.setDirect(-position.x, 0, 0);
					angleval = (this.bend * normalizedVert.x);
					dirvec.setDirect(
						position.x * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI),
						0,
						0
					);
				} else if (this.modifierType === 'Z') {
					calcvec.setDirect(0, -position.y, 0);
					angleval = (this.bend * normalizedVert.y);
					dirvec.setDirect(
						0,
						position.y * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI),
						0
					);
				}

				position.addVector(this.offset);
				position.addVector(calcvec);

				matrix3.setIdentity();
				matrix3.rotateX(this.spin.x * normalizedVert.x * 2 * Math.PI);
				matrix3.rotateY(this.spin.y * normalizedVert.y * 2 * Math.PI);
				matrix3.rotateZ(this.spin.z * normalizedVert.z * 2 * Math.PI);

				matrix3.applyPost(position);
				matrix3.applyPost(normal);

				matrix3.setIdentity();
				if (this.modifierType === 'X') {
					matrix3.rotateX(angleval * 1 * Math.PI);
				} else if (this.modifierType === 'Y') {
					matrix3.rotateY(angleval * 1 * Math.PI);
				} else if (this.modifierType === 'Z') {
					matrix3.rotateZ(angleval * 1 * Math.PI);
				}
				matrix3.applyPost(position);
				matrix3.applyPost(normal);

				matrix3.setIdentity();
				if (this.modifierType === 'X') {
					matrix3.rotateX(angleval * 0.5 * Math.PI);
				} else if (this.modifierType === 'Y') {
					matrix3.rotateY(angleval * 0.5 * Math.PI);
				} else if (this.modifierType === 'Z') {
					matrix3.rotateZ(angleval * 0.5 * Math.PI);
				}
				matrix3.applyPost(dirvec);
		

				// position.subVector(calcvec);
				position.addVector(dirvec);

				position.addVector(modifierTarget.bound.center);
				worldTransInv.applyPostPoint(position);

				worldTransInv.applyPostVector(normal);

				posTarget[i + 0] = position.x;
				posTarget[i + 1] = position.y;
				posTarget[i + 2] = position.z;

				normalTarget[i + 0] = normal.x;
				normalTarget[i + 1] = normal.y;
				normalTarget[i + 2] = normal.z;
			}

			modifierTarget.newMeshData.setVertexDataUpdated();
		}.bind(this));
	};

	ModifierComponent.prototype.updateModifiers = function (entity) {
		this.modifierTargets.clear();
		var bound = null;
		entity.traverse(function (entity) {
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

		entity.traverse(function (entity) {
			if (entity.meshDataComponent) {
				var newMeshData = this._copyMeshData(entity.meshDataComponent.meshData);
				var modifierTarget = {
					bound: bound,
					origMeshData: entity.meshDataComponent.meshData,
					newMeshData: newMeshData,
					entity: entity
				};
				console.log(modifierTarget);
				entity.meshDataComponent.autoCompute = true;
				entity.meshDataComponent.meshData = newMeshData;
				this.modifierTargets.set(entity, modifierTarget);
			}
		}.bind(this));
	};

	return ModifierComponent;
});