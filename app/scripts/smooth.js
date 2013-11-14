(function($) {

	$.fn.smooth = function(options) {
		return new smooth(this[0], options);
	}

	var defaults = {
		anchorSelector: '.section .anchor'
	};

	function smooth(el, options) {
		var settings = $.extend({}, defaults, options),
			$menu = $(el),
			$first = $menu.find('a:first'),
			$last = $menu.find('a:last'),
			$anchors = $(settings.anchorSelector),
			$indicator = $('<div class="indicator"></div>').insertAfter($menu);

		if ($anchors.length < 2) {
			return;
		}

		$indicator.css({
			top: $menu.offset().top + $menu.height() + 'px',
			left: menuTextLeft($first) + 'px',
			width: $first.width() + 'px',
		});

		$(window).scroll(onWindowScroll);
		$(window).resize(onWindowScroll);

		$menu.find('a').click(function(event) {
			scrollTo(this.hash);
			event.preventDefault();
		});

		function onWindowScroll() {
			var scrollPos = $(window).scrollTop(),
				windowHeight = $(window).height();

			var anchorNow, anchorNext, $menuNow, $menuNext;
			for (var i = $anchors.length - 1; anchor = $anchors[i]; i--) {
				if (!anchorNow && (scrollPos >= anchor.offsetTop || i == 0)) {
					anchorNow = anchor;
					if (i < $anchors.length - 1) {
						anchorNext = $anchors[i + 1];
					}
					break;
				}
			}

			if (location.hash !== '#' + anchorNow.id) {
				settings.onSectionChange && settings.onSectionChange(anchorNow.id);
				var id = anchorNow.id;
				var $existing = $('#' + id);
				$existing.length && $existing.attr('id', '');
				location.hash = '#' + id;
				$existing.length && $existing.attr('id', id);
			}

			$menuNow = $menu.find('a[href="#' + anchorNow.id + '"]');
			$menuNext = anchorNext && $menu.find('a[href="#' + anchorNext.id + '"]');

			var percent, indicatorOffset, indicatorWidth;
			var offsetTop = Math.max(0, anchorNow.offsetTop);
			if (scrollPos < 0) {
				// over top
				percent = 1 + scrollPos / 100;
				indicatorOffset = 0;
				indicatorWidth = $menuNow.width() * percent;
			} else if (scrollPos > document.body.offsetHeight - windowHeight) {
				// over bottom
				percent = (scrollPos - (document.body.offsetHeight - windowHeight)) / 100;
				indicatorOffset = $menuNow.width() * percent;
				indicatorWidth = $menuNow.width() * (1 - percent);
			} else if (!anchorNext) {
				// last section
				scrollPos -= 81;
				indicatorOffset = 0;
				indicatorWidth = $menuNow.width();
			} else {
				percent = (scrollPos - offsetTop) / (anchorNext.offsetTop - Math.max(0, anchorNow.offsetTop));
				indicatorOffset = ($menuNext.offset().left - $menuNow.offset().left) * percent;
				indicatorWidth = $menuNow.width() + ($menuNext.width() - $menuNow.width()) * percent
			}
			$indicator.css({
				left: menuTextLeft($menuNow) + indicatorOffset + 'px',
				width: indicatorWidth + 'px'
			});
		}

		function menuTextLeft($el) {
			return $el.offset().left + ($el.outerWidth() - $el.width()) / 2;
		}

		var timer;

		function scrollTo(selector) {
			var $scrollTo = $(selector),
				posTo = $scrollTo.offset().top,
				posFrom = $(window).scrollTop();
			timer && clearInterval(timer);
			timer = setInterval(function() {
				posFrom += (posTo - posFrom) / 10;
				window.scrollTo(0, Math.round(posFrom));
				if (posTo == Math.round(posFrom)) {
					clearInterval(timer)
					selector.match(/^#.+$/) && setTimeout(function() {
						window.location.hash = selector;
					}, 100);
				}
			}, 10);
		}

		this.scrollTo = scrollTo;
	}

}(jQuery));

$(document).ready(function() {
	var smooth = $('.menu').smooth({
		onSectionChange: function(id) {
			$('.menu').parent().find('select').val('#' + id);
		}
	});
	$('.menu').parent().find('select').change(function(a) {
		smooth.scrollTo(this.value)
	});
});