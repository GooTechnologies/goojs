/**
 * Rectangle
 * @hidden
 * @param {number} x
 * @param {number} y
 * @param {number} w Width
 * @param {number} h Height
 */
class Rectangle {
	x: number;
	y: number;
	w: number;
	h: number;
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
}

export = Rectangle;