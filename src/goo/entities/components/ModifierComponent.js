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

		this.mods = new Map();

		this.offset = new Vector3(0, 0, 0);
		this.bend = 0;
		this.spin = new Vector3(0, 0, 0);
		this.modifierType = 'Y';
	}

	ModifierComponent.type = 'ModifierComponent';

	ModifierComponent.prototype = Object.create(Component.prototype);
	ModifierComponent.prototype.constructor = ModifierComponent;

	ModifierComponent.prototype.api = {
		// setTranslation: function () {
			// return this;
		// },
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

	ModifierComponent.prototype.updateValues = function () {
		var matrix3 = new Matrix3x3();
		// var matrix4 = new Matrix4x4();

		var lim = new Vector3();
		var calcvec = new Vector3();
		var calcvec2 = new Vector3();
		var dirvec = new Vector3();

		this.mods.forEach(function (storeObj) {
			var posSource = storeObj.origMeshData.getAttributeBuffer(MeshData.POSITION);
			var posTarget = storeObj.newMeshData.getAttributeBuffer(MeshData.POSITION);
			var normalSource = storeObj.origMeshData.getAttributeBuffer(MeshData.NORMAL);
			var normalTarget = storeObj.newMeshData.getAttributeBuffer(MeshData.NORMAL);

			calcvec.setVector(storeObj.bound.max).subVector(storeObj.bound.min);
			// calcvec2.setVector(Vector3.ONE).scale(Math.PI * 4.0).div(calcvec);
			calcvec2.setVector(Vector3.ONE).scale(2.0).div(calcvec);

			var worldTrans = storeObj.entity.transformComponent.worldTransform.matrix;
			var worldTransInv = Matrix4x4.invert(storeObj.entity.transformComponent.worldTransform.matrix);

			var viewLength = posSource.length;
			var vert = new Vector3();
			var norm = new Vector3();
			for (var i = 0; i < viewLength; i += 3) {
				vert.setDirect(posSource[i + 0], posSource[i + 1], posSource[i + 2]);
				worldTrans.applyPostPoint(vert);
				vert.subVector(storeObj.bound.center);

				norm.setDirect(normalSource[i + 0], normalSource[i + 1], normalSource[i + 2]);
				worldTrans.applyPostVector(norm);

				lim.setVector(vert);
				lim.mulVector(calcvec2);

				var angleval = 0;
				if (this.modifierType === 'X') {
					calcvec.setDirect(0, 0, -vert.z);
					angleval = (this.bend * lim.z);
					dirvec.setDirect(
						0,
						0,
						vert.z * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI)
					);
				} else if (this.modifierType === 'Y') {
					calcvec.setDirect(-vert.x, 0, 0);
					angleval = (this.bend * lim.x);
					dirvec.setDirect(
						vert.x * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI),
						0,
						0
					);
				} else if (this.modifierType === 'Z') {
					calcvec.setDirect(0, -vert.y, 0);
					angleval = (this.bend * lim.y);
					dirvec.setDirect(
						0,
						vert.y * MathUtils.lerp(Math.abs(angleval*angleval), 1, 2/Math.PI),
						0
					);
				}

				vert.addVector(this.offset);
				vert.addVector(calcvec);

				matrix3.setIdentity();
				matrix3.rotateX(this.spin.x * lim.x * 2 * Math.PI);
				matrix3.rotateY(this.spin.y * lim.y * 2 * Math.PI);
				matrix3.rotateZ(this.spin.z * lim.z * 2 * Math.PI);

				if (this.modifierType === 'X') {
					matrix3.rotateX(angleval * 1 * Math.PI);
				} else if (this.modifierType === 'Y') {
					matrix3.rotateY(angleval * 1 * Math.PI);
				} else if (this.modifierType === 'Z') {
					matrix3.rotateZ(angleval * 1 * Math.PI);
				}
				matrix3.applyPost(vert);
				matrix3.applyPost(norm);

				matrix3.setIdentity();
				if (this.modifierType === 'X') {
					matrix3.rotateX(angleval * 0.5 * Math.PI);
				} else if (this.modifierType === 'Y') {
					matrix3.rotateY(angleval * 0.5 * Math.PI);
				} else if (this.modifierType === 'Z') {
					matrix3.rotateZ(angleval * 0.5 * Math.PI);
				}
				matrix3.applyPost(dirvec);
		

				// vert.subVector(calcvec);
				vert.addVector(dirvec);

				vert.addVector(storeObj.bound.center);
				worldTransInv.applyPostPoint(vert);

				worldTransInv.applyPostVector(norm);

				posTarget[i + 0] = vert.x;
				posTarget[i + 1] = vert.y;
				posTarget[i + 2] = vert.z;

				normalTarget[i + 0] = norm.x;
				normalTarget[i + 1] = norm.y;
				normalTarget[i + 2] = norm.z;
			}

			storeObj.newMeshData.setVertexDataUpdated();
		}.bind(this));
	};

	ModifierComponent.prototype.updateModifiers = function (entity) {
		this.mods.clear();
		var bound = new BoundingBox();
		entity.traverse(function (entity) {
			// if (entity.meshDataComponent) {
			// 	bound.merge(entity.meshDataComponent.modelBound);
			// }
			if (entity.meshRendererComponent) {
				bound.merge(entity.meshRendererComponent.worldBound);
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
				var storeObj = {
					bound: bound,
					origMeshData: entity.meshDataComponent.meshData,
					newMeshData: newMeshData,
					entity: entity
				};
				console.log(storeObj);
				entity.meshDataComponent.autoCompute = true;
				entity.meshDataComponent.meshData = newMeshData;
				this.mods.set(entity, storeObj);
			}
		}.bind(this));
	};

	return ModifierComponent;
});