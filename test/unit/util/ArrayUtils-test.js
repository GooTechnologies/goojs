var ArrayUtils = require('src/goo/util/ArrayUtils');

describe('ArrayUtils', function () {
	describe('fromKeys', function () {
		it('returns an empty array for an empty collection', function () {
			var set_ = new Set();
			var map = new Map();

			var setKeys = ArrayUtils.fromKeys(set_);
			var mapKeys = ArrayUtils.fromKeys(map);

			expect(setKeys).toEqual([]);
			expect(mapKeys).toEqual([]);
		});

		it('returns an array of keys of the given collection', function () {
			var set_ = new Set();
			set_.add('a');
			set_.add('s');
			set_.add('d');

			var map = new Map();
			map.set('f', 'ff');
			map.set('g', 'gg');
			map.set('h', 'hh');

			var setKeys = ArrayUtils.fromKeys(set_);
			var mapKeys = ArrayUtils.fromKeys(map);

			expect(setKeys).toEqual(['a', 's', 'd']);
			expect(mapKeys).toEqual(['f', 'g', 'h']);
		});
	});

	describe('fromValues', function () {
		it('returns an empty array for an empty collection', function () {
			var set_ = new Set();
			var map = new Map();

			var setKeys = ArrayUtils.fromValues(set_);
			var mapKeys = ArrayUtils.fromValues(map);

			expect(setKeys).toEqual([]);
			expect(mapKeys).toEqual([]);
		});

		it('returns an array of keys of the given collection', function () {
			var set_ = new Set();
			set_.add('a');
			set_.add('s');
			set_.add('d');

			var map = new Map();
			map.set('f', 'ff');
			map.set('g', 'gg');
			map.set('h', 'hh');

			var setKeys = ArrayUtils.fromValues(set_);
			var mapKeys = ArrayUtils.fromValues(map);

			expect(setKeys).toEqual(['a', 's', 'd']);
			expect(mapKeys).toEqual(['ff', 'gg', 'hh']);
		});
	});
});
