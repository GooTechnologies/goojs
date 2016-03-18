import SimplePartitioner from 'src/goo/renderer/SimplePartitioner';
import BoundingSphere from 'src/goo/renderer/bounds/BoundingSphere';
import Entity from 'src/goo/entities/Entity';
import Camera from 'src/goo/renderer/Camera';
import Vector3 from 'src/goo/math/Vector3';
import MeshRendererComponent from 'src/goo/entities/components/MeshRendererComponent';

	describe('SimplePartitioner', function () {
		var partitioner, camera;

		beforeEach(function () {
			partitioner = new SimplePartitioner();
			camera = new Camera();
		});

		function createEntity(x, y, z) {
			var entity = new Entity();
			var mrc = new MeshRendererComponent();
			mrc.worldBound = new BoundingSphere(new Vector3(x, y, z), 1);
			entity.set(mrc);
			return entity;
		}

		describe('process', function () {
			it('can partition two entities', function () {
				var entity1 = createEntity(0, 0, 5);
				var entity2 = createEntity(0, 0, -5);
				var entities = [entity1, entity2];
				var renderList = [];

				partitioner.process(camera, entities, renderList);

				expect(renderList).toContain(entity2);
				expect(renderList.length).toEqual(1);
			});

			it('can filter with hide', function () {
				var entity = createEntity(0, 0, -5);
				var entities = [entity];
				var renderList = [];

				partitioner.process(camera, entities, renderList);

				expect(renderList).toContain(entity);

				entity.meshRendererComponent.hidden = true;
				partitioner.process(camera, entities, renderList);

				expect(renderList).not.toContain(entity);
			});

			it('cullmode never', function () {
				var entity = createEntity(0, 0, 5);
				var entities = [entity];
				var renderList = [];

				partitioner.process(camera, entities, renderList);

				expect(renderList).not.toContain(entity);

				entity.meshRendererComponent.cullMode = 'Never';
				partitioner.process(camera, entities, renderList);

				expect(renderList).toContain(entity);
			});
		});
	});
