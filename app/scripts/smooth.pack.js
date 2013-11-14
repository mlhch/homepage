(function($) {
	var timer, posTo, posFrom, hash, yOffset = 0,
		visibleFromBottom = 100;

	function addEvent(el, name, listener) {
		if (el.addEventListener) return el.addEventListener(name, listener, false)
		if (el.attachEvent) return el.attachEvent('on' + name, listener)
	}

	function onclick(e) {
		hash = this.hash.substr(1);
		var a = document.getElementById(hash);
		if (a) {
			posTo = offsetY(a) - yOffset;
			posFrom = scrollTop();
			timer && clearInterval(timer);
			timer = setInterval(scroll, 10);
		}

		if (window.event) {
			window.event.cancelBubble = true
			window.event.returnValue = false
		} else if (e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	function offsetY(a) {
		var y = a.offsetTop;
		while (a = a.offsetParent) y += a.offsetTop
		return y;
	}

	function scroll() {
		posFrom += (posTo - posFrom) / 10;
		window.scrollTo(0, Math.round(posFrom));
		if (posTo == Math.round(posFrom)) {
			clearInterval(timer)
			setTimeout(function() {
				window.location.hash = hash;
			}, 100);
		}
	}

	function scrollTop() {
		var body = document.body;
		var doc = document.documentElement
		if (body && body.scrollTop) return body.scrollTop;
		if (doc && doc.scrollTop) return doc.scrollTop;
		if (window.pageYOffset) return window.pageYOffset;
		return 0
	}

	function onscroll() {
		var position = scrollTop();
		if (position == 0) {
			return true;
		}
		var sections = document.getElementsByClassName('section');
		for (var i = sections.length - 1, section; section = sections[i--];) {
			if (section.offsetTop - position < $(window).height() - visibleFromBottom) {
				break;
			}
		}
	}

	var links = document.getElementsByTagName('a');
	for (var i = 0, a; a = links[i++];) {
		if (a.href && a.href.indexOf('#') != -1 && ((a.pathname == location.pathname) || ('/' + a.pathname == location.pathname))) {
			addEvent(a, 'click', onclick);
		}
	}

	addEvent(window, 'scroll', onscroll);
	addEvent(window, 'resize', onscroll);
}(jQuery))