describe('LineRenderer', function () {

	var Vector3 = require('src/goo/math/Vector3');
	var World = require('src/goo/entities/World');
	var LineRenderer = require('src/goo/addons/linerenderpack/LineRenderer');

	var world;
	var lineRenderer;
	var redColor = new Vector3(1, 0, 0);

	beforeEach(function () {
		world = new World();
	});

	it('can construct', function () {
		lineRenderer = new LineRenderer(world);

		expect(lineRenderer).toBeDefined();
	});

	it('can add line', function () {
		lineRenderer = new LineRenderer(world);

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		//expect _numRenderingLines to have incremented
		expect(lineRenderer._numRenderingLines).toBe(1);
	});

	it('can add to renderList', function () {
		lineRenderer = new LineRenderer(world);
		var renderList = [];

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		lineRenderer._manageRenderList(renderList);

		//expect an element in the renderList array
		expect(renderList.length).toBe(1);
	});

	it('can remove from renderList', function () {
		lineRenderer = new LineRenderer(world);
		var renderList = [];

		lineRenderer._addLine(Vector3.ZERO, Vector3.ONE, redColor);

		//simulate two frames
		for (var i = 0; i < 2; i++) {
			lineRenderer._updateVertexData();
			lineRenderer._manageRenderList(renderList);
			lineRenderer._clear();
		}

		//expect no elements in the renderList array
		expect(renderList.length).toBe(0);
	});
});