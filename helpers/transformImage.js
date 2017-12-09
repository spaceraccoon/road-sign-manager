const jimp = require("jimp");

function transformImage(imageURL) {
  return new Promise(function (resolve, reject) {
    jimp.read(imageURL, function(err, image) {
      if (err) {
        reject(err);
      }
      else {
        image.contain(parseInt(process.env.DISPLAY_WIDTH), parseInt(process.env.DISPLAY_HEIGHT), jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE);
        image.write("image.jpg");
        resolve(processPixels(image));
      }
    });
  });
}

// Converts pixels into a binary string based on a color threshold
function processPixels(image) {
  var binString = '';
  const threshold = 170;

  for (var i = 0; i < parseInt(process.env.DISPLAY_HEIGHT); i++) {
    for (var j = 0; j < parseInt(process.env.DISPLAY_WIDTH); j++) {
      hex = image.getPixelColor(j, i)
      rgb = jimp.intToRGBA(hex)

      // Set string to 1 if any rgb value below threshold and opacity not 0 (for png)
      binString += ((rgb.r < threshold || rgb.g < threshold || rgb.b < threshold) && rgb.a != 0) ? 1 : 0;
    }
  }

  return binString;
}

module.exports = transformImage;
