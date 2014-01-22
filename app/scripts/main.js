require({
    waitSeconds: 0,
    map: {
        '*': {
            'css': 'require-css/css.min'
        }
    },
    paths: {
        d3: 'd3/d3'
    },
    shim: {
        fancybox: {
            deps: ['fancybox/source/jquery.fancybox.pack', 'css!fancybox/source/jquery.fancybox'],
            exports: '$.fancybox'
        },
        'd3': {
            exports: 'd3'
        }
    },
    baseUrl: 'bower_components'
});
