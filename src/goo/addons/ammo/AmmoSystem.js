define([
	'goo/entities/systems/System',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData'
],
/** @lends */
function(
	System,
	BoundingBox,
	BoundingSphere,
	Box,
	Quad,
	Sphere,
	MeshData
) {
	"use strict";

	/**
	 * @class Handles integration with Ammo.js.
	 * Depends on the global Ammo object, 
	 * so load ammo.small.js using a script tag before using this system.
	 * See also {@link AmmoComponent}
	 * @extends System
	 * @param [Object] settings. The settings object can contain the following properties:
	 * @param {number} settings.gravity (defaults to -9.81)
	 * @param {number} settings.stepFrequency (defaults to 60)
	 * @example
	 * var ammoSystem = new AmmoSystem({stepFrequency:60});
	 * goo.world.setSystem(ammoSystem);
	 */
	function AmmoSystem(settings) {
		System.call(this, 'AmmoSystem', ['AmmoComponent', 'TransformComponent']);
		this.settings = settings || {};
		var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
		var overlappingPairCache = new Ammo.btDbvtBroadphase();
		var solver = new Ammo.btSequentialImpulseConstraintSolver();
		var ammoWorld = this.ammoWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
		ammoWorld.setGravity(new Ammo.btVector3(0, this.settings.gravity || -9.81, 0));
	}

	AmmoSystem.prototype = Object.create(System.prototype);

	AmmoSystem.prototype.inserted = function(entity) {
		var ammoComponent = entity.ammoComponent;
		var etc = entity.transformComponent;

		if (false) {
			entity.clearComponent('AmmoComponent');
			return;
		}

		var transform = new Ammo.btTransform();
		transform.setIdentity(); // TODO: is this needed ?
		transform.setOrigin(new Ammo.btVector3( etc.x, etc.y, etc.z)); // TODO; set based on transformComponent
		var motionState = new Ammo.btDefaultMotionState( transform );
		var bvhTriangleMeshShape = this.calculateTriangleMeshShape( entity); // bvh = Bounding Volume Hierarchy
		var localInertia = new Ammo.btVector3(0, 0, 0);

		var info = new Ammo.btRigidBodyConstructionInfo(ammoComponent.mass, motionState, bvhTriangleMeshShape, localInertia);
		var rigidBody = new Ammo.btRigidBody( info );
		this.ammoWorld.addRigidBody( ammoComponent.body = rigidBody);
	};

	AmmoSystem.prototype.deleted = function(entity) {
		if (entity.ammoComponent) {
			this.ammoWorld.remove(entity.ammoComponent.body);
		}
	};

	AmmoSystem.prototype.calculateTriangleMeshShape = function(entity, scale) {
		scale = scale || 1;
		var floatByteSize = 4;
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? "i32" : "i16";

		var meshData = entity.meshDataComponent.meshData;

		var vertices = meshData.dataViews.POSITION;
		var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, "float", Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = vertices.length; i < il; i ++ ) {
			Ammo.setValue( vertexBuffer + i * floatByteSize, scale * vertices[ i ], 'float' );
		}

		var indices = meshData.indexData.data;
		var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = indices.length; i < il; i ++ ) {
			Ammo.setValue( indexBuffer + i * intByteSize, indices[ i ], intType );
		}

		var iMesh = new Ammo.btIndexedMesh();
		iMesh.set_m_numTriangles( meshData.indexCount / 3 );
		iMesh.set_m_triangleIndexBase( indexBuffer );
		iMesh.set_m_triangleIndexStride( intByteSize * 3 );
		
		iMesh.set_m_numVertices( meshData.vertexCount );
		iMesh.set_m_vertexBase( vertexBuffer );
		iMesh.set_m_vertexStride( floatByteSize * 3 );

		var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
		triangleIndexVertexArray.addIndexedMesh( iMesh); // indexedMesh, indexType = PHY_INTEGER = 2 seems optional
		
		// bvh = Bounding Volume Hierarchy
		return new Ammo.btBvhTriangleMeshShape( triangleIndexVertexArray, true, true ); // btStridingMeshInterface, useQuantizedAabbCompression, buildBvh
	};

	var fixedTime = 1/60;
	AmmoSystem.prototype.process = function(entities, tpf) {
		this.ammoWorld.stepSimulation( tpf, Math.floor(tpf / fixedTime)+1, fixedTime);

		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			e.ammoComponent.process( e, tpf);;
		}
	};

	return AmmoSystem;
});
