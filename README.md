历史说明
========

## 旧开发环境重现

经反复尝试，确定旧的开发环境如下：

node v11，避免出现「ReferenceError: primordials is not defined」的错误
yo@1.2.0 \
grunt-cli@0.1.13 \
generator-webapp@0.4.4 \
# generator-mocha 被 generator-webapp 需要
generator-mocha@0.1.8 \

## 开发环境版本查看

- 参考 nodejs v16 是当前的 Active LTS，支持到 2024-04-30 目前最久，所以 16-bullseye 是最优选。

https://hub.docker.com/_/node

- 可见 nodejs 当前v12还在维护期

https://nodejs.org/en/about/releases/

RELEASE	STATUS	CODENAME	INITIAL RELEASE	ACTIVE LTS START	MAINTENANCE LTS START	END-OF-LIFE
v12	Maintenance LTS	Erbium	2019-04-23	2019-10-21	2020-11-30	2022-04-30
v14	Maintenance LTS	Fermium	2020-04-21	2020-10-27	2021-10-19	2023-04-30
v16	Active LTS	Gallium	2021-04-20	2021-10-26	2022-10-18	2024-04-30
v17	Current		2021-10-19		2022-04-01	2022-06-01
v18	Pending		2022-04-19	2022-10-25	2023-10-18	2025-04-30

- 可见 debian 当前还在维护的最旧的版本是 Debian 8 (jessie)， 

https://www.debian.org/releases/index.zh-cn.html

下一代 Debian 正式发行版的代号为 bookworm — 测试（testing）版 — 发布日期尚未确定
Debian 11 (bullseye) — 当前的稳定（stable）版
Debian 10（buster） — 当前的旧的稳定（oldstable）版
Debian 9（stretch） — 更旧的稳定（oldoldstable）版，现有长期支持
Debian 8（jessie） — 已存档版本，现有扩展长期支持
Debian 7（wheezy） — 被淘汰的稳定版
Debian 6.0（squeeze） — 被淘汰的稳定版

进一步查看长期支持的具体日期，可见 Debian 8 “Jessie” 还能支持到 2022-06-30。

https://wiki.debian.org/LTS/Extended

|	Version	|	support architecture	|	schedule	|
|	Debian 7 “Wheezy”	|	i386, amd64	|	from 2018-06-01 to 2020-06-30	|
|	Debian 8 “Jessie”	|	i386, amd64, armel	|	from 2020-07-01 to 2022-06-30	|
|	Debian 9 “Stretch”	|	i386, amd64, ...?	|	2022 to ??	|
|	Debian 10 “Buster”	|	i386, amd64, ...?	|	??	|





https://h3manth.com/posts/primordials-in-node/
https://newbedev.com/how-to-fix-referenceerror-primordials-is-not-defined-in-node


# cat /usr/local/lib/node_modules/yo/node_modules/update-notifier/package.json 
{
  ...
  "version": "0.1.10"
}



# cat /usr/local/lib/node_modules/yo/node_modules/update-notifier/node_modules/graceful-fs/package.json 
{
  ...
  "version": "3.0.12"
}

https://github.com/yeoman/update-notifier










## docker 之 node:12-bullseye 安装成功

2021-12-08 周三 狗市正式取缔
终于在 docker 里安装成功了

