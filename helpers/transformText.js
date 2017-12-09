const jsdom = require('jsdom');
const canvas = require('canvas-prebuilt');
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

function transformText(lines) {
  lines = lines.filter(line => line != '');
  var answer = '';
  for (var i = 0; i < lines.length; i++) {
    var buffer = document.createElement('canvas');
    var bufContext = buffer.getContext('2d');
    buffer.width = process.env.DISPLAY_WIDTH;
    buffer.height = process.env.DISPLAY_HEIGHT / lines.length;

    bufContext.fillStyle = '#FFFFFF';
    bufContext.fillRect(0, 0, buffer.width, buffer.height);

    bufContext.textBaseline = 'top';
    bufContext.font = '12px arial';
    bufContext.fillStyle = '#000000';
    bufContext.fillText(lines[i], 0, 0);

    var img = bufContext.getImageData(0, 0, buffer.width, buffer.height);

    for (var y = 0; y < buffer.height; y++) {
      for (var x = 0; x < buffer.width; x++) {
        var whichPixel = buffer.width * y + x;
        answer += (img.data[4 * whichPixel] < 140) ? 1 : 0; //If the red channel of the pixel is lower than 140, we consider it 'on'
      }
    }
  }
  var remainder = process.env.DISPLAY_HEIGHT % lines.length;
  for (var y = 0; y < remainder; y++) {
    for (var x = 0; x < process.env.DISPLAY_WIDTH; x++) {
      answer += 0;
    }
  }
  return answer;
}

module.exports = transformText;