(function () {
	'use strict';

	var DataFormatter = shaderBits.DataFormatter;

	describe('DataFormatter', function () {
		var encode = DataFormatter.encode;
		var decode = DataFormatter.decode;

		var bindFormat = function (format, fun) {
			return function (data) { return fun(data, format); };
		};

		describe('float', function () {
			describe('encode', function () {
				var encodeFloat = bindFormat('float', encode);

				it('encodes a float', function () {
					expect(encodeFloat(0.123)).toEqual('0.123');
				});

				it('encodes an int as a float', function () {
					expect(encodeFloat(123)).toEqual('123.0');
				});
			});

			describe('decode', function () {
				var decodeFloat = bindFormat('float', decode);

				it('decodes a float', function () {
					expect(decodeFloat('123.0')).toEqual(123);
				});
			});
		});

		describe('int', function () {
			describe('encode', function () {
				var encodeInt = bindFormat('int', encode);

				it('encodes a positive int', function () {
					expect(encodeInt(123)).toEqual('123');
				});

				it('encodes a negative int', function () {
					expect(encodeInt(-123)).toEqual('-123');
				});
			});

			describe('decode', function () {
				var decodeInt = bindFormat('int', decode);

				it('decodes a positive int', function () {
					expect(decodeInt('123')).toEqual(123);
				});

				it('decodes a negative int', function () {
					expect(decodeInt('-123')).toEqual(-123);
				});
			});
		});

		describe('vec2', function () {
			describe('encode', function () {
				var encodeVec2 = bindFormat('vec2', encode);

				it('encodes a vec2', function () {
					expect(encodeVec2([0.123, 0.456])).toEqual('vec2(0.123, 0.456)');
				});

				it('encodes a int-ish vec2', function () {
					expect(encodeVec2([123, 456])).toEqual('vec2(123.0, 456.0)');
				});
			});

			describe('decode', function () {
				var decodeVec2 = bindFormat('vec2', decode);

				it('decodes a vec2', function () {
					expect(decodeVec2('vec2(0.123, 0.456)')).toEqual([0.123, 0.456]);
				});
			});
		});
	});
})();
