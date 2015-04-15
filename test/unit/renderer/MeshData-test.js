define(
[
	"goo/shapes/Box",
	"goo/shapes/Quad",
	'goo/math/Transform',
	'goo/renderer/MeshData'
], function(
	Box,
	Quad,
	Transform,
	MeshData
) {
	"use strict";

	describe("MeshData", function() {
		it("getNormalsMeshData: number of vertices and indices", function() {
			var box = new Box();
			var normalsMD = box.getNormalsMeshData();

			var nNormalsPerFace = 4;
			var nFaces = 6;
			var nVerticesPerLine = 2;
			var nDimensions = 3;

			expect(normalsMD.vertexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine * nDimensions);
			expect(normalsMD.indexCount).toEqual(nNormalsPerFace * nFaces * nVerticesPerLine);
		});

		it("can translate vertices", function() {
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

		it("can rotate vertices", function() {
			var box = new Quad();

			var transform = new Transform();
			transform.setRotationXYZ(Math.PI/4, 0, 0);
			transform.update();
			box.applyTransform(MeshData.POSITION, transform);

			expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5 ); // -0.5
			expect(box.dataViews.POSITION[1]).toBeCloseTo(-Math.sqrt(2)/4); // -Math.sqrt(2)/4
			expect(box.dataViews.POSITION[2]).toBeCloseTo(-Math.sqrt(2)/4); // -Math.sqrt(2)/4

			expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
			expect(box.dataViews.POSITION[4]).toBeCloseTo( Math.sqrt(2)/4); //  Math.sqrt(2)/4
			expect(box.dataViews.POSITION[5]).toBeCloseTo( Math.sqrt(2)/4); //  Math.sqrt(2)/4

			expect(box.dataViews.POSITION[6]).toBeCloseTo( 0.5); //  0.5
			expect(box.dataViews.POSITION[7]).toBeCloseTo( Math.sqrt(2)/4); //  Math.sqrt(2)/4
			expect(box.dataViews.POSITION[8]).toBeCloseTo( Math.sqrt(2)/4); //  Math.sqrt(2)/4

			expect(box.dataViews.POSITION[9]).toBeCloseTo( 0.5);  //  0.5
			expect(box.dataViews.POSITION[10]).toBeCloseTo(-Math.sqrt(2)/4); // -Math.sqrt(2)/4
			expect(box.dataViews.POSITION[11]).toBeCloseTo(-Math.sqrt(2)/4); // -Math.sqrt(2)/4

		});

		it("can apply a function on vertices", function () {
			var box = new Quad();

			box.applyFunction(MeshData.POSITION, function (vert) {
				vert.z = vert.x + vert.y;
				return vert;
			});

			expect(box.dataViews.POSITION[0]).toBeCloseTo(-0.5); // -0.5
			expect(box.dataViews.POSITION[1]).toBeCloseTo(-0.5); // -0.5
			expect(box.dataViews.POSITION[2]).toBeCloseTo(-1.0); //  0.0

			expect(box.dataViews.POSITION[3]).toBeCloseTo(-0.5); // -0.5
			expect(box.dataViews.POSITION[4]).toBeCloseTo( 0.5); //  0.5
			expect(box.dataViews.POSITION[5]).toBeCloseTo( 0.0); //  0.0

			expect(box.dataViews.POSITION[6]).toBeCloseTo( 0.5); //  0.5
			expect(box.dataViews.POSITION[7]).toBeCloseTo( 0.5); //  0.5
			expect(box.dataViews.POSITION[8]).toBeCloseTo( 1.0); //  0.0

			expect(box.dataViews.POSITION[9]).toBeCloseTo( 0.5);  //  0.5
			expect(box.dataViews.POSITION[10]).toBeCloseTo(-0.5); // -0.5
			expect(box.dataViews.POSITION[11]).toBeCloseTo( 0.0); //  0.0
		});

		it('can get attribute buffer', function(){
			var box = new Box();
			//!TODO
			box.getAttributeBuffer(MeshData.POSITION);
			box.getAttributeBuffer(MeshData.NORMAL);
			box.getAttributeBuffer(MeshData.COLOR);
			box.getAttributeBuffer(MeshData.TANGENT);
			box.getAttributeBuffer(MeshData.TEXCOORD0);
			box.getAttributeBuffer(MeshData.TEXCOORD1);
			box.getAttributeBuffer(MeshData.TEXCOORD2);
			box.getAttributeBuffer(MeshData.TEXCOORD3);
			box.getAttributeBuffer(MeshData.WEIGHTS);
			box.getAttributeBuffer(MeshData.JOINTIDS);
		})
	});
});
