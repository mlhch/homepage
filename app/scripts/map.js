(function() {
    var timer,
        url = ['http://ditu.google.cn/maps?f=q',
            '&source=s_q&hl=en-US&geocode=',
            '&q=%E6%B2%B3%E5%8D%97%E7%9C%81%E5%AE%89%E9%98%B3%E5%B8%82',
            '&aq=&brcurrent=3,0x31508e64e5c642c1:0x951daa7c349f366f,1%3B5,0,0',
            '&brv=25.1-b20b3018_4134eab6_98868b16_719d4a7b_295494d9',
            '&sll=34.759666,113.752441&sspn=11.847635,16.567383',
            '&t=m&g=%E6%B2%B3%E5%8D%97%E7%9C%81&ie=UTF8&hq=',
            '&hnear=%E6%B2%B3%E5%8D%97%E7%9C%81%E5%AE%89%E9%98%B3%E5%B8%82',
            '&ll=30,10&spn=106.729155,225&iwloc=near&output=embed'
        ].join(''),
        html = '<iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>';

    var $map = $('#map');
    $map.html(html.replace('><', ' src="' + url + ($map.width() > 700 ? '&z=2' : '&z=1') + '"><'));
    return;
    $(window).resize(function fn() {
        timer && clearTimeout(timer);
        timer = setTimeout(resizeMap, 500);
    });

    function resizeMap() {
        var $iframe = $map.find('iframe'),
            z = $iframe.attr('src').match(/z=(\d)(&|$)/)[1];

        z == 2 && $map.width() < 700 && $iframe.attr('src', url + '&z=1');
        z == 1 && $map.width() > 700 && $iframe.attr('src', url + '&z=2');
    }
})();