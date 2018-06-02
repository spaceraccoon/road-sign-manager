const jimp = require('jimp');

/**
 * Converts pixels into a binary string based on a color threshold.
 * @param {*} image 
 * @return {string} Binary string with 1 and 0 corresponding to lit pixels.
 */
function processPixels(image) {
  let binString = '';
  const threshold = 170;

  for (let i = 0; i < parseInt(process.env.DISPLAY_HEIGHT, 10); i += 1) {
    for (let j = 0; j < parseInt(process.env.DISPLAY_WIDTH, 10); j += 1) {
      const hex = image.getPixelColor(j, i);
      const rgb = jimp.intToRGBA(hex);

      // Set string to 1 if any rgb value below threshold and opacity not 0
      // (for png).
      binString +=
        (rgb.r < threshold || rgb.g < threshold || rgb.b < threshold) &&
        rgb.a !== 0
          ? 1
          : 0;
    }
  }
  return binString;
}

/**
 * Transforms image data from given image URL into binary string.
 * @param {string} imageURL 
 * @return {!Promise} Promise that resolves with binary string or rejects with
 * error.
 */
function transformImage(imageURL) {
  return new Promise((resolve, reject) => {
    jimp.read(imageURL, (err, image) => {
      if (err) {
        reject(err);
      } else {
        image.contain(
          parseInt(process.env.DISPLAY_WIDTH, 10),
          parseInt(process.env.DISPLAY_HEIGHT, 10),
          jimp.HORIZONTAL_ALIGN_CENTER,
          jimp.VERTICAL_ALIGN_MIDDLE,
        );
        resolve(processPixels(image));
      }
    });
  });
}

module.exports = transformImage;
