"use strict";

function getData(url) {
	return new Promise(function (resolve, reject) {
		var request = new XMLHttpRequest();

		request.open('GET', url, true); // no-cache
		request.onload = function () {
			if (request.status === 200) {
				resolve(request.response);
			} else {
				reject(Error(request.statusText));
			}
		};

		request.onerror = function () {
			reject(Error('Network Error'));
		};
		request.send();
	});
}

getData('../test.json').then(function (data) {
	var baseImages = JSON.parse(data);
	startGallery(baseImages);
});

function startGallery(baseImages) {
	var images = baseImages.data;
	var form = document.getElementsByTagName('form');
	var button = form[0].getElementsByTagName('button');
	button[0].onclick = addImage;
	var data = document.getElementsByTagName('input');
	var preClick = void 0;

	function addImage() {
		validateTitle();
		validateURL();
		if (data[0].value != "" && data[1].value != "") {
			if (/(https?\:\/{2})(([a-z0-9-]+\.)+[a-z0-9]{2,6})/.test(data[1].value)) {
				images[images.length] = { "title": "", "url": "", "email": "", "rate": "" };
				images[images.length - 1].title = data[0].value;
				images[images.length - 1].url = data[1].value;
				addPreview();
				preClick[preClick.length - 1].click();
				data[0].value = "";
				data[1].value = "";
			}
		}
	}

	data[1].addEventListener("change", validateTitle, false);
	function validateTitle() {
		if (data[0].value != '') {
			data[0].style.border = '1px solid #686A6B';
		} else {
			data[0].style.border = '1px solid red';
		};
	}

	data[1].addEventListener("change", validateURL, false);
	function validateURL() {
		if (/(https?\:\/{2})(([a-z0-9-]+\.)+[a-z0-9]{2,6})/.test(data[1].value)) {
			data[1].style.border = '1px solid #686A6B';
		} else {
			data[1].style.border = '1px solid red';
		};
	}

	var slide = document.getElementsByClassName('slide');
	button[1].onclick = removeImage;
	function removeImage() {
		images.splice(+slide[0].dataset.index, 1);
		addPreview();
		preClick[+slide[0].dataset.index - 1].click();
	}

	var preview = document.getElementsByClassName('images');
	function addPreview() {
		if (images.length > 0) {
			preview[0].innerHTML = "";
			var fragment = void 0,
			    currentDiv = void 0;
			fragment = document.createDocumentFragment();
			images.forEach(function (argument, index) {
				currentDiv = document.createElement('div');
				currentDiv.setAttribute("class", "preview");
				currentDiv.setAttribute("data-index", index);
				if (argument.url) {
					var bg = 'url(' + argument.url + ') center center no-repeat';
					currentDiv.style.background = bg;
					currentDiv.style.backgroundSize = "cover";
				}
				fragment.appendChild(currentDiv);
			});
			preview[0].appendChild(fragment);
			preview[0].style.width = (images.length - 1) * 98 + 83 + "px";
		}
		findSelectImage();
	}
	addPreview();

	preview[0].parentNode.addEventListener('wheel', scrollPreview);
	function scrollPreview(e, delta) {
		if (e.deltaY == 100) {
			this.scrollLeft -= 15;
		} else {
			this.scrollLeft += 15;
		}
	}

	function findSelectImage() {
		preClick = document.getElementsByClassName('preview');
		for (var i = 0; i < preClick.length; i++) {
			preClick[i].onclick = selectImage;
		}
	}
	findSelectImage();

	var title = document.getElementsByTagName('h2');
	var inputRange = document.querySelector("input[type='range']");
	if (images.length > 0) {
		preClick[0].click();
	}

	function selectImage() {
		var bg = 'url(' + images[this.dataset.index].url + ') center center no-repeat';
		slide[0].style.background = bg;
		slide[0].style.backgroundSize = "cover";
		slide[0].setAttribute("data-index", this.dataset.index);
		var titleImage = images[this.dataset.index].title;
		if (titleImage.length > 20) {
			titleImage = titleImage.substring(0, 18) + '...';
		}
		title[0].innerText = titleImage;
		if (images[this.dataset.index].email != undefined) {
			data[2].value = images[this.dataset.index].email;
		} else {
			data[2].value = "";
		}
		inputRange.value = images[this.dataset.index].rate;
		changeSmile();
		this.className = "preview selected";
		for (var i = 0; i < preClick.length; i++) {
			if (preClick[i] != this) {
				preClick[i].className = "preview notselected";
			} else {
				continue;
			}
		}
		this.parentNode.parentNode.scrollLeft = +this.dataset.index * 20;
	}

	var leftToggle = document.getElementsByClassName('left-toggle');
	leftToggle[0].onclick = prevImage;

	function prevImage() {
		if (+slide[0].dataset.index > 0) {
			preClick[+slide[0].dataset.index - 1].click();
		}
	}

	var rightToggle = document.getElementsByClassName('right-toggle');
	rightToggle[0].onclick = nextImage;

	function nextImage() {
		if (+slide[0].dataset.index < images.length - 1) {
			preClick[+slide[0].dataset.index + 1].click();
		} else {
			loadAsync('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&api_key=9c0b191a1d8415714a70a2a3db4abdeb&extras=url_m&text=nature').then(function (data) {
				var flikrImages = JSON.parse(data).photos.photo;
				var indexImage = 0;
				var item = flikrImages[indexImage];
				images.forEach(function (elem, index) {
					if (elem.url == item.url_m) {
						indexImage++;
						item = flikrImages[indexImage];
					}
				});
				images[images.length] = { "title": "", "url": "", "email": "", "rate": "" };
				images[images.length - 1].title = item.title;
				images[images.length - 1].url = item.url_m;
				addPreview();
				preClick[preClick.length - 1].click();
				document.getElementsByClassName('images-container')[0].scrollLeft = 9999;
			});
		}
	}

	function loadAsync(url) {
		return new Promise(function (resolve, reject) {
			var request = new XMLHttpRequest();

			request.open('GET', url + (/\?/.test(url) ? '&' : '?') + new Date().getTime(), true); // no-cache
			request.onload = function () {
				if (request.status === 200) {
					resolve(request.response);
				} else {
					reject(Error(request.statusText));
				}
			};

			request.onerror = function () {
				reject(Error('Network Error'));
			};
			request.send();
		});
	}

	inputRange.addEventListener("change", changeSmile, false);
	function changeSmile() {
		if (inputRange.value <= 100) {
			inputRange.className = "verygood";
		}
		if (inputRange.value < 80) {
			inputRange.className = "good";
		}
		if (inputRange.value < 60) {
			inputRange.className = "neutrally";
		}
		if (inputRange.value < 40) {
			inputRange.className = "bad";
		}
		if (inputRange.value < 20) {
			inputRange.className = "verybad";
		}
	}
	var button2 = form[1].getElementsByTagName('button');
	button2[0].onclick = addRate;
	form[1].addEventListener("submit", function () {
		event.preventDefault();
	}, false);
	data[1].addEventListener("change", validateInputEmail, false);

	function validateInputEmail() {
		if (/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(data[2].value)) {
			data[2].style.border = '1px solid #686A6B';
		} else {
			data[2].style.border = '1px solid red';
		};
	}

	function addRate() {
		validateInputEmail();
		if (data[2].value != "") {
			if (/^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(data[2].value)) {
				images[+slide[0].dataset.index].email = data[2].value;
				images[+slide[0].dataset.index].rate = inputRange.value;
			}
		}
	}
}