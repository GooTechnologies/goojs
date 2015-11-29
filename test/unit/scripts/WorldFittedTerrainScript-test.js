	xdescribe('WorldFittedTerrainScript', function () {
		describe('Uses default dimensions', function () {
			var terrainScript;
			var heightAtPos;

			beforeEach(function () {
				heightAtPos = undefined;
				terrainScript = new WorldFittedTerrainScript();
			});

			var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];

			it('adds bad heightmap and gets exception', function () {
				var terrainScript = new WorldFittedTerrainScript();
				expect(function () { terrainScript.addHeightData(); }).toThrow();
			});

			it('finds the registered heightMatrix', function () {
				var heightData;
				terrainScript.addHeightData(heightMatrix);
				heightData = terrainScript.getHeightDataForPosition(new Vector3(1, 1, 1));
				expect(heightData.script.getMatrixData()).toBe(heightMatrix);
			});

			it('looks for positions on a default dimensions heightMatrix', function () {
				terrainScript.addHeightData(heightMatrix);
				heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(1, 1, 1));
				expect(heightAtPos).toEqual(0);
				heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(99.99, 49, 99.99));
				expect(heightAtPos).toBeCloseTo(49.9924);
			});

			it('looks outside default dimensions', function () {
				terrainScript.addHeightData(heightMatrix);
				heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(-1, 0, 0));
				expect(heightAtPos).toEqual(null);
				heightAtPos = terrainScript.getTerrainHeightAt(new Vector3(100, 50, 101));
				expect(heightAtPos).toEqual(null);
			});
		});

		describe('Uses custom dimensions', function () {
			var terrainScript;
			var heightAtPos;

			beforeEach(function () {
				heightAtPos = undefined;
				terrainScript = new WorldFittedTerrainScript();
			});

			var heightMatrix = [[0, 0, 0, 0], [0, 0.5, 0.5, 0], [0.5, 1, 1, 0.5], [1, 1, 1, 1]];

			it('verifies axis displacement', function () {
				var displacedAxis = terrainScript.displaceAxisDimensions(0, 0, 1, 2);
				expect(displacedAxis).toEqual(0);

				var displacedAxis = terrainScript.displaceAxisDimensions(1, 0, 1, 2);
				expect(displacedAxis).toEqual(2);

				var displacedAxis = terrainScript.displaceAxisDimensions(1, 0, 10, 2);
				expect(displacedAxis).toEqual(0.2);

				var displacedAxis = terrainScript.displaceAxisDimensions(10, 10, 20, 2);
				expect(displacedAxis).toEqual(0);

				var displacedAxis = terrainScript.displaceAxisDimensions(20, 10, 20, 2);
				expect(displacedAxis).toEqual(2);
			});

			it('verifies return axis to world dimensions', function () {
				var displacedAxis = terrainScript.returnToWorldDimensions(0, 0, 1, 2);
				expect(displacedAxis).toEqual(0);

				var displacedAxis = terrainScript.returnToWorldDimensions(0, 30, 45, 5);
				expect(displacedAxis).toEqual(30);

				var displacedAxis = terrainScript.returnToWorldDimensions(5, 30, 45, 5);
				expect(displacedAxis).toEqual(45);

				var displacedAxis = terrainScript.returnToWorldDimensions(0.5, 0, 10, 1);
				expect(displacedAxis).toEqual(5);

				var displacedAxis = terrainScript.returnToWorldDimensions(0.2, 1, 11, 2);
				expect(displacedAxis).toEqual(2);

				var displacedAxis = terrainScript.returnToWorldDimensions(0, 10, 20, 2);
				expect(displacedAxis).toEqual(10);

				var displacedAxis = terrainScript.returnToWorldDimensions(2, 10, 20, 2);
				expect(displacedAxis).toEqual(20);
			});

			it('looks for positions on positive displaced heightMatrix', function () {
				var dimensions = {
					minX: 100,
					maxX: 200,
					minY: 50,
					maxY: 100,
					minZ: 100,
					maxZ: 200
				};
				terrainScript.addHeightData(heightMatrix, dimensions);
				heightAtPos = terrainScript.getTerrainHeightAt([100, 50, 100]);
				expect(heightAtPos).toEqual(dimensions.minY);
				heightAtPos = terrainScript.getTerrainHeightAt([200, 100, 200]);
				expect(heightAtPos).toEqual(dimensions.maxY);
				heightAtPos = terrainScript.getTerrainHeightAt([150, 100, 150]);
				expect(heightAtPos).toBeCloseTo(87.5);
			});

			it('looks for positions on negative displaced heightMatrix', function () {
				var dimensions = {
					minX: -300,
					maxX: -200,
					minY: -150,
					maxY: -100,
					minZ: -300,
					maxZ: -200
				};
				terrainScript.addHeightData(heightMatrix, dimensions);
				heightAtPos = terrainScript.getTerrainHeightAt([-200, -150, -200]);
				expect(heightAtPos).toEqual(dimensions.maxY);
				heightAtPos = terrainScript.getTerrainHeightAt([-300, -150, -300]);
				expect(heightAtPos).toEqual(dimensions.minY);
				heightAtPos = terrainScript.getTerrainHeightAt([-225, -150, -200]);
				expect(heightAtPos).toBeCloseTo(dimensions.minY + 0.5 * (dimensions.maxY - dimensions.minY));
			});
		});
	});
