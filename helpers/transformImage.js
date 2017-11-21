var getPixels = require("get-pixels")
var ndarray = require("ndarray")

// jpg test
// https://secure.gravatar.com/avatar/90e9dac0543d142d0dbbfb1f6e9523c8?s=96&d=mm&r=pg

// png test
// http://icons.iconarchive.com/icons/graphicloads/100-flat-2/96/email-icon.png

// function to export to message.js
function transformImage(imageURL) {
	return new Promise(function(fulfill, reject) {
		pixelGetter(imageURL).then(function(res) {
			console.log(res);
			fulfill(res);
		}).catch(function(err) {
			reject(err);
		});
	});
}

// wrapper to get pixels of image at buffer
function pixelGetter(imageURL) {
	return new Promise(function(fulfill, reject) {
		getPixels(imageURL, function(err, pixels) {
			if (err) {
				console.log("Bad image path");
				reject(err);
			}
			else {
				string = processPixels(pixels);
				fulfill(string);
			}
		});
	})
}

// function to process the pixels
// pixels is represented in ndarray
function processPixels(pixels) {

	// initialise parameters
	var binString = "";
	var threshold = 170;
	var image_width = 96;
	var image_height = 27;
	var height_offset = 30;

	// iterate over height and width
	for (var i = height_offset; i < image_height + height_offset; i++) {
		for (var j = 0; j < image_width; j++) {

			// create list of the rgb triple
			rgb = [];
			for (var k = 0; k < 4; k++) {
					rgb.push(pixels.get(j, i, k));
			}

			// set string to 1 if any rgb value below threshold and opacity not 0 (for png)
			if ((rgb[0] < threshold || rgb[1] < threshold || rgb[2] < threshold) && rgb[3] != 0)
			{
					binString += "1";
			}
			else
			{
					binString += "0";
			}
		}
	}
	return binString;
}

module.exports = transformImage;
