module.exports = function test(text) {
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	const canvas = require('canvas-prebuilt');


	const { document } = (new JSDOM(`...`)).window;
	
	var buffer = document.createElement('canvas');


	var bufContext = buffer.getContext('2d');

	buffer.width = 96;
	buffer.height = 27;

	bufContext.fillStyle = "#FFFFFF";
	bufContext.fillRect(0, 0, 96, 27);

	bufContext.textBaseline = "top";
	bufContext.font = "12px verdana";

	bufContext.fillStyle = "#000000";
	bufContext.fillText(text, 0, 0);

	var img = bufContext.getImageData(0, 0, 96, 27);

	var bitmap = [];
	for(var i=0;i<96;i++) {
		var cur = [];
		bitmap.push(cur);
		for(var j =0; j<27; j++) {
			cur.push([]);
		}
	}

	for (var y=0; y<27; y++) {
		for (var x=0; x<96; x++) {
			var whichPixel = 96*y + x;

			bitmap[x][y] = (img.data[4*whichPixel] < 140); //If the red channel of the pixel is lower than 140, we consider it "on"
		}
	}
	var answer = "";
	for (var y=0; y<27; y++) {
		for (var x=0; x<96; x++) {
			if (bitmap[x][y]){
				answer = answer + 1;
			}
			else {
				answer = answer + 0;
			}

		}
	}
	//console.log(text);
	//console.log(answer.length);
	return answer;
}