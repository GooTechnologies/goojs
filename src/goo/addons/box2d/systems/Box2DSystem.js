define([
	'goo/entities/systems/System'
],
/** @lends */
function(
	System
) {
	"use strict";
	// global Box2D

	/**
	 * @class Physics simulation using Box2D.
	 * @desc Depends on the global Box2D object.
	 * Load box2d.js using a <script> tag before using this system.
	 */
	function Box2DSystem() {
		System.call(this, 'Box2DSystem', ['Box2DComponent', 'MeshDataComponent']);

		this.SCALE = 0.5;
		this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, -9));

		this.sortVertexesClockWise = function (a, b) {
			var aAngle = Math.atan2(a.get_y(), a.get_x());
			var bAngle = Math.atan2(b.get_y(), b.get_x());
			return aAngle > bAngle ? 1 : -1;
		};

		this.createPolygonShape = function (vertices) {
			var shape = new Box2D.b2PolygonShape();
			var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
			var offset = 0;
			for (var i = 0; i < vertices.length; i++) {
				Box2D.setValue(buffer + (offset), vertices[i].get_x(), 'float'); // x
				Box2D.setValue(buffer + (offset + 4), vertices[i].get_y(), 'float'); // y
				offset += 8;
			}
			var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
			shape.Set(ptr_wrapped, vertices.length);
			return shape;
		};
	}

	Box2DSystem.prototype = Object.create(System.prototype);

	Box2DSystem.prototype.inserted = function (entity) {
		var p = entity.physics2DComponent;
		var height = 0;
		var width = 0;

		var shape = new Box2D.b2PolygonShape();
		if (p.shape === "box") {
			shape.SetAsBox(p.width * this.SCALE, p.height * this.SCALE);
		} else if (p.shape === "circle") {
			shape = new Box2D.b2CircleShape();
			shape.set_m_radius(p.radius);
		} else if (p.shape === "mesh") {
			var meshData = entity.meshDataComponent.meshData;

			var verts = meshData.getAttributeBuffer('POSITION');
			//console.log(verts)
			var i = 0;
			var polygon = [];
			var minY = 10000;
			var maxY = -10000;
			var minX = 10000;
			var maxX = -10000;
			while (i <= verts.length - 3) {
				var x = verts[i];
				var y = verts[++i];
				// var z = verts[++i];

				if (y < minY) {
					minY = y;
				}
				if (y > maxY) {
					maxY = y;
				}
				if (x < minX) {
					minX = x;
				}
				if (x > maxX) {
					maxX = x;
				}

				++i;

				entity.transformComponent.updateWorldTransform();
				var v = new Box2D.b2Vec2(x, y);
				polygon.push(v);

			}

			//polygon.sort(this.sortVertexesClockWise)

			shape = this.createPolygonShape(polygon);
			height = Math.abs(maxY - minY);
			width = Math.abs(maxX - minX);
		} else if (p.shape === "polygon") {
			var polygon = [];
			var i = 0;
			while (i <= p.vertices.length - 2) {
				var v = new Box2D.b2Vec2(p.vertices[i], p.vertices[++i]);
				polygon.push(v);
				++i;
			}
			shape = this.createPolygonShape(polygon);

			console.log(polygon);
		}

		var fd = new Box2D.b2FixtureDef();
		fd.set_shape(shape);
		fd.set_density(1.0);
		fd.set_friction(p.friction);

		var bd = new Box2D.b2BodyDef();

		if (p.movable === true) {
			bd.set_type(Box2D.b2_dynamicBody);
		}

		bd.set_position(new Box2D.b2Vec2(entity.transform.translation.x + p.offsetX, entity.transform.translation.y + p.offsetY));
		var body = this.world.CreateBody(bd);
		body.CreateFixture(fd);
		body.SetLinearDamping(0.95);
		body.SetAngularDamping(0.6);

		p.body = body;
		p.world = this.world;
		entity.body = body;
		entity.body.h = height;
		entity.body.w = width;
	};

	Box2DSystem.prototype.deleted = function (/*entity*/) {
		// remove entity.body from physics
	};

	Box2DSystem.prototype.process = function (entities, tpf) {
		// step
		this.world.Step(tpf, 2, 2);

		for (var i = 0; i < entities.length; i++) {

			var position = entities[i].body.GetPosition();
			entities[i].transformComponent.transform.translation.y = position.get_y() - entities[i].physics2DComponent.offsetY;
			entities[i].transformComponent.transform.translation.x = position.get_x() - entities[i].physics2DComponent.offsetX;
			//	entities[i].transformComponent.transform.translation.z = 0;
			entities[i].transformComponent.setUpdated();
			entities[i].transformComponent.transform.rotation.z = entities[i].body.GetAngle();

			if (position.get_y() > 100) {
				entities[i].body.ApplyForce(new Box2D.b2Vec2(0, -100), entities[i].body.GetPosition());
			}
		}
	};

	return Box2DSystem;
});