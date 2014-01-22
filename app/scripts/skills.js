require(['d3', 'config'], function(d3, config) {
    var containerHeight = 700,
        container = d3.select(d3.select('#skills').node().parentNode).append('div')
            .style('height', containerHeight + 'px')
            .style('overflow', 'hidden')
            .style('border', '1px solid silver'),
        containerWidth = container.node().getBoundingClientRect().width,
        canvasWidth = containerWidth + 0,
        canvasHeight = containerHeight + 0,
        canvas = container.append('div'),
        svg = canvas.append('svg')
            .attr('width', canvasWidth).attr('height', canvasHeight)
            .style({
                left: -(canvasWidth - containerWidth) / 2 + 'px',
                top: -(canvasHeight - containerHeight) / 2 + 'px',
                position: 'relative'
            });


    config.articlesTags(function success(res) {

        // 手动指定固定于中心点的 Skills 节点
        var width = canvasWidth,
            height = canvasHeight,
            links = [],
            nodes = [{
                name: 'Skill',
                displayName: '',
                links: [],
                categories: {},
                fixed: true,
                x: width / 2,
                y: height / 2,
                radius: 40,
                charge: -300
            }];
        parseNodesAndLinks(res, nodes, links);
        prepareNodesAndLinks(nodes, links);

        /**
         * 配置 force
         */
        var force = d3.layout.force().size([width, height]).gravity(0.05)
            .nodes(nodesFilter(nodes)).links(linksFilter(links))
            .linkStrength(function fn(link) {
                return link.strength;
            }).linkDistance(function fn(link) {
                return link.distance;
            }).charge(function fn(node) {
                return node.charge;
            });
        drawNodesAndLinks(force);

        /**
         * 动画设计
         */
        force.start().on('tick', function(options) {
            // 每次 tick 都要重新把所有节点四分化
            var q = d3.geom.quadtree(force.nodes());
            force.nodes().forEach(function(node) {
                q.visit(collide(node, options.alpha));
            });

            // 避免挤出画面
            var alpha = 0.1; //options.alpha;
            force.nodes().forEach(function(node) {
                var d = 50;
                node.x < d && (node.x += (d - node.x) * alpha);
                node.x > width - d && (node.x += (width - d - node.x) * alpha);
                node.y < d && (node.y += (d - node.y) * alpha);
                node.y > height - d && (node.y += (height - d - node.y) * alpha);
            });

            // 画节点
            svg.selectAll('.node').each(function fn(node) {
                d3.select(this).attr("transform", "translate(" + node.x + "," + node.y + ")");

                if (node.group === 'skill') {
                    var dx = node.x - width / 2,
                        dy = node.y - height / 2,
                        a = Math.atan2(dx, dy),
                        // here because the bug for can't selecting foreignObject
                        t = this.childNodes[2],
                        f = this.childNodes[1],
                        x = node.width / node.scale * (dx > 0 ? -1 : 0) + (dx > 0 ? -5 : 5),
                        y = node.height / node.scale * (dy > 0 ? 0 : 1);
                    f.setAttribute('x', x - 4);
                    f.setAttribute('y', y - 12);
                    t.setAttribute('x', x);
                    t.setAttribute('y', y);
                } else if (node.name !== 'Skill') {
                    var link = node.links[0],
                        dx = link.target.x - link.source.x,
                        dy = link.target.y - link.source.y,
                        t = this.childNodes[2],
                        f = this.childNodes[1],
                        x = node.width / node.scale * (dx > 0 ? 0 : -1) + (dx > 0 ? 3 : -3),
                        y = node.height / node.scale * (dy > 0 ? 1 : 0) - 4;
                    f.setAttribute('x', x - 4)
                    f.setAttribute('y', y - 12);
                    t.setAttribute('x', x);
                    t.setAttribute('y', y);
                }
            });

            // 画连线
            svg.selectAll('.link').each(function fn(link) {
                d3.select(this).attr({
                    x1: link.source.x,
                    y1: link.source.y,
                    x2: link.target.x,
                    y2: link.target.y
                });
            });
        });

        $('.skills :checkbox').change(function(event) {
            force.nodes(nodesFilter(nodes)).links(linksFilter(links));
            drawNodesAndLinks(force);
            force.start();
        });
    });

    function nodesFilter(nodes) {
        var checked = [];
        $('.skills :checkbox').each(function fn(index, el) {
            el.checked && checked.push(el.name);
        });
        return nodes.filter(function(node) {
            return checked.some(function fn(category) {
                return node.categories && node.categories[category];
            });
        });
    }

    function linksFilter(links) {
        var checked = [];
        $('.skills :checkbox').each(function fn(index, el) {
            el.checked && checked.push(el.name);
        });
        return links.filter(function(link) {
            return checked.some(function fn(category) {
                var s = link.source.categories,
                    t = link.target.categories;
                return s && s[category] && t && t[category];
            });
        });
    }

    function parseNodesAndLinks(res, nodes, links) {
        var parent, group, name, title, link, pnode, cnode, names, path, category, map = {};

        // 给预先设置的节点一个机会
        nodes.forEach(function(node) {
            map[node.name] = node;
        });
        /**
         * 从原始数据组织 nodes 和 links
         * res is like ["CKEditor|Showcase - My Journal", ...]
         */
        res.forEach(function fn(row) {
            parent = group = category = '';
            names = [];
            row.split('|').forEach(function(tag, i) {
                if (!group || tag.match(/^Showcase/)) {
                    return group = tag;
                }
                category = category || group;
                group === 'Knowledge' && (group = 'Skill');
                names.push(name = (title = tag).replace(/^.* - /g, ''));
                path = names.join('->');

                // 创建虚拟的节点
                (cnode = map[path]) || nodes.push(cnode = map[path] = {
                    name: name,
                    level: i,
                    categories: {},
                    links: []
                });
                cnode.categories[category] = 1;

                if (parent) {
                    map[parent].categories[category] = 1;
                    if (parent !== name && !map[parent + '--' + name]) {
                        link = map[parent + '--' + name] = {
                            source: map[parent],
                            target: cnode
                        };
                        links.push(link);
                        map[parent].links.push(link);
                        cnode.links.push(link);
                    }
                } else {
                    // 这里只为第一层赋予 group 值
                    cnode.group = group.toLowerCase();
                    // 把第一级非 Showcase 都认定为基本 Skills，所以此处创建它们与 Skills 结点的连线
                    if (map[group]) {
                        map[group].categories[category] = 1;
                        if (!map[group + '--' + name]) {
                            links.push(link = map[group + '--' + name] = {
                                source: map[group],
                                target: cnode
                            });
                            map[group].links.push(link);
                            cnode.links.push(link);
                        }
                    } else {
                        cnode.group = 'Skill';
                    }
                }
                parent = names.join('->');
            });

            // 最后一个 name 对应的是 title
            cnode.title = title;
        });
    }

    function prepareNodesAndLinks(nodes, links) {
        /**
         * 统一定制各个参数
         */
        links.forEach(function fn(link) {
            if (link.source.name === 'Skill') {
                link.strength = 1;
                link.distance = 80;
            } else if (link.source.group === 'skill') {
                link.strength = 1;
                link.distance = 40;
            }

            link.strength = link.strength || 2;
            link.distance = link.distance || 20;
            link.class = link.class || 'link';
        });
        nodes.forEach(function fn(node) {
            node.class = ['node'];
            node.title && node.class.push('real');

            if (node.group === 'skill') {
                node.charge = -1000;
                node.class.push('skill');
            } else if (node.group === 'combine') {
                node.class.push('combine');
            }
            node.class = node.class.join(' ');
            node.charge = node.charge || -300;
        });
    }

    function drawNodesAndLinks(force) {
        var gnodes = svg.selectAll('.node').data(force.nodes());

        // 这两行没用，加上反而无法正常显示内容
        //.attr('requiredExtensions', "http://www.w3.org/1999/xhtml")
        //.append('xhtml:body').attr('xmlns', "http://www.w3.org/1999/xhtml")
        var enter = gnodes.enter().append('g');
        enter.append('circle');
        //#enter.append('foreignObject').append('xhtml:a');
        enter.append('rect');
        enter.append('text');
        gnodes.exit().remove();

        gnodes.each(function(node) {
            d3.select(this).attr('class', node.class);
            d3.select(this.childNodes[0]).attr('r', node.links.length + 1);
            var w, h, rw, rh, scale = 1,
                f = this.childNodes[1],
                a = this.childNodes[2];
            a.textContent = typeof node.displayName === 'undefined' ? node.name : node.displayName;
            rw = (w = a.getBBox().width) * scale, rh = (h = a.getBBox().height) * scale;
            f.setAttribute('width', w + 8);
            f.setAttribute('height', h + 4);
            f.setAttribute('rx', 4);
            f.setAttribute('ry', 2);
            //#f.setAttribute('x', 3);
            //#f.setAttribute('y', 0);
            //#f.setAttribute('transform', 'scale(' + scale + ')');

            node.width = rw, node.height = rh, node.scale = scale;
            //g.append('ellipse').attr('rx', rw).attr('ry', rw / 5).style('fill', 'none');
        });
        //gnodes.call(force.drag)

        var glinks = svg.selectAll('.link').data(force.links());
        glinks.enter().append('line').attr('class', function fn(link) {
            return link.class;
        });
        glinks.exit().remove();
    }

    function collide(node, alpha) {
        var flattening = 4;
        var r = node.width + 16,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r / flattening,
            ny2 = node.y + r / flattening;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    // 此处对 y 进行加倍，逻辑是：对于指定的 x，本来在 y=sqrt(r*r-x*x) 处满足条件 l < r 时
                    // **就**触发碰撞，可是现在 y 在本身的 1/flattening 处才要触发，所以。。。
                    l = Math.sqrt(x * x + y * y * flattening * flattening),
                    r = node.width + quad.point.width;
                if (l < r) {
                    l = (l - r) / l * 0.5 * alpha;
                    x *= l;
                    y *= l;
                    node.x -= x;
                    node.y -= y;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
    }
});