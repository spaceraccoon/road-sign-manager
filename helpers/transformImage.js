const getPixels = require("get-pixels")

function transformImage(imageURL) {
	return new Promise(function(resolve, reject) {
		getPixels(imageURL, function(err, pixels) {
			if (err) {
				reject(err);
			}	else {
				resolve(processPixels(pixels));
			}
		});
	});
}

// Converts pixels into a binary string based on a color threshold
function processPixels(pixels) {
	var binString = '';
	const threshold = 170;
	var height_offset = 30;

	for (var i = height_offset; i < parseInt(process.env.DISPLAY_HEIGHT) + height_offset; i++) {
		for (var j = 0; j < parseInt(process.env.DISPLAY_WIDTH); j++) {
			rgb = [];
			for (var k = 0; k < 4; k++) {
				rgb.push(pixels.get(j, i, k));
			}

			// Set string to 1 if any rgb value below threshold and opacity not 0 (for png)
			binString += ((rgb[0] < threshold || rgb[1] < threshold || rgb[2] < threshold) && rgb[3] != 0) ? 1 : 0;
		}
	}

	return binString;
}

module.exports = transformImage;
