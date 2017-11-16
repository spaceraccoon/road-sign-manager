var getPixels = require("get-pixels")
var ndarray = require("ndarray")

function transformImage(imageURL) {

	getPixels(imageURL, function(err, pixels) {
		if (err) {
			console.log("Bad image path");
			return;
		}
		console.log("got pixels", pixels.shape.slice());

		var binString = "";
		var image = "";
		var threshold = 140;
		var image_width = 96;
		var image_height = 27;

		var width = pixels.shape[0], height = pixels.shape[1]
		console.log(pixels.shape);
		for (var i = 0; i < image_height; i++) {
			for (var j = 0; j < image_width; j++) {
				rgb = [];
				for (var k = 0; k < 3; k++) {
						rgb.push(pixels.get(i, j, k));
						// binString.concat((rgb & 0xff000000).toString());
				}
				if (rgb[0] < threshold || rgb[1] < threshold || rgb[2] < threshold)
				{
						binString += "1";
				}
				else
				{
						binString += "0";
				}
			}
		}
		console.log(binString.length);
		return binString;
	});

}

module.exports = transformImage;
// https://secure.gravatar.com/avatar/6c96a0adccf3dfa55695b0fead298d7f?s=96&d=mm&r=pg
// http://iconshow.me/media/images/xmas/standard-new-year-icons/128/Snowflake-icon.png
// image = "https://pbs.twimg.com/profile_images/839721704163155970/LI_TRk1z_400x400.jpg"
// transformImage(image);
