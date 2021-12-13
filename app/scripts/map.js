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


/*
 * @doc http://api.map.baidu.com/lbsapi/creatmap/index.html
 * - 从此页面发现 v1.1 版本不需要密钥
 */
(function() {
    if (location.hostname == 'mlhch.github.io') return;
    var script = document.createElement("script");
    // script.src ="//api.map.baidu.com/api?key=k2ClEG6TKUVu3GrpjyIAK99uvMRaR3DI&v=3.0&callback=initMap";
    script.src ="//api.map.baidu.com/api?v=1.1&callback=initMap";//经实际尝试，v1.1版不会提示：
    // 「百度未授权使用地图API，可能是因为您提供的密钥不是有效的百度LBS开放平台密钥，或此密钥未对本应用的百度地图JavaScriptAPI授权。」
    document.head.appendChild(script);

    var style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule('#map{height:400px;}');
    // foundation.min.css 中的 img, object, embed { max-width:100%; } 会导致百度地图中的图片不显示
    style.sheet.insertRule('#map img {max-width:none;}');

    // https://lbsyun.baidu.com/index.php?title=jspopular3.0/guide/usage 参见异步加载章节
    window.initMap = function initMap() {
        createMap();//创建地图
        setMapEvent();//设置地图事件
        addMapControl();//向地图添加控件
    }

    //创建地图函数：
    function createMap() {
        var map = new BMap.Map("map");//在百度地图容器中创建一个地图
        var point = new BMap.Point(114.362385,36.113131);//定义一个中心点坐标
        map.centerAndZoom(point,12);//设定地图的中心点和坐标并将地图显示在地图容器中
        window.map = map;//将map变量存储在全局
    }

    //地图事件设置函数：
    function setMapEvent() {
        map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
        map.enableScrollWheelZoom();//启用地图滚轮放大缩小
        map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
        map.enableKeyboard();//启用键盘上下左右键移动地图
    }

    //地图控件添加函数：
    function addMapControl() {
        //向地图中添加缩放控件
        var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,type:BMAP_NAVIGATION_CONTROL_SMALL});
        map.addControl(ctrl_nav);
        //向地图中添加比例尺控件
        var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT});
        map.addControl(ctrl_sca);
    }

    // initMap();//创建和初始化地图
})();
