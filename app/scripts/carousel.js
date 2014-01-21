(function($) {
	$.fn.carousel = function(options, data) {
		return new carousel(this[0], options, data);
	};

	var defaults = {
		width: '100%',
		height: 100,
		itemWidth: 100,
		itemHeight: 100,
		hr: 300, // horizontal radius
		vr: 20, // vertical radius
		resize: true,
		maintainAspectRatio: true,
		crop: false,
		scaleRatio: 0.3,
		mouseScroll: false,
		scrollOnClick: true,
		mouseDrag: false,
		scrollbar: false,
		arrowScrollAmount: 50,
		tooltip: true,
		mouseScrollEase: 90,
		mouseDragEase: 10,
		scrollbarEase: 10,
		scrollSpeed: 10,
		mouseDragSpeed: 20,
		mouseScrollSpeed: 10,
		mouseScrollSpeedHover: 3,
		mouseWheel: false,
		mouseWheelSpeed: 10,
		mouseScrollReverse: false,
		mouseDragReverse: false,
		mouseWheelReverse: false,
		autoScroll: false,
		autoScrollDirection: "next",
		autoScrollDelay: 3E3,
		pauseAutoScrollIfTooltip: true,
		linkTarget: "_blank",
		itemSelect: null,
		itemClick: null,
		itemMouseOver: null,
		scrollStart: null,
		scrollComplete: null
	};

	function carousel(el, options, dataList) {
		var settings = $.extend({}, defaults, options),
			$el = $(el),
			currentItemIndex = 0,
			items = [],
			timer, startAutoScrollTimer, startMouseScrollTimer, startMouseDragTimer,
			startMouseWheelTimer, startBarScrollingTimer,
			// Or settings.mouseScrollSpeedHover when mouse hover
			mouseScrollSpeed = settings.mouseScrollSpeed,
			pageX, pageY,
			isDragScrolling = false,
			isWheelScrolling = false,
			isBarScrolling = false,
			scrollbarPressed = false,
			startAngle = 0,
			isScrolling = false,
			G = false;

		$el.addClass("carousel");
		updateSize(settings.width, settings.height);

		dataList.forEach(function(data, index) {
			var item = $('<img class="carousel-item"/>').appendTo($el);
			items.push(item);
			item.css({
				width: settings.itemWidth,
				height: settings.itemHeight
			}).data({
				w: settings.itemWidth,
				h: settings.itemHeight,
				index: index,
				name: data.name
			}).addClass("out").bind({
				mouseover: function() {
					$(this).hasClass("out") && $(this).removeClass("out").addClass("over");
					settings.tooltip && showTooltip(index);
					if (settings.mouseScroll) mouseScrollSpeed = settings.mouseScrollSpeedHover;
					$.isFunction(settings.itemMouseOver) && settings.itemMouseOver.call(this, {
						type: "itemMouseOver",
						index: index,
						data: data
					});
				},
				mouseout: function() {
					$(this).hasClass("over") && $(this).removeClass("over").addClass("out");
					settings.tooltip && hideTooltip();
					if (settings.mouseScroll) mouseScrollSpeed = settings.mouseScrollSpeed;
				},
				click: function() {
					$el.find(".click").removeClass("click").addClass("out");
					$(this).removeClass("over").addClass("click");
					settings.scrollOnClick && scrollToItem(index);
					$.isFunction(settings.itemClick) && settings.itemClick.call(this, {
						type: "itemClick",
						index: index,
						data: data
					});
				}
			});
			data.link && item.css("cursor", "pointer");
			loadImage(data.url, item)
		});

		settings.autoScroll && startAutoScroll();
		settings.mouseScroll && startMouseScroll();
		settings.mouseDrag && startMouseDrag();
		settings.mouseWheel && startMouseWheel();
		settings.scrollbar && showScrollbar();
		settings.tooltip && $('<div class="tooltip"><p></p></div>').appendTo($el);

		$(document).bind("mousemove", function(event) {
			pageX = event.pageX;
			pageY = event.pageY;
		});
		$(window).resize(function fn(event) {
			$el.css('width', '100%');
			updateSize();
		});

		function updateSize(width, height) {
			settings.width = width || $el.width();
			settings.height = Math.max(height || settings.height || 0, settings.itemHeight + 20);
			$el.css({
				width: settings.width,
				height: settings.height
			});
			settings.width = $el.width();
			settings.hr = (settings.width - settings.itemWidth - 20) / 2;
			settings.vr = (settings.height - settings.itemHeight - 20) / 2;
			transformImageFromAngle(startAngle);
		}

		function loadImage(imgUrl, item) {
			$("<img/>").load(function() {
				var width = parseInt($(this).attr("width") || $(this).prop("width")),
					height = parseInt($(this).attr("height") || $(this).prop("height"));
				var w, h, ratio = width / height;
				if (settings.crop) {
					item.css("background-image", "url(" + imgUrl + ")");
				} else {
					item.attr("src", imgUrl);
					item.css("background-image", "none")
				}
				if (settings.resize) {
					if (settings.maintainAspectRatio) {
						var itemRatio = item.width() / item.height();
						if (ratio < itemRatio) {
							h = item.height();
							w = height * ratio;
							item.data('w', item.data('w') * ratio);
						} else {
							w = item.width();
							h = w / ratio;
							item.data('h', item.data('h') / ratio);
						}
					} else {
						w = settings.itemWidth;
						h = settings.itemHeight;
					}
				}
				item.css({
					top: parseInt(item.css('top')) - (h - item.height()) / 2,
					left: parseInt(item.css('left')) - (w - item.width()) / 2,
					width: w + 4,
					height: h + 4
				});
			}).attr("src", imgUrl);
			transformImageFromAngle(startAngle);
		}

		function transformImageFromAngle(angle) {
			var angleStart = (angle + 90) * Math.PI / 180,
				angleStep = Math.PI * 2 / dataList.length;
			$el.find(".carousel-item").each(function(index) {
				// 正前方为 0 度，所以再加上 90 度才是正规的角度
				var me = $(this),
					itemAngle = angleStart - angleStep * index,
					// sr: 最近处为1，最远处为其设定的值，比如0.4。
					// 半径视为1，则最近离最远为2，则 1+sin(x) 就是指定角度离最远处的距离
					// 所以线性比例算下来就是 sr[起点]+(1-sr)[差值]*(1+sin(x))/2[比例]
					// 或者也可以 1[起点]-(1-sr)[差值]*(1-sin(x))/2[比例]
					scaleRatio = 1 - (1 - settings.scaleRatio) * (1 - Math.sin(itemAngle)) / 2,
					w = me.data("w") * scaleRatio,
					h = me.data("h") * scaleRatio;
				me.css({
					width: w,
					height: h,
					left: Math.cos(itemAngle) * settings.hr + settings.width / 2 - w / 2,
					top: Math.sin(itemAngle) * settings.vr + settings.height / 2 - h / 2,
					// 比例越大越靠前，z-index 越高。要放大足够倍数。
					"z-index": Math.floor(scaleRatio * 10 * dataList.length)
				});
			});
			settings.scrollbar && !scrollbarPressed && updateScrollbar(R())
		}

		function scrollToItem(index) {
			var itemAngle = Math.PI * 2 / dataList.length;
			var angle = itemAngle * (180 / Math.PI) * index % 360;
			startAngle %= 360;
			if (Math.abs(angle - startAngle) > 180) angle += angle > startAngle ? -360 : 360;
			if (angle - startAngle > 180 && angle > startAngle) angle -= 360;
			startScrolling();
			timer = setInterval(function() {
				if (Math.abs(angle - startAngle) > 0.5) {
					startAngle += (angle - startAngle) * (settings.scrollSpeed / 100);
					transformImageFromAngle(startAngle)
				} else stopScrolling()
			}, 30);
			$.isFunction(settings.itemSelect) && settings.itemSelect.call(this, {
				type: "itemSelect",
				index: index,
				data: dataList[index]
			});
		}

		function scrollToNext() {
			scrollToItem(currentItemIndex == dataList.length - 1 ? 0 : currentItemIndex + 1)
		}

		function scrollToPrevious() {
			scrollToItem(currentItemIndex == 0 ? dataList.length - 1 : currentItemIndex - 1)
		}

		function startAutoScroll() {
			if (!(G && settings.pauseAutoScrollIfTooltip)) {
				settings.autoScroll = true;
				startAutoScrollTimer = setTimeout(function() {
					if (settings.autoScrollDirection == "next") scrollToNext();
					else settings.autoScrollDirection == "previous" && scrollToPrevious()
				}, settings.autoScrollDelay)
			}
		}

		function startMouseScroll() {
			settings.mouseScroll = true;
			mouseScrollSpeed = settings.mouseScrollSpeed;
			var left, top, scrollStep = 0,
				width = settings.width,
				height = settings.height,
				sign = settings.mouseScrollReverse ? -1 : 1;
			startMouseScrollTimer = setInterval(function() {
				// 当鼠标位置在区域内的时候
				left = $el.offset().left, top = $el.offset().top;
				if (pageX > left && pageX < left + width && pageY > top && pageY < top + height) {
					scrollStep = sign * (pageX - (left + settings.width / 2)) * (mouseScrollSpeed / 1000);
					startAngle += scrollStep;
					transformImageFromAngle(startAngle)
				} else if (Math.abs(scrollStep) > 0.1) {
					scrollStep *= settings.mouseScrollEase / 100;
					startAngle += scrollStep;
					transformImageFromAngle(startAngle)
				} else {
					scrollStep = 0;
				}
			}, 30)
		}

		function startMouseDrag() {
			var mousemovePageX = 0,
				mousedownPageX = 0;

			function onmousemove(event) {
				mousemovePageX = event.pageX;
				if (!isDragScrolling) {
					startScrolling();
					d()
				}
			}

			function d() {
				isDragScrolling = true;
				startMouseDragTimer = setInterval(function() {
					var dPageX = mousemovePageX - mousedownPageX,
						f = (360 * sign * dPageX / 100 / settings.mouseDragSpeed + e - startAngle) //
						* (settings.mouseDragEase / 100);
					if ((f >= 0 ? f : -f) > 0.1) {
						startAngle += f;
						var itemAngle = Math.PI * 2 / dataList.length;
						currentItemIndex = Math.round(startAngle * Math.PI / 180 / itemAngle);
						transformImageFromAngle(startAngle)
					} else stopScrolling()
				}, 30)
			}
			settings.mouseDrag = true;
			var e = 0,
				offset = $el.offset(),
				top = offset.top,
				left = offset.left,
				right = left + settings.width,
				bottom = top + settings.height,
				sign = settings.mouseDragReverse ? 1 : -1;
			$(document).bind("mousedown", function(event) {
				if (pageX > left && pageX < right && pageY > top && pageY < bottom) {
					mousemovePageX = mousedownPageX = event.pageX;
					e = startAngle;
					$(document).bind("mousemove", onmousemove)
				}
			});
			$(document).bind("mouseup", function() {
				$(document).unbind("mousemove", onmousemove)
			})
		}

		function startMouseWheel() {
			settings.mouseWheel = true;
			var startAngleOrigin = 0,
				sign = settings.mouseWheelReverse ? -1 : 1;
			$el.bind("mousewheel", function(event, dir) {
				event.preventDefault();
				if (!isWheelScrolling) {
					startScrolling();
					isWheelScrolling = true;
					startAngleOrigin = startAngle;
					startMouseWheelTimer = setInterval(function() {
						if (Math.abs(startAngleOrigin - startAngle) > 0.5) {
							startAngle += (startAngleOrigin - startAngle) * (settings.mouseWheelSpeed / 100);
							currentItemIndex = Math.round(startAngle / 360 * dataList.length);
							transformImageFromAngle(startAngle)
						} else {
							stopScrolling();
						}
					}, 30)
				}
				startAngleOrigin += dir * sign * 10
			});
		}

		function showScrollbar() {
			var $scrollbar = $('<div class="scrollbar"></div>').appendTo($el),
				$track = $('<div class="track"></div>').appendTo($scrollbar),
				$thumb = $('<div class="thumb"></div>').appendTo($track),
				$left = $('<div class="left"></div>').appendTo($scrollbar),
				$right = $('<div class="right"></div>').appendTo($scrollbar),
				max = $track.width() - $thumb.width(),
				pos = 0,
				percent = 0,
				ea;

			function sbOnmousemove() {
				pos = pageX - $track.offset().left - ea;
				doScroll()
			}

			function doScroll() {
				pos = Math.max(0, Math.min(max, pos));
				scrollbarPressed && $thumb.css("left", pos + 'px');
				percent = pos / max;
				if (!isBarScrolling) {
					startScrolling();
					isBarScrolling = true;
					startAngle %= 360;
					startBarScrollingTimer = setInterval(function() {
						if (Math.abs(R() - percent) > 0.0010) {
							startAngle += (percent - R()) * (settings.scrollbarEase / 100) * 360;
							currentItemIndex = Math.round(startAngle / 360 * dataList.length);
							transformImageFromAngle(startAngle)
						} else {
							isBarScrolling && stopScrolling();
						}
					}, 30)
				}
			}
			$scrollbar.css({
				top: settings.height / 2 + settings.vr,
				left: settings.width / 2 - $scrollbar.width() / 2
			});
			$thumb.bind("mousedown", function(event) {
				event.preventDefault();
				ea = pageX - $thumb.offset().left;
				scrollbarPressed = true;
				$(document).bind("mousemove", sbOnmousemove)
			});
			$(document).bind("mouseup", function() {
				if (scrollbarPressed) {
					scrollbarPressed = false;
					$(document).unbind("mousemove", sbOnmousemove)
				}
			});
			$left.click(function() {
				pos = $thumb.offset().left - $track.offset().left - settings.arrowScrollAmount;
				doScroll();
			});
			$right.click(function() {
				pos = $thumb.offset().left - $track.offset().left + settings.arrowScrollAmount;
				doScroll()
			});
		}

		function updateScrollbar(b) {
			var $track = $el.find(".scrollbar").find(".track"),
				$thumb = $track.find(".thumb");
			$thumb.css("left", b * (parseInt($track.css("width")) - parseInt($thumb.css("width"))))
		}

		function R() {
			var b = startAngle % 360 / 360;
			if (b < 0) b += 1;
			return b
		}

		function startScrolling() {
			clearAllTimer();
			if (!isScrolling) {
				isScrolling = true;
				$.isFunction(settings.scrollStart) && settings.scrollStart.call(this)
			}
		}

		function stopScrolling() {
			clearAllTimer();
			if (isScrolling) {
				isScrolling = false;
				$.isFunction(settings.scrollComplete) && settings.scrollComplete.call(this)
			}
			settings.mouseScroll && startMouseScroll();
			settings.autoScroll && startAutoScroll()
		}

		function clearAllTimer() {
			startMouseScrollTimer && clearInterval(startMouseScrollTimer);
			if (startMouseDragTimer) {
				isDragScrolling = false;
				clearInterval(startMouseDragTimer)
			}
			if (startMouseWheelTimer) {
				isWheelScrolling = false;
				clearInterval(startMouseWheelTimer)
			}
			if (startBarScrollingTimer) {
				isBarScrolling = false;
				clearInterval(startBarScrollingTimer)
			}
			timer && clearInterval(timer);
			startAutoScrollTimer && clearTimeout(startAutoScrollTimer)
		}

		function showTooltip(index) {
			var tooltipHtml = dataList[index].tooltip;
			if (tooltipHtml) {
				G = true;
				var $tooltip = $el.find(".tooltip").css({
					display: 'block',
					width: 'auto',
					padding: '0px'
				});
				$tooltip.find("p").html(tooltipHtml);
				$tooltip.stop().animate({
					opacity: 1
				}, 300);

				var angleStart = (startAngle + 90) * Math.PI / 180,
					angleStep = Math.PI * 2 / dataList.length,
					itemAngle = angleStart - angleStep * index,
					leftAdjust = $tooltip.outerWidth() / 2 * (-1 - Math.cos(itemAngle));

				var h = 0 - $tooltip.outerHeight() - parseInt($tooltip.css("marginBottom"));
				$tooltip.css({
					left: pageX - $el.offset().left + leftAdjust,
					top: pageY - $el.offset().top + h
				});
				$(document).bind("mousemove.tooltip", function() {
					$tooltip.css({
						left: pageX - $el.offset().left + leftAdjust,
						top: pageY - $el.offset().top + h
					})
				});
				startAutoScrollTimer && settings.pauseAutoScrollIfTooltip && clearTimeout(startAutoScrollTimer)
			}
		}

		function hideTooltip() {
			if (G) {
				G = false;
				var $tooltip = $el.find(".tooltip");
				$tooltip.stop().animate({
					opacity: 0
				}, 200, function() {
					$(document).unbind("mousemove.tooltip");
					$tooltip.css("left", -9999)
				});
				settings.autoScroll && settings.pauseAutoScrollIfTooltip && startAutoScroll()
			}
		}

		this.startAutoScroll = startAutoScroll;
		this.stopAutoScroll = function() {
			settings.autoScroll = false;
			clearTimeout(startAutoScrollTimer)
		};
		this.startMouseScroll = startMouseScroll;
		this.stopMouseScroll = function() {
			settings.mouseScroll = false;
			clearInterval(startMouseScrollTimer)
		};
		this.startMouseDrag = startMouseDrag;
		this.stopMouseDrag = function() {
			isDragScrolling = settings.mouseDrag = false;
			clearInterval(startMouseDragTimer)
		};
		this.startMouseWheel = startMouseWheel;
		this.stopMouseWheel = function() {
			isWheelScrolling = settings.mouseWheel = false;
			clearInterval(startMouseWheelTimer)
		};
		this.scrollToItem = scrollToItem;
		this.scrollToNext = scrollToNext;
		this.scrollToPrevious = scrollToPrevious;
		this.isScrolling = function() {
			return isScrolling;
		}

		this.updateSize = updateSize;
	}
})(jQuery);