```
$ sudo docker build -t yo .
Sending build context to Docker daemon  35.71MB
Step 1/3 : FROM node:12-bullseye AS dev
 ---> 506bcb97d805
Step 2/3 : RUN apt-get update && apt-get install -y --no-install-recommends     ruby ruby-dev     && rm -rf /var/lib/apt/lists/*     && gem install compass
 ---> Using cache
 ---> a01b92df2e5d
Step 3/3 : RUN npm install -g     yo     grunt     generator-webapp     generator-gulp-angular     generator-angular-fullstack     && mkdir -p /root/.config && chmod g+x /root/ /root/.config     && mkdir -p /root/.config/insight-nodejs/ && chmod g+w /root/.config/insight-nodejs/     && mkdir -p /root/.config/configstore/ && chmod g+w /root/.config/configstore/
 ---> Running in 32b1fabeb3fe
npm WARN deprecated babel-eslint@7.2.3: babel-eslint is now @babel/eslint-parser. This package will no longer receive updates.
npm WARN deprecated core-js@2.6.12: core-js@<3.3 is no longer maintained and not recommended for usage due to the number of issues. Because of the V8 engine whims, feature detection in old core-js versions could cause a slowdown up to 100x even if nothing is polyfilled. Please, upgrade your dependencies to the actual version of core-js.                                                          
npm WARN deprecated nomnom@1.8.1: Package no longer supported. Contact support@npmjs.com for more info.                                                                                               
npm WARN deprecated babel-preset-es2015@6.24.1:   Thanks for using Babel: we recommend using babel-preset-env now: please read https://babeljs.io/env to update!                                    
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated                                                                                                                  
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated                                                                                                               
npm WARN deprecated gulp-util@3.0.8: gulp-util is deprecated - replace it, following the guidelines at https://medium.com/gulpjs/gulp-util-ca3b1f9f9ac5                                               
npm WARN deprecated circular-json@0.3.3: CircularJSON is in maintenance only, flatted is its successor.                                                                                               
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142                                                                                   
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.                                                                                                                                                                                 
npm WARN deprecated uuid@2.0.3: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.                                                                                                                                                                                 
npm WARN deprecated har-validator@5.1.5: this library is no longer supported                                                                                                                          
npm WARN deprecated minimatch@2.0.10: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue                                                                                          
npm WARN deprecated core-js@1.2.7: core-js@<3.3 is no longer maintained and not recommended for usage due to the number of issues. Because of the V8 engine whims, feature detection in old core-js versions could cause a slowdown up to 100x even if nothing is polyfilled. Please, upgrade your dependencies to the actual version of core-js.                                                           
npm WARN deprecated cross-spawn-async@2.2.5: cross-spawn no longer requires a build toolchain, use it instead                                                                                         
npm WARN deprecated formatio@1.1.1: This package is unmaintained. Use @sinonjs/formatio instead                                                                                                       
npm WARN deprecated samsam@1.1.2: This package has been deprecated in favour of @sinonjs/samsam                                                                                                       
/usr/local/bin/grunt -> /usr/local/lib/node_modules/grunt/bin/grunt                                                                                                                                   
/usr/local/bin/yo -> /usr/local/lib/node_modules/yo/lib/cli.js
/usr/local/bin/yo-complete -> /usr/local/lib/node_modules/yo/lib/completion/index.js

> core-js@2.6.12 postinstall /usr/local/lib/node_modules/generator-angular-fullstack/node_modules/core-js
> node -e "try{require('./postinstall')}catch(e){}"

Thank you for using core-js ( https://github.com/zloirock/core-js ) for polyfilling JavaScript standard library!

The project needs your help! Please consider supporting of core-js on Open Collective or Patreon: 
> https://opencollective.com/core-js 
> https://www.patreon.com/zloirock 

Also, the author of core-js ( https://github.com/zloirock ) is looking for a good job -)


> ejs@2.7.4 postinstall /usr/local/lib/node_modules/generator-angular-fullstack/node_modules/ejs
> node ./postinstall.js

Thank you for installing EJS: built with the Jake JavaScript build tool (https://jakejs.com/)


> core-js@2.6.12 postinstall /usr/local/lib/node_modules/generator-angular-fullstack/node_modules/jscodeshift/node_modules/recast/node_modules/core-js
> node -e "try{require('./postinstall')}catch(e){}"

Thank you for using core-js ( https://github.com/zloirock/core-js ) for polyfilling JavaScript standard library!

The project needs your help! Please consider supporting of core-js on Open Collective or Patreon: 
> https://opencollective.com/core-js 
> https://www.patreon.com/zloirock 

Also, the author of core-js ( https://github.com/zloirock ) is looking for a good job -)


> ejs@2.7.4 postinstall /usr/local/lib/node_modules/generator-gulp-angular/node_modules/ejs
> node ./postinstall.js

Thank you for installing EJS: built with the Jake JavaScript build tool (https://jakejs.com/)


> spawn-sync@1.0.15 postinstall /usr/local/lib/node_modules/generator-gulp-angular/node_modules/spawn-sync
> node postinstall


> ejs@2.7.4 postinstall /usr/local/lib/node_modules/generator-webapp/node_modules/ejs
> node ./postinstall.js

Thank you for installing EJS: built with the Jake JavaScript build tool (https://jakejs.com/)


> spawn-sync@1.0.15 postinstall /usr/local/lib/node_modules/generator-webapp/node_modules/spawn-sync
> node postinstall


> ejs@2.7.4 postinstall /usr/local/lib/node_modules/generator-webapp/node_modules/yeoman-generator/node_modules/yeoman-environment/node_modules/ejs
> node ./postinstall.js

Thank you for installing EJS: built with the Jake JavaScript build tool (https://jakejs.com/)


> core-js@3.19.3 postinstall /usr/local/lib/node_modules/yo/node_modules/core-js
> node -e "try{require('./postinstall')}catch(e){}"

Thank you for using core-js ( https://github.com/zloirock/core-js ) for polyfilling JavaScript standard library!

The project needs your help! Please consider supporting of core-js:
> https://opencollective.com/core-js 
> https://patreon.com/zloirock 
> https://paypal.me/zloirock 
> bitcoin: bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz 

Also, the author of core-js ( https://github.com/zloirock ) is looking for a good job -)


> spawn-sync@1.0.15 postinstall /usr/local/lib/node_modules/yo/node_modules/spawn-sync
> node postinstall


> yo@4.3.0 postinstall /usr/local/lib/node_modules/yo
> yodoctor


Yeoman Doctor
Running sanity checks on your system

✔ No .bowerrc file in home directory
✔ Global configuration file is valid
✔ NODE_PATH matches the npm root
✔ No .yo-rc.json file in home directory
✔ Node.js version
✔ npm version
✔ yo version

Everything looks all right!
npm WARN notsup Unsupported engine for generator-angular-fullstack@5.0.0-rc.4: wanted: {"node":"^8","npm":">= 3.9.5"} (current: {"node":"12.22.7","npm":"6.14.15"})
npm WARN notsup Not compatible with your version of node/npm: generator-angular-fullstack@5.0.0-rc.4                                                                                                  
npm WARN notsup Unsupported engine for got@5.7.1: wanted: {"node":">=0.10.0 <7"} (current: {"node":"12.22.7","npm":"6.14.15"})                                                                        
npm WARN notsup Not compatible with your version of node/npm: got@5.7.1                                                                                                                               
                                                                                                                                                                                                      
+ yo@4.3.0                                                                                                                                                                                            
+ generator-webapp@4.0.0-8
+ grunt@1.4.1
+ generator-angular-fullstack@5.0.0-rc.4
+ generator-gulp-angular@1.1.1
added 2780 packages from 839 contributors in 1563.161s
Removing intermediate container 32b1fabeb3fe
 ---> 80e22a56d5bd
Successfully built 80e22a56d5bd
Successfully tagged yo:latest
```

## 用 npm-shrinkwrap.json 来解决 ReferenceError: primordials is not defined

参考 https://timonweb.com/javascript/how-to-fix-referenceerror-primordials-is-not-defined-error/
把如下内容写入 npm-shrinkwrap.json 后执行 npm install，真的解决问题了。

```
{
  "dependencies": {
    "graceful-fs": {
      "version": "4.2.2"
    }
  }
}
```
