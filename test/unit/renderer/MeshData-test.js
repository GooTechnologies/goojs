describe('MeshData', function () {
	it('getNormalsMeshData: number of vertices and indices', function () {
		var box = new Box();
		var normalsMD = box.getNormalsMeshData();

		var nNormalsPerFace = 4;
		var nFaces = 6;
		var nVerticesPerLine = 2;
		var nDimensions = 3;

		expect(normalsMD.vertexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine * nDimensions);
		expect(normalsMD.indexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine);
	});

	it('can rebuild data with other counts', function () {
		var box = new Box();

		box.rebuildData(3, 3);

		expect(box.vertexCount).toEqual(3);
		expect(box.indexCount).toEqual(3);
	});

	it('can rebuild data with an indexCount of 0 and saveOldData', function () {
		var box = new Box();
		var oldVertexCount = box.vertexCount;

		box.rebuildData(oldVertexCount, 0, true);

		expect(box.vertexCount).toEqual(oldVertexCount);
		expect(box.indexCount).toEqual(0);
	});

	it('can translate vertices', function () {
		var box = new Quad();

		var transform = new Transform();
		transform.translation.setDirect(1, 2, 3);
		transform.update();
		box.applyTransform(MeshData.POSITION, transform);

		expect(box.dataViews.POSITION[0]).toBeCloseTo(0.5); // -0.5 + 1
		expect(box.dataViews.POSITION[1]).toBeCloseTo(1.5); // -0.5 + 2
		expect(box.dataViews.POSITION[2]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[3]).toBeCloseTo(0.5); // -0.5 + 1
		expect(box.dataViews.POSITION[4]).toBeCloseTo(2.5); //  0.5 + 2
		expect(box.dataViews.POSITION[5]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[6]).toBeCloseTo(1.5); //  0.5 + 1
		expect(box.dataViews.POSITION[7]).toBeCloseTo(2.5); //  0.5 + 2
		expect(box.dataViews.POSITION[8]).toBeCloseTo(3.0); //  0.0 + 3

		expect(box.dataViews.POSITION[9]).toBeCloseTo(1.5);  //  0.5 + 1
		expect(box.dataViews.POSITION[10]).toBeCloseTo(1.5); // -0.5 + 2
		expect(box.dataViews.POSITION[11]).toBeCloseTo(3.0); //  0.0 + 3
	});

	it('can rotate vertices', function () {
		var box = new Quad();

		var transform = new Transform();
		transform.setRotationXYZ(Math.PI / 4, 0, 0);
		transform.update();
		box.applyTransform(MeshData.POSITION, transform);

		expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5 ); // -0.5
		expect(box.dataViews.POSITION[1]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[2]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[4]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[5]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[6]).toBeCloseTo( 0.5); //  0.5
		expect(box.dataViews.POSITION[7]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[8]).toBeCloseTo( Math.sqrt(2) / 4); //  Math.sqrt(2) / 4

		expect(box.dataViews.POSITION[9]).toBeCloseTo( 0.5);  //  0.5
		expect(box.dataViews.POSITION[10]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
		expect(box.dataViews.POSITION[11]).toBeCloseTo(-Math.sqrt(2) / 4); // -Math.sqrt(2) / 4
	});

	it('can apply a function on vertices', function () {
		var box = new Quad();

		box.applyFunction(MeshData.POSITION, function (vert) {
			vert.z = vert.x + vert.y;
			return vert;
		});

		expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[1]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[2]).toBeCloseTo(-1.0); //  0.0

		expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[4]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[5]).toBeCloseTo(0.0); //  0.0

		expect(box.dataViews.POSITION[6]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[7]).toBeCloseTo(0.5); //  0.5
		expect(box.dataViews.POSITION[8]).toBeCloseTo(1.0); //  0.0

		expect(box.dataViews.POSITION[9]).toBeCloseTo(0.5);  //  0.5
		expect(box.dataViews.POSITION[10]).toBeCloseTo(-0.5); // -0.5
		expect(box.dataViews.POSITION[11]).toBeCloseTo(0.0); //  0.0
	});

	it('can get attribute buffer', function () {
		var box = new Box();

		var getAttributeBuffer = box.getAttributeBuffer.bind(box);

		expect(getAttributeBuffer(MeshData.POSITION)).toBeDefined();
		expect(getAttributeBuffer(MeshData.NORMAL)).toBeDefined();
		expect(getAttributeBuffer(MeshData.COLOR)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TANGENT)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD0)).toBeDefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD1)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD2)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.TEXCOORD3)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.WEIGHTS)).toBeUndefined();
		expect(getAttributeBuffer(MeshData.JOINTIDS)).toBeUndefined();
	});
});