require(['config'], function(config) {
	var $showcase = $('#showcase').parent();
	var $snapshot = $showcase.find('.snapshot')
		.bind('mousewheel', function(event, dir) {
			var delta = event.originalEvent.wheelDelta;
			if (delta > 0 && delta <= 600 && this.scrollTop == 0) {
				event.preventDefault();
			}
			if (delta < 0 && delta >= -600 && this.scrollTop + this.offsetHeight == this.scrollHeight) {
				event.preventDefault();
			}
		});

	config.articlesTags(function success(tags) {
		$showcase.find('.loading').attr('class', 'ng-hide');

		var showcases = tags.filter(function(row) {
			return row.match(/^Showcase\|(http:)?\/\//);
		}).map(function(row) {
			var parts = row.split('|'),
				name = parts.pop().replace(/^.*? - /, ''),
				n = parts.length,
				link = 'http:' + parts[1].replace(/^http:/, ''),
				size = n == 4 ? parts[2] : '1200x900';
			return {
				link: config.urls.showcase(link),
				url: config.urls.thumbnail(btoa(link).replace(/\//g, '-'), size),
				snapshot: config.urls.snapshot(btoa(link).replace(/\//g, '-'), size),
				name: name,
				tooltip: name
			};
		})

		var $carousel = $('.carousel');
		var carousel = $carousel.carousel({
			height: 500,
			scaleRatio: 0.6,
			itemWidth: 150,
			itemHeight: 150,
			mouseDrag: true,
			itemClick: function(obj) {
				var data = obj.data;
				if ($snapshot.is(':hidden')) {
					$snapshot.show();
					carousel.updateSize($carousel.width(), 300);
				}
				$snapshot.find('img').attr('src', data.snapshot);
				$snapshot.find('.name').html(data.name);
				data.link && $snapshot.find('a').attr('href', data.link);
			}
		}, showcases);

		document.addEventListener('showcaseSelected', function(e) {
			$carousel.find('img').each(function(i, img) {
				if ($(img).data().name === e.detail) {
					location.hash = '#showcase';
					img.click();
				}
			});
		});
	}, function failure() {
		$showcase.find('.loading')
			.attr('class', 'text-center alert-box warning')
			.html('No response from server');
	});
});