require({
    waitSeconds: 0,
    map: {
        '*': {
            'css': 'require-css/css.min'
        }
    },
    paths: {
        d3: 'd3/d3.min'
    },
    shim: {
        'd3': {
            exports: 'd3'
        }
    },
    baseUrl: 'bower_components'
});

define('fancybox', [
    'fancybox/source/jquery.fancybox.pack',
    'css!fancybox/source/jquery.fancybox'
], function() {
    return $.fancybox;
});
