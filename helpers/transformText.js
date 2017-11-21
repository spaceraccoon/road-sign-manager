const jsdom = require('jsdom');
const canvas = require('canvas-prebuilt');

const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

function transformText(text) {
	var buffer = document.createElement('canvas');
	var bufContext = buffer.getContext('2d');

	buffer.width = 96;
	buffer.height = 27;

	bufContext.fillStyle = '#FFFFFF';
	bufContext.fillRect(0, 0, 96, 27);

	bufContext.textBaseline = 'top';
	bufContext.font = '12px verdana';

	bufContext.fillStyle = '#000000';
	bufContext.fillText(text, 0, 0);

	var img = bufContext.getImageData(0, 0, 96, 27);

	var answer = '';
	for (var y=0; y<27; y++) {
		for (var x=0; x<96; x++) {
			var whichPixel = 96*y + x;
			answer += (img.data[4*whichPixel] < 140) ? 1 : 0; //If the red channel of the pixel is lower than 140, we consider it 'on'
		}
	}

	return answer;
}

module.exports = transformText;
