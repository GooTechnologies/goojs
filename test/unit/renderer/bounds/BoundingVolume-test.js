import Vector3 from 'src/goo/math/Vector3';
import BoundingVolume from 'src/goo/renderer/bounds/BoundingVolume';
import CustomMatchers from 'test/unit/CustomMatchers';

	describe('BoundingVolume', function () {
		beforeEach(function () {
			jasmine.addMatchers(CustomMatchers);
		});

		describe('copy', function () {
			it('can copy everything from another bounding box', function () {
				var original = new BoundingVolume(new Vector3(1, 2, 3), 123, 234, 345);
				var copy = new BoundingVolume();
				copy.copy(original);

				expect(copy).toBeCloned(original);
			});
		});
	});
