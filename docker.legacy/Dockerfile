## 参考来源
## - node 官方映像：https://hub.docker.com/_/node
## - 首先尝试 17-alpine，可能 node 版本太高
## - 后又降至 12-alpine，发现 alpine 在 apk add ruby ruby-dev && gem install compass 时不成功，问题多多
## - 还是选用 12-bullseye，也是页面直接列出的最低 node 版本，直接成功

## - debian 版本要足够高，以便 apt-get 还能够安装 ruby 等包

FROM node:11-stretch AS dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    ruby ruby-dev \
    && rm -rf /var/lib/apt/lists/* \
    && gem install compass

RUN npm install -g \
    yo@1.2.0 \
    grunt-cli@0.1.13 \
    # bower 的版本要求似乎很宽泛
    bower \
    generator-webapp@0.4.4 \
    # generator-mocha 被 generator-webapp 需要，经仔细比对，0.1.1 是当时版本，4空格缩进，有IE HTML Header
    generator-mocha@0.1.1 \
    && sed -i 's/.uniq(select/.uniq(select.select/g' /usr/local/lib/node_modules/generator-webapp/node_modules/cheerio/lib/api/traversing.js \
    # 避免 yo webapp 时出现错误「TypeError: Cannot assign to read only property 'name' of function 'function」
    && sed -i "s/Generator.name = 'Mocha';/\/\/Generator.name = 'Mocha';/g" /usr/local/lib/node_modules/generator-mocha/app/index.js
    ## - 下面这行需要在容器中执行 npm install 安装 node_modules/download/ 后手动执行
    #&& sed -i 's/path.basename(url)/path.basename(url.url || url)/g' node_modules/download/index.js
    # 以下主要解决只执行 yo 命令时的权限问题，不过如果直接执行 yo webapp 则不存在这些问题
    # - 参考 https://github.com/keystonejs/keystone-classic/issues/1566#issuecomment-958619406
    #&& mkdir -p /root/.config && chmod g+x /root/ /root/.config \
    #&& mkdir -p /root/.config/insight-nodejs/ && chmod g+w /root/.config/insight-nodejs/ \
    #&& mkdir -p /root/.config/configstore/ && chmod g+w /root/.config/configstore/
