define('config', function() {

	var m = location.search.match(/[?&]env=(.+)(?:&|$)/),
		env = m ? m[1] : 'prod';

	function envs(env) {
		envs[env](this);
	}

	envs.prototype = {
		canvasMovable: false,
		articlesTags: function() {
			console.log('[env.articlesTags]');
		}
	}

	envs.dev = function(env) {
		var host = 'http://' + location.hostname + '/api';

		var urls = {
			tagsdata: host + '/articles/tags',
			recentArticles: host + '/articles/latest/0/branch',
			articleBlob: function(title, sha) {
				return 'http://localhost/api/articles/blob/' + title + '/' + sha;
			},
			thumbnail: function(link, size) {
				return host + '/showcase/thumbnail/' + link + '/200@' + size + '.png';
			},
			snapshot: function(link, size) {
				return host + '/showcase/snapshot/' + link + '/' + size + '.png';
			},
			showcase: function(link) {
				return link;
			}
		};

		env.urls = urls;
		env.recentArticles = function(success, failure) {
			$.getJSON(urls.recentArticles).done(success).fail(failure);
		};
		env.articlesTags = requestOnce(function(success, failure) {
			$.getJSON(urls.tagsdata).done(success).fail(failure);
		});
		env.articleBlob = function(title, sha, success, failure) {
			$.getJSON(urls.articleBlob(title, sha))

			.done(function done(res) {
				success({
					title: title,
					content: res.content
				});
			}).fail(failure);
		};
	}

	envs.prod = function(env) {
		var host = 'data',
			repo = 'https://api.github.com/repos/mlhch/articles';

		var urls = {
			tagsdata: host + '/articles/tags' + format,
			recentArticles: host + '/articles/latest/0/branch' + format,
			articleBlob: function(title, sha) {
				return host + '/articles/blob/' + title + '/' + sha;
			},
			articleTree: function(sha) {
				return repo + '/git/trees/' + sha;
			},
			thumbnail: function(link, size) {
				return host + '/showcase/thumbnail/' + link + '/200@' + size + '.png';
			},
			snapshot: function(link, size) {
				return host + '/showcase/snapshot/' + link + '/' + size + '.png';
			},
			showcase: function(link) {
				return link;
			}
		};

		env.urls = urls;
		env.recentArticles = function(success, failure) {
			/**
			 * [{
			 *   "ref": "refs/heads/1385363799_UmFpbHM=",
			 *   "url": "https://api.github.com/repos/mlhch/articles/git/refs/heads/1385363799_UmFpbHM=",
			 *   "object": {
			 *     "sha": "25013c730a6050fc27ca00a6f1e4d0dd181b9fea",
			 *     "type": "commit",
			 *     "url": "https://api.github.com/repos/mlhch/articles/git/commits/25013c730a6050fc27ca00a6f1e4d0dd181b9fea"
			 *   }
			 * },
			 * ...
			 */
			$.getJSON(urls.recentArticles).done(function done(res) {
				success(res.map(function fn(row) {
					var m = row.ref.match(/^refs\/heads\/(\d+)_(.+)$/);
					return m ? {
						time: m[1],
						title: utf8to16(atob(m[2])),
						sha: row.object.sha
					} : null;
				}).filter(function(row) {
					return !!row;
				}).reverse());
			}).fail(failure);
		};
		env.articlesTags = requestOnce(function fn(success, failure) {
			/**
			 * tags data are like:
			 *  [{
			 *	    "ref": "refs/tags/S25vd2xlZGdl.R2l0.R2l0IC0gZ2l0b2xpdGUgLSBnaXR3ZWI=",
			 *	    "url": "https://api.github.com/repos/mlhch/articles/git/refs/tags/S25vd2xlZGdl.R2l0.R2l0IC0gZ2l0b2xpdGUgLSBnaXR3ZWI=",
			 *	    "object": {
			 *	      "sha": "43cb410c415831a544c911a3ff4d61af3a4003aa",
			 *	      "type": "commit",
			 *	      "url": "https://api.github.com/repos/mlhch/articles/git/commits/43cb410c415831a544c911a3ff4d61af3a4003aa"
			 *	    }
			 *	},
			 *  ...
			 */
			$.getJSON(urls.articlesTags).done(function done(res) {
				success(res.map(function fn(row) {
					return row.ref.replace(/^refs\/tags\//, '').split('.').map(function fn(row) {
						return utf8to16(atob(row));
					}).join('|');
				}));
			}).fail(failure)
		});
		env.articleBlob = function(title, sha, success, failure) {
			$.getJSON(urls.articleTree(sha))

			.done(function done(res) {
				$.getJSON(res.tree[0].url)

				.done(function done(res) {
					success({
						title: title,
						content: utf8to16(atob(res.content.replace(/\n/g, '')))
					});
				}).fail(failure);
			}).fail(failure);
		};
	}

	return new envs(env);

	function utf8to16(str) {
		var c1, c2, c3, out = [];

		for (var i = 0, len = str.length; i < len; i++) {
			c1 = str.charCodeAt(i);
			if ((c1 & 0x80) == 0) { // 0xxxxxxx  
				out.push(str[i]);
			} else if ((c1 & 0xe0) == 0xc0) { // 110x xxxx 10xx xxxx  
				c2 = str.charCodeAt(++i);
				out.push(String.fromCharCode(((c1 & 0x1F) << 6) | (c2 & 0x3F)));
			} else if ((c1 & 0xf0) == 0xe0) { // 1110 xxxx 10xx xxxx 10xx xxxx  
				c2 = str.charCodeAt(++i);
				c3 = str.charCodeAt(++i);
				out.push(String.fromCharCode(((c1 & 0x0f) << 12) | ((c2 & 0x3F) << 6) | ((c3 & 0x3F) << 0)));
			}
		}

		return out.join('');
	}

	function requestOnce(request) {
		var status, cachedRes,
			listeners = [];

		return function fn(success, failure) {
			listeners.push({
				success: success,
				failure: failure
			});

			if (!status) {
				status = 'loading';
				request(function s(res) {
					status = 'success';
					cachedRes = res
					doSuccess();
				}, function f() {
					status = 'failure';
					doFailure();
				});
			} else if (status === 'success') {
				doSuccess();
			} else if (status === 'failure') {
				doFailure();
			}
		}

		function doSuccess() {
			while (listeners.length > 0) {
				try {
					listeners[0].success(cachedRes);
				} catch (e) {
					console.log(e);
				} finally {
					listeners.shift();
				}
			}
		}

		function doFailure() {
			while (listeners.length > 0) {
				try {
					listeners[0].failure();
				} catch (e) {
					console.log(e);
				} finally {
					listeners.shift();
				}
			}
		}
	}
});