const jsdom = require('jsdom');
const canvas = require('canvas-prebuilt');
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

function transformText(line1, line2) {
	var binaryarr = [];
	var lines =[line1, line2];
	lines = lines.filter(line => line != '');
	console.log(lines);
	for (var i = 0; i<lines.length; i++){
		var buffer = document.createElement('canvas');
		var bufContext = buffer.getContext('2d');
		var boxheight = lines.length;
		buffer.width = 96;
		buffer.height = 27/boxheight;

		bufContext.fillStyle = '#FFFFFF';
		bufContext.fillRect(0, 0, 96, 27/boxheight);

		bufContext.textBaseline = 'top';
		bufContext.font = '12px arial';
		bufContext.fillStyle = '#000000';
		bufContext.fillText(lines[i], 0, 0);

		var img = bufContext.getImageData(0, 0, 96, 27/boxheight);

		var answer = '';
		for (var y=0; y<27/boxheight; y++) {
			for (var x=0; x<96; x++) {
				var whichPixel = 96*y + x;
				answer += (img.data[4*whichPixel] < 140) ? 1 : 0; //If the red channel of the pixel is lower than 140, we consider it 'on'
			}
		}
		binaryarr[i] = answer;
	}
	return binaryarr.join("");
}

module.exports = transformText;
