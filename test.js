const jsdom = require("jsdom");
const { JSDOM } = jsdom;
require('canvas');

var dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
var document = dom.window.document;

var buffer = document.createElement('canvas');
console.log(buffer);
var bufContext = buffer.getContext("2d");
console.log(bufContext);

buffer.width = 60;
buffer.height = 20;

bufContext.fillStyle = "#FFFFFF";
bufContext.fillRect(0, 0, 60, 20);

bufContext.textBaseline = "top";
bufContext.font = "12px verdana";
bufContext.fillStyle = "#000000";
bufContext.fillText("the game", 0, 0);

var img = bufContext.getImageData(0, 0, 60, 20);

var bitmap = [];
for(var i=0;i<60;i++) {
	var cur = [];
	bitmap.push(cur);
	for(var j =0; j<20; j++) {
		cur.push([]);
	}
}

for (var y=0; y<20; y++) {
	for (var x=0; x<60; x++) {
		var whichPixel = 60*y + x;

		bitmap[x][y] = (img.data[4*whichPixel] < 140); //If the red channel of the pixel is lower than 140, we consider it "on"
	}
}
