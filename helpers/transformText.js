const jsdom = require('jsdom');

const { JSDOM } = jsdom;
const { document } = new JSDOM('...').window;

/**
 * Transforms array of texts into binary string.
 * @param {!Array<string>} textlines Array of text strings.
 * @return {string} Binary string with 1 and 0 corresponding to lit pixels.
 */
function transformText(textlines) {
  let lines = textlines;
  lines = lines.filter(line => line !== '');
  let binString = '';
  for (let i = 0; i < lines.length; i += 1) {
    const buffer = document.createElement('canvas');
    const bufContext = buffer.getContext('2d');
    buffer.width = process.env.DISPLAY_WIDTH;
    buffer.height = process.env.DISPLAY_HEIGHT / lines.length;

    bufContext.fillStyle = '#FFFFFF';
    bufContext.fillRect(0, 0, buffer.width, buffer.height);

    bufContext.textBaseline = 'top';
    bufContext.font = '12px arial';
    bufContext.fillStyle = '#000000';
    bufContext.fillText(lines[i], 0, 0);

    const img = bufContext.getImageData(0, 0, buffer.width, buffer.height);

    for (let y = 0; y < buffer.height; y += 1) {
      for (let x = 0; x < buffer.width; x += 1) {
        const whichPixel = buffer.width * y + x;
        binString += img.data[4 * whichPixel] < 140 ? 1 : 0; // If the red channel of the pixel is lower than 140, we consider it 'on'
      }
    }
  }
  const remainder = process.env.DISPLAY_HEIGHT % lines.length;
  for (let y = 0; y < remainder; y += 1) {
    for (let x = 0; x < process.env.DISPLAY_WIDTH; x += 1) {
      binString += 0;
    }
  }
  return binString;
}

module.exports = transformText;
