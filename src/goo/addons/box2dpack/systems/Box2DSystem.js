var System = require('../../../entities/systems/System');

/* global Box2D */

/**
 * Physics simulation using Box2D.
 * Depends on the global Box2D object. Load box2d.js using a &lt;script&gt; tag before using this system
 * @extends System
 * @example-link http://code.gooengine.com/latest/visual-test/goo/components/Box2DComponent/Box2DComponent-vtest.html Working example
 */
function Box2DSystem() {
	System.call(this, 'Box2DSystem', ['Box2DComponent', 'MeshDataComponent']);

	this.SCALE = 0.5;
	this.physicsWorld = new Box2D.b2World(new Box2D.b2Vec2(0.0, -9.81));

	// Defaulted to recommended values 8 and 3
	this.velocityIterations = 8;
	this.positionIterations = 3;
}

function createPolygonShape(vertices) {
	var FLOAT_SIZE = 4;
	var shape = new Box2D.b2PolygonShape();
	var buffer = Box2D.allocate(vertices.length * FLOAT_SIZE * 2, 'float', Box2D.ALLOC_STACK);
	var offset = 0;
	for (var i = 0; i < vertices.length; i++) {
		Box2D.setValue(buffer + (offset), vertices[i].get_x(), 'float');
		Box2D.setValue(buffer + (offset + FLOAT_SIZE), vertices[i].get_y(), 'float');
		offset += FLOAT_SIZE * 2;
	}
	var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
	shape.Set(ptr_wrapped, vertices.length);
	return shape;
}

Box2DSystem.prototype = Object.create(System.prototype);
Box2DSystem.prototype.constructor = Box2DSystem;

Box2DSystem.prototype.inserted = function (entity) {
	var p = entity.box2DComponent;
	var height = 0;
	var width = 0;

	var shape = new Box2D.b2PolygonShape();
	if (p.shape === 'box') {
		shape.SetAsBox(p.width * this.SCALE, p.height * this.SCALE);
	} else if (p.shape === 'circle') {
		shape = new Box2D.b2CircleShape();
		shape.set_m_radius(p.radius);
	} else if (p.shape === 'mesh') {
		var meshData = entity.meshDataComponent.meshData;

		var verts = meshData.getAttributeBuffer('POSITION');
		var i = 0;
		var polygon = [];
		var minY = Infinity;
		var maxY = -Infinity;
		var minX = Infinity;
		var maxX = -Infinity;
		while (i <= verts.length - 3) {
			var x = verts[i];
			var y = verts[++i];

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

			var v = new Box2D.b2Vec2(x, y);
			polygon.push(v);
		}

		shape = createPolygonShape(polygon);
		height = maxY - minY;
		width = maxX - minX;
	} else if (p.shape === 'polygon') {
		var polygon = [];
		var i = 0;
		while (i <= p.vertices.length - 2) {
			var v = new Box2D.b2Vec2(p.vertices[i], p.vertices[++i]);
			polygon.push(v);
			++i;
		}
		shape = createPolygonShape(polygon);
	}

	var fd = new Box2D.b2FixtureDef(); // fd?
	fd.set_shape(shape);
	fd.set_density(1.0);
	fd.set_friction(p.friction);
	fd.set_restitution(p.restitution);

	var bd = new Box2D.b2BodyDef();

	if (p.movable === true) {
		bd.set_type(Box2D.b2_dynamicBody);
	}

	entity.transformComponent.sync();
	bd.set_position(new Box2D.b2Vec2(entity.transformComponent.transform.translation.x + p.offsetX, entity.transformComponent.transform.translation.y + p.offsetY));
	var rotAngles = entity.transformComponent.transform.rotation.toAngles();
	bd.set_angle(rotAngles.z);
	var body = this.physicsWorld.CreateBody(bd);
	body.CreateFixture(fd);
	body.SetLinearDamping(0.95);
	body.SetAngularDamping(0.6);

	p.body = body;
	p.world = this.physicsWorld;
	// should not be stored on the entity level
	entity.body = body;
	entity.body.h = height;
	entity.body.w = width;
};

Box2DSystem.prototype.deleted = function (entity) {
	this.physicsWorld.DestroyBody(entity.body);
};

Box2DSystem.prototype.process = function (entities, tpf) {
	this.physicsWorld.Step(tpf, this.velocityIterations, this.positionIterations);

	for (var i = 0; i < entities.length; i++) {
		var entity = entities[i];
		var transformComponent = entity.transformComponent;
		var transform = transformComponent.transform;
		var position = entity.body.GetPosition();
		var posX = position.get_x();
		var posY = position.get_y();
		transform.translation.x = posX - entity.box2DComponent.offsetX;
		transform.translation.y = posY - entity.box2DComponent.offsetY;
		transformComponent.setRotation(0, 0, entity.body.GetAngle());
		transformComponent.setUpdated();
	}
};

module.exports = Box2DSystem;
