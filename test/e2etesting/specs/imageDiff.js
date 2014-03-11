var fs = require('fs')
,  	Canvas = require('canvas')
,  	Image = Canvas.Image

/**
 * Compares 2 image files by looking at the pixel data.
 * @param  {string} path1
 * @param  {string} path2
 * @return {number}       Diff value, normalized to [0,1]
 */
exports.compare = function(path1, path2){

	var data1 = loadFilePixelData(path1);
	var data2 = loadFilePixelData(path2);

	console.log("the data:",data1,data2);

	var result = 0;

	return result;
};

function loadFilePixelData(path){
	var data2 = fs.readFileSync(path2);

	var canvas = new Canvas(10,10);
  	var ctx = canvas.getContext('2d');

	img = new Image;
	img.src = squid;
	ctx.drawImage(img, 0, 0, 10,10);
	return ctx.getImageData(0, 0, 10, 10).data;
}
