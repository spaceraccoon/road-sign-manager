var getPixels = require("get-pixels")

function transformImage(imageURL) {

	var binString = "";

	getPixels(imageURL, function(err, pixels) {
		if (err) {
			console.log("Bad image path");
			return;
		}
		console.log("got pixels", pixels.shape.slice());

		var width = pixels.shape[0], height = pixels.shape[1]

		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {
				rgb = pixels.get(i, j);
				binString.concat((rgb & 0xff000000).toString());
			}
		}

	});



  //
	// var arrToConvert = [[0,0,1],[2,3,3],[4,4,5]];
	// var newArr = [];
  //
  //
	// for(var i = 0; i < arrToConvert.length; i++)
	// {
	//     newArr = newArr.concat(arrToConvert[i]);
	// }
  //
	// console.log(newArr);
	console.log(binString);

	return binString;
}

module.exports = transformImage;

// function whites(image) {
//     return image & 0xff000000;
// }
//
// function myFunction() {
//     document.getElementById("demo").innerHTML = ages.filter(checkAdult);
// }

// image = "https://pbs.twimg.com/profile_images/839721704163155970/LI_TRk1z_400x400.jpg"
// transformImage(image);
