define(
[
		"goo/util/ColorUtil"
], function(
	ColorUtil) {
	"use strict";

	beforeEach(function() {
		this.addMatchers({
			arrayCloseTo: function(expected, precision) {
				precision = precision || 2;
				var multiplier = Math.pow(10, precision);

				for (var i = 0; i < this.actual.length; i++) {
					var calcActual = Math.round(this.actual[i] * multiplier);
					var calcExpected = Math.round(expected[i] * multiplier);
					// console.log(calcActual, calcExpected);
					if (calcActual !== calcExpected) {
						return false;
					}
				}

				return true;
			}
		});
	});
	describe("ColorUtil", function() {
		it("Hex to array", function() {
			expect(ColorUtil.hexToArray(0xff0000)).toEqual([1, 0, 0]);
			expect(ColorUtil.hexToArray(0x00ff00)).toEqual([0, 1, 0]);
			expect(ColorUtil.hexToArray(0x0000ff)).toEqual([0, 0, 1]);
			expect(ColorUtil.hexToArray(ColorUtil.color.aqua)).toEqual([0, 1, 1]);
			expect(ColorUtil.hexToArray(ColorUtil.color.blue)).toEqual([0, 0, 1]);

			expect(ColorUtil.hexToArray(0x4080c0)).arrayCloseTo([0.25, 0.5, 0.75]);
		});

		it("CSS rgb(int, int, int) to array", function() {
			expect(ColorUtil.cssToArray("rgb(255, 0, 0)")).toEqual([1, 0, 0]);
			expect(ColorUtil.cssToArray("rgb(0,128,0)")).arrayCloseTo([0, 0.5, 0], 2);
			expect(ColorUtil.cssToArray("rgb( 0 , 0 , 64 )")).arrayCloseTo([0, 0, 0.25], 2);
		});

		it("CSS rgb(int%, int%, int%) to array", function() {
			expect(ColorUtil.cssToArray("rgb(100%, 0%, 0%)")).toEqual([1, 0, 0]);
			expect(ColorUtil.cssToArray("rgb(0%, 50%, 0%)")).arrayCloseTo([0, 0.5, 0], 2);
			expect(ColorUtil.cssToArray("rgb(0%, 0%, 25%)")).arrayCloseTo([0, 0, 0.25], 2);
		});

		it("CSS hex 6 to array", function() {
			expect(ColorUtil.cssToArray("#ff0000")).toEqual([1, 0, 0]);
			expect(ColorUtil.cssToArray("#008000")).arrayCloseTo([0, 0.5, 0], 2);
			expect(ColorUtil.cssToArray("#000040")).arrayCloseTo([0, 0, 0.25], 2);
		});

		it("CSS hex 3 to array", function() {
			expect(ColorUtil.cssToArray("#f00")).toEqual([1, 0, 0]);
			expect(ColorUtil.cssToArray("#080")).arrayCloseTo([0, 0.53, 0], 2);
			expect(ColorUtil.cssToArray("#004")).arrayCloseTo([0, 0, 0.27], 2);
		});
	});
});