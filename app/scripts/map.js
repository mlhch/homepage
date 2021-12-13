/**
 * @doc https://developers.google.com/maps
 * - 嵌入式地图和静态地图
 * - 动态 iframe「Maps Embed API」：https://developers.google.com/maps/documentation/embed/get-started
 * - 静态图片「Maps Static API」：https://developers.google.com/maps/documentation/maps-static/overview
 * - 参数详解：https://developers.google.com/maps/documentation/embed/embedding-map#place_mode
 * - https://console.cloud.google.com/google/maps-apis/credentials?project=mlhch2016
 */

(function() {
    if (location.hostname != 'mlhch.github.io') return;
    var timer,
        url = 'https://www.google.com/maps/embed/v1/place?' + [
            'q=中国河南省安阳市',
            'center=36.0975%2C114.3931',
            'maptype=satellite',
            'key=AIzaSyBdaDsX1Or8Yg7Uxx1NGM6K_XxiuOoh7Hk'
        ].join('&'),
        html = '<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>';

    var $map = $('#map');
    $map.html(html.replace('><', ' src="' + url + ($map.width() > 700 ? '&zoom=12' : '&zoom=11') + '"><'));
})();
