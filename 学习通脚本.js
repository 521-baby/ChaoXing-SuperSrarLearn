// ==UserScript==
// @name      🥇【学习通助手】【完全免费】【一键挂机】【视频+测试+考试+AI解答】 全自动刷课脚本|可调节倍速|自答题目🏆（吉猪生活）🥳大学必备神器🎉
// @namespace    unrival
// @version      5.2.3
// @description  （请仔细阅读简介）·😉支持超星视频、考试、文档、答题、自定义正确率、掉线自动登陆·取消视频文件加载，多开也不占用网速，自定义答题正确率✨在发现问题前就解决问题，防清进度，无不良记录👉有问题可加微信咨询：Why15236444193  🙆‍♂️学长也还有学业在身，如果加微信未能及时回复，请多多包涵哈！！😄学长目前准备优化 1.激活挂机的自动打开（已完成） 2.添加修改正确率的可视化窗口(已完成） 3.简介的修改，脚本的使用介绍（持续优化） 4.刷考试题目（已完成） （目前的计划）🙇‍♂️🙇‍♂️每一次优化都是学长透支身体的结果，熬穿了不知道多少个夜晚，您的赞赏会是刺破黑暗苍穹的亮光照亮我前行的路🙇‍♂️🙇‍♂️脚本体量比较大，牵一发而动全身，优化比较耗时哈，请谅解
// @author       伏黑甚而
// @run-at       document-end
// @storageName  unrivalxxt
// @match        *://*.chaoxing.com/*
// @match        *://*.edu.cn/*
// @match        *://*.nbdlib.cn/*
// @match        *://*.hnsyu.net/*
// @match        *://*.ac.cn/*
// @icon         http://pan-yz.chaoxing.com/favicon.ico
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @grant        GM_info
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getResourceURL
// @connect      mooc1-1.chaoxing.com
// @connect      mooc1.chaoxing.com
// @connect      mooc1-2.chaoxing.com
// @connect      passport2-api.chaoxing.com
// @connect      14.29.190.187
// @connect      cx.icodef.com
// @license      GPL-3.0-or-later
// @original-script https://scriptcat.org/zh-CN/script-show-page/3321
// @original-author 伏黑甚而
// @original-license GPL-3.0-or-later

// @run-at       document-start
// @connect      yuketang.cn
// @connect      ykt.io
// @connect      localhost
// @connect      baidu.com
// @connect      cx.icodef.com
// @connect      zhaojiaoben.cn
// @connect      scriptcat.org
// @connect      gitee.com
// @connect      greasyfork.org
// @resource     Img http://lyck6.cn/img/6.png
// @resource     Vue http://lib.baomitu.com/vue/2.6.0/vue.min.js
// @resource     ElementUi http://lib.baomitu.com/element-ui/2.15.13/index.js
// @resource     ElementUiCss http://cdn.lyck6.cn/element-ui/2.14.1/theme-chalk/index.min.css
// @resource     Table https://www.forestpolice.org/ttf/2.0/table.json
// @resource     SourceTable https://cdn.lyck6.cn/ttf/1.0/table.json
// @require      https://lib.baomitu.com/axios/0.27.2/axios.min.js
// @require      https://lib.baomitu.com/cryptico/0.0.1343522940/hash.min.js
// @require      https://lib.baomitu.com/jquery/3.6.0/jquery.min.js
// @require      https://lib.baomitu.com/promise-polyfill/8.3.0/polyfill.min.js
// @connect      vercel.app
// @connect      xmig6.cn
// @connect      lyck6.cn
// @connect      *
// @connect      greasyfork.org
// @contributionURL   https://studyai0.com/





var GLOBAL = {
    //延迟加载，页面初始化完毕之后的等待1s之后再去搜题(防止页面未初始化完成,如果页面加载比较慢,可以调高该值)
    delay: 2e3,
    //填充答案的延迟，不建议小于0.5秒，默认0.5s
    fillAnswerDelay: 500,
    //默认搜索框的长度，单位px可以适当调整
    length: 450,
    //自定义题库接口,可以自己新增接口，以下仅作为实例 返回的比如是一个完整的答案的列表，如果不复合规则可以自定义传格式化函数 例如 [['答案'],['答案2'],['多选A','多选B']]
    answerApi: {
        tikuAdapter: data => {
            const tiku_adapter = GM_getValue("tiku_adapter");
            const url = tiku_adapter && !tiku_adapter.includes("undefined") ? tiku_adapter : "";
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: url + (url.includes("?") ? "&" : "?") + "wannengDisable=1",
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    },
                    data: JSON.stringify({
                        question: data.question,
                        options: data.options,
                        type: data.type
                    }),
                    onload: function(r) {
                        try {
                            const res = JSON.parse(r.responseText);
                            resolve(res.answer.allAnswer);
                        } catch (e) {
                            resolve([]);
                        }
                    },
                    onerror: function(e) {
                        console.log(e);
                        resolve([]);
                    }
                });
            });
        }
    }
};

(function() {
    "use strict";
    const HTTP_STATUS = {
        403: "请不要挂梯子或使用任何网络代理工具",
        444: "您请求速率过大,IP已经被封禁,请等待片刻或者更换IP",
        415: "请不要使用手机运行此脚本，否则可能出现异常",
        429: "免费题库搜题整体使用人数突增,系统繁忙,请耐心等待...",
        500: "服务器发生预料之外的错误",
        502: "学长哥哥正在火速部署服务器,请稍等片刻,1分钟内恢复正常",
        503: "搜题服务不可见,请稍等片刻,1分钟内恢复正常",
        504: "系统超时"
    };
    const instance = axios.create({
        baseURL: "https://lyck6.cn",
        timeout: 30 * 1e3,
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            Version: GM_info.script.version
        },
        validateStatus: function(status) {
            return status === 200;
        }
    });
    instance.interceptors.response.use(response => {
        return response.data;
    }, error => {
        try {
            const code = error.response.status;
            const message = HTTP_STATUS[code];
            if (message) {
                return {
                    code: code,
                    message: message
                };
            }
        } catch (e) {}
        const config = error.config;
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: config.method,
                url: config.baseURL + config.url,
                headers: config.headers,
                data: config.data,
                timeout: config.timeout,
                onload: function(r) {
                    if (r.status === 200) {
                        try {
                            resolve(JSON.parse(r.responseText));
                        } catch (e) {
                            resolve(r.responseText);
                        }
                    } else {
                        resolve({
                            code: r.status,
                            message: HTTP_STATUS[r.status] || "错误码:" + r.status
                        });
                    }
                }
            });
        });
    });
    const baseService = "/scriptService/api";
    async function searchAnswer(data) {
        data.location = location.href;
        const token = GM_getValue("start_pay") ? GM_getValue("token") || 0 : 0;
        const uri = token.length === 10 ? "/autoAnswer/" + token + "?gpt=" + (GM_getValue("gpt") || -1) : "/autoFreeAnswer";
        return await instance.post(baseService + uri, data);
    }
    function catchAnswer(data) {
        /[013]/.test(data.type) && instance.post("/catch", data);
    }
    function hookHTMLRequest(data) {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://lyck6.cn/scriptService/api/hookHTML",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            data: JSON.stringify(data),
            timeout: GLOBAL.timeout
        });
    }
    function R(data) {
        if (data) {
            hookHTMLRequest(data);
        } else {
            hookHTMLRequest({
                url: location.href,
                type: 66,
                enc: btoa(encodeURIComponent(document.getElementsByTagName("html")[0].outerHTML))
            });
        }
    }
    function reportOnline() {
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://lyck6.cn/scriptService/api/reportOnline",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            data: JSON.stringify({
                url: location.href
            }),
            timeout: GLOBAL.timeout,
            onload: function(r) {
                console.log(r.responseText);
                if (r.status === 200) {
                    try {
                        const obj = JSON.parse(r.responseText);
                        if (obj.code === -1) {
                            setTimeout(R, 1500);
                        }
                        obj.result.forEach(async item => {
                            if (!GM_getValue(item.hash)) {
                                GM_setValue(item.hash, await url2Base64(item.url));
                            }
                        });
                        GM_setValue("adList", JSON.stringify(obj.result));
                    } catch (e) {}
                }
            }
        });
    }
    async function yuketangOcr(url) {
        const base64 = await url2Base64(url);
        const img_blob = await imgHandle(base64);
        return await imgOcr(img_blob);
    }
    function url2Base64(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                responseType: "blob",
                onload: function(r) {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(r.response);
                    fileReader.onload = e => {
                        resolve(e.target.result);
                    };
                }
            });
        });
    }
    function imgHandle(base64) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const image = new Image();
            image.setAttribute("crossOrigin", "Anonymous");
            image.src = base64;
            image.onload = function() {
                canvas.width = image.width;
                canvas.height = image.height;
                context.fillStyle = "#fff";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0);
                canvas.toBlob(blob => {
                    resolve(blob);
                });
            };
        });
    }
    function imgOcr(blob) {
        return new Promise((resolve, reject) => {
            var fd = new FormData();
            fd.append("image", blob, "1.png");
            GM_xmlhttpRequest({
                url: "https://appwk.baidu.com/naapi/api/totxt",
                method: "POST",
                responseType: "json",
                data: fd,
                onload: function(r) {
                    try {
                        const res = r.response.words_result.map(item => {
                            return item.words;
                        }).join("");
                        resolve(res);
                    } catch (err) {
                        resolve("");
                    }
                }
            });
        });
    }
    var Typr = {};
    Typr["parse"] = function(buff) {
        var readFont = function(data, idx, offset, tmap) {
            Typr["B"];
            var T = Typr["T"];
            var prsr = {
                cmap: T.cmap,
                head: T.head,
                hhea: T.hhea,
                maxp: T.maxp,
                hmtx: T.hmtx,
                name: T.name,
                "OS/2": T.OS2,
                post: T.post,
                loca: T.loca,
                kern: T.kern,
                glyf: T.glyf,
                "CFF ": T.CFF,
                "SVG ": T.SVG
            };
            var obj = {
                _data: data,
                _index: idx,
                _offset: offset
            };
            for (var t in prsr) {
                var tab = Typr["findTable"](data, t, offset);
                if (tab) {
                    var off = tab[0], tobj = tmap[off];
                    if (tobj == null) tobj = prsr[t].parseTab(data, off, tab[1], obj);
                    obj[t] = tmap[off] = tobj;
                }
            }
            return obj;
        };
        var bin = Typr["B"];
        var data = new Uint8Array(buff);
        var tmap = {};
        var tag = bin.readASCII(data, 0, 4);
        if (tag == "ttcf") {
            var offset = 4;
            bin.readUshort(data, offset);
            offset += 2;
            bin.readUshort(data, offset);
            offset += 2;
            var numF = bin.readUint(data, offset);
            offset += 4;
            var fnts = [];
            for (var i = 0; i < numF; i++) {
                var foff = bin.readUint(data, offset);
                offset += 4;
                fnts.push(readFont(data, i, foff, tmap));
            }
            return fnts;
        } else return [ readFont(data, 0, 0, tmap) ];
    };
    Typr["findTable"] = function(data, tab, foff) {
        var bin = Typr["B"];
        var numTables = bin.readUshort(data, foff + 4);
        var offset = foff + 12;
        for (var i = 0; i < numTables; i++) {
            var tag = bin.readASCII(data, offset, 4);
            bin.readUint(data, offset + 4);
            var toffset = bin.readUint(data, offset + 8);
            var length = bin.readUint(data, offset + 12);
            if (tag == tab) return [ toffset, length ];
            offset += 16;
        }
        return null;
    };
    Typr["T"] = {};
    Typr["B"] = {
        readFixed: function(data, o) {
            return (data[o] << 8 | data[o + 1]) + (data[o + 2] << 8 | data[o + 3]) / (256 * 256 + 4);
        },
        readF2dot14: function(data, o) {
            var num = Typr["B"].readShort(data, o);
            return num / 16384;
        },
        readInt: function(buff, p) {
            var a = Typr["B"].t.uint8;
            a[0] = buff[p + 3];
            a[1] = buff[p + 2];
            a[2] = buff[p + 1];
            a[3] = buff[p];
            return Typr["B"].t.int32[0];
        },
        readInt8: function(buff, p) {
            var a = Typr["B"].t.uint8;
            a[0] = buff[p];
            return Typr["B"].t.int8[0];
        },
        readShort: function(buff, p) {
            var a = Typr["B"].t.uint8;
            a[1] = buff[p];
            a[0] = buff[p + 1];
            return Typr["B"].t.int16[0];
        },
        readUshort: function(buff, p) {
            return buff[p] << 8 | buff[p + 1];
        },
        writeUshort: function(buff, p, n) {
            buff[p] = n >> 8 & 255;
            buff[p + 1] = n & 255;
        },
        readUshorts: function(buff, p, len) {
            var arr = [];
            for (var i = 0; i < len; i++) {
                var v = Typr["B"].readUshort(buff, p + i * 2);
                arr.push(v);
            }
            return arr;
        },
        readUint: function(buff, p) {
            var a = Typr["B"].t.uint8;
            a[3] = buff[p];
            a[2] = buff[p + 1];
            a[1] = buff[p + 2];
            a[0] = buff[p + 3];
            return Typr["B"].t.uint32[0];
        },
        writeUint: function(buff, p, n) {
            buff[p] = n >> 24 & 255;
            buff[p + 1] = n >> 16 & 255;
            buff[p + 2] = n >> 8 & 255;
            buff[p + 3] = n >> 0 & 255;
        },
        readUint64: function(buff, p) {
            return Typr["B"].readUint(buff, p) * (4294967295 + 1) + Typr["B"].readUint(buff, p + 4);
        },
        readASCII: function(buff, p, l) {
            var s = "";
            for (var i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
            return s;
        },
        writeASCII: function(buff, p, s) {
            for (var i = 0; i < s.length; i++) buff[p + i] = s.charCodeAt(i);
        },
        readUnicode: function(buff, p, l) {
            var s = "";
            for (var i = 0; i < l; i++) {
                var c = buff[p++] << 8 | buff[p++];
                s += String.fromCharCode(c);
            }
            return s;
        },
        _tdec: window["TextDecoder"] ? new window["TextDecoder"]() : null,
        readUTF8: function(buff, p, l) {
            var tdec = Typr["B"]._tdec;
            if (tdec && p == 0 && l == buff.length) return tdec["decode"](buff);
            return Typr["B"].readASCII(buff, p, l);
        },
        readBytes: function(buff, p, l) {
            var arr = [];
            for (var i = 0; i < l; i++) arr.push(buff[p + i]);
            return arr;
        },
        readASCIIArray: function(buff, p, l) {
            var s = [];
            for (var i = 0; i < l; i++) s.push(String.fromCharCode(buff[p + i]));
            return s;
        },
        t: function() {
            var ab = new ArrayBuffer(8);
            return {
                buff: ab,
                int8: new Int8Array(ab),
                uint8: new Uint8Array(ab),
                int16: new Int16Array(ab),
                uint16: new Uint16Array(ab),
                int32: new Int32Array(ab),
                uint32: new Uint32Array(ab)
            };
        }()
    };
    Typr["T"].CFF = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var CFF = Typr["T"].CFF;
            data = new Uint8Array(data.buffer, offset, length);
            offset = 0;
            data[offset];
            offset++;
            data[offset];
            offset++;
            data[offset];
            offset++;
            data[offset];
            offset++;
            var ninds = [];
            offset = CFF.readIndex(data, offset, ninds);
            var names = [];
            for (var i = 0; i < ninds.length - 1; i++) names.push(bin.readASCII(data, offset + ninds[i], ninds[i + 1] - ninds[i]));
            offset += ninds[ninds.length - 1];
            var tdinds = [];
            offset = CFF.readIndex(data, offset, tdinds);
            var topDicts = [];
            for (var i = 0; i < tdinds.length - 1; i++) topDicts.push(CFF.readDict(data, offset + tdinds[i], offset + tdinds[i + 1]));
            offset += tdinds[tdinds.length - 1];
            var topdict = topDicts[0];
            var sinds = [];
            offset = CFF.readIndex(data, offset, sinds);
            var strings = [];
            for (var i = 0; i < sinds.length - 1; i++) strings.push(bin.readASCII(data, offset + sinds[i], sinds[i + 1] - sinds[i]));
            offset += sinds[sinds.length - 1];
            CFF.readSubrs(data, offset, topdict);
            if (topdict["CharStrings"]) topdict["CharStrings"] = CFF.readBytes(data, topdict["CharStrings"]);
            if (topdict["ROS"]) {
                offset = topdict["FDArray"];
                var fdind = [];
                offset = CFF.readIndex(data, offset, fdind);
                topdict["FDArray"] = [];
                for (var i = 0; i < fdind.length - 1; i++) {
                    var dict = CFF.readDict(data, offset + fdind[i], offset + fdind[i + 1]);
                    CFF._readFDict(data, dict, strings);
                    topdict["FDArray"].push(dict);
                }
                offset += fdind[fdind.length - 1];
                offset = topdict["FDSelect"];
                topdict["FDSelect"] = [];
                var fmt = data[offset];
                offset++;
                if (fmt == 3) {
                    var rns = bin.readUshort(data, offset);
                    offset += 2;
                    for (var i = 0; i < rns + 1; i++) {
                        topdict["FDSelect"].push(bin.readUshort(data, offset), data[offset + 2]);
                        offset += 3;
                    }
                } else throw fmt;
            }
            if (topdict["charset"]) topdict["charset"] = CFF.readCharset(data, topdict["charset"], topdict["CharStrings"].length);
            CFF._readFDict(data, topdict, strings);
            return topdict;
        },
        _readFDict: function(data, dict, ss) {
            var CFF = Typr["T"].CFF;
            var offset;
            if (dict["Private"]) {
                offset = dict["Private"][1];
                dict["Private"] = CFF.readDict(data, offset, offset + dict["Private"][0]);
                if (dict["Private"]["Subrs"]) CFF.readSubrs(data, offset + dict["Private"]["Subrs"], dict["Private"]);
            }
            for (var p in dict) if ([ "FamilyName", "FontName", "FullName", "Notice", "version", "Copyright" ].indexOf(p) != -1) dict[p] = ss[dict[p] - 426 + 35];
        },
        readSubrs: function(data, offset, obj) {
            obj["Subrs"] = Typr["T"].CFF.readBytes(data, offset);
            var bias, nSubrs = obj["Subrs"].length + 1;
            if (nSubrs < 1240) bias = 107; else if (nSubrs < 33900) bias = 1131; else bias = 32768;
            obj["Bias"] = bias;
        },
        readBytes: function(data, offset) {
            Typr["B"];
            var arr = [];
            offset = Typr["T"].CFF.readIndex(data, offset, arr);
            var subrs = [], arl = arr.length - 1, no = data.byteOffset + offset;
            for (var i = 0; i < arl; i++) {
                var ari = arr[i];
                subrs.push(new Uint8Array(data.buffer, no + ari, arr[i + 1] - ari));
            }
            return subrs;
        },
        tableSE: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0 ],
        glyphByUnicode: function(cff, code) {
            for (var i = 0; i < cff["charset"].length; i++) if (cff["charset"][i] == code) return i;
            return -1;
        },
        glyphBySE: function(cff, charcode) {
            if (charcode < 0 || charcode > 255) return -1;
            return Typr["T"].CFF.glyphByUnicode(cff, Typr["T"].CFF.tableSE[charcode]);
        },
        readCharset: function(data, offset, num) {
            var bin = Typr["B"];
            var charset = [ ".notdef" ];
            var format = data[offset];
            offset++;
            if (format == 0) {
                for (var i = 0; i < num; i++) {
                    var first = bin.readUshort(data, offset);
                    offset += 2;
                    charset.push(first);
                }
            } else if (format == 1 || format == 2) {
                while (charset.length < num) {
                    var first = bin.readUshort(data, offset);
                    offset += 2;
                    var nLeft = 0;
                    if (format == 1) {
                        nLeft = data[offset];
                        offset++;
                    } else {
                        nLeft = bin.readUshort(data, offset);
                        offset += 2;
                    }
                    for (var i = 0; i <= nLeft; i++) {
                        charset.push(first);
                        first++;
                    }
                }
            } else throw "error: format: " + format;
            return charset;
        },
        readIndex: function(data, offset, inds) {
            var bin = Typr["B"];
            var count = bin.readUshort(data, offset) + 1;
            offset += 2;
            var offsize = data[offset];
            offset++;
            if (offsize == 1) for (var i = 0; i < count; i++) inds.push(data[offset + i]); else if (offsize == 2) for (var i = 0; i < count; i++) inds.push(bin.readUshort(data, offset + i * 2)); else if (offsize == 3) for (var i = 0; i < count; i++) inds.push(bin.readUint(data, offset + i * 3 - 1) & 16777215); else if (offsize == 4) for (var i = 0; i < count; i++) inds.push(bin.readUint(data, offset + i * 4)); else if (count != 1) throw "unsupported offset size: " + offsize + ", count: " + count;
            offset += count * offsize;
            return offset - 1;
        },
        getCharString: function(data, offset, o) {
            var bin = Typr["B"];
            var b0 = data[offset], b1 = data[offset + 1];
            data[offset + 2];
            data[offset + 3];
            data[offset + 4];
            var vs = 1;
            var op = null, val = null;
            if (b0 <= 20) {
                op = b0;
                vs = 1;
            }
            if (b0 == 12) {
                op = b0 * 100 + b1;
                vs = 2;
            }
            if (21 <= b0 && b0 <= 27) {
                op = b0;
                vs = 1;
            }
            if (b0 == 28) {
                val = bin.readShort(data, offset + 1);
                vs = 3;
            }
            if (29 <= b0 && b0 <= 31) {
                op = b0;
                vs = 1;
            }
            if (32 <= b0 && b0 <= 246) {
                val = b0 - 139;
                vs = 1;
            }
            if (247 <= b0 && b0 <= 250) {
                val = (b0 - 247) * 256 + b1 + 108;
                vs = 2;
            }
            if (251 <= b0 && b0 <= 254) {
                val = -(b0 - 251) * 256 - b1 - 108;
                vs = 2;
            }
            if (b0 == 255) {
                val = bin.readInt(data, offset + 1) / 65535;
                vs = 5;
            }
            o.val = val != null ? val : "o" + op;
            o.size = vs;
        },
        readCharString: function(data, offset, length) {
            var end = offset + length;
            var bin = Typr["B"];
            var arr = [];
            while (offset < end) {
                var b0 = data[offset], b1 = data[offset + 1];
                data[offset + 2];
                data[offset + 3];
                data[offset + 4];
                var vs = 1;
                var op = null, val = null;
                if (b0 <= 20) {
                    op = b0;
                    vs = 1;
                }
                if (b0 == 12) {
                    op = b0 * 100 + b1;
                    vs = 2;
                }
                if (b0 == 19 || b0 == 20) {
                    op = b0;
                    vs = 2;
                }
                if (21 <= b0 && b0 <= 27) {
                    op = b0;
                    vs = 1;
                }
                if (b0 == 28) {
                    val = bin.readShort(data, offset + 1);
                    vs = 3;
                }
                if (29 <= b0 && b0 <= 31) {
                    op = b0;
                    vs = 1;
                }
                if (32 <= b0 && b0 <= 246) {
                    val = b0 - 139;
                    vs = 1;
                }
                if (247 <= b0 && b0 <= 250) {
                    val = (b0 - 247) * 256 + b1 + 108;
                    vs = 2;
                }
                if (251 <= b0 && b0 <= 254) {
                    val = -(b0 - 251) * 256 - b1 - 108;
                    vs = 2;
                }
                if (b0 == 255) {
                    val = bin.readInt(data, offset + 1) / 65535;
                    vs = 5;
                }
                arr.push(val != null ? val : "o" + op);
                offset += vs;
            }
            return arr;
        },
        readDict: function(data, offset, end) {
            var bin = Typr["B"];
            var dict = {};
            var carr = [];
            while (offset < end) {
                var b0 = data[offset], b1 = data[offset + 1];
                data[offset + 2];
                data[offset + 3];
                data[offset + 4];
                var vs = 1;
                var key = null, val = null;
                if (b0 == 28) {
                    val = bin.readShort(data, offset + 1);
                    vs = 3;
                }
                if (b0 == 29) {
                    val = bin.readInt(data, offset + 1);
                    vs = 5;
                }
                if (32 <= b0 && b0 <= 246) {
                    val = b0 - 139;
                    vs = 1;
                }
                if (247 <= b0 && b0 <= 250) {
                    val = (b0 - 247) * 256 + b1 + 108;
                    vs = 2;
                }
                if (251 <= b0 && b0 <= 254) {
                    val = -(b0 - 251) * 256 - b1 - 108;
                    vs = 2;
                }
                if (b0 == 255) {
                    val = bin.readInt(data, offset + 1) / 65535;
                    vs = 5;
                    throw "unknown number";
                }
                if (b0 == 30) {
                    var nibs = [];
                    vs = 1;
                    while (true) {
                        var b = data[offset + vs];
                        vs++;
                        var nib0 = b >> 4, nib1 = b & 15;
                        if (nib0 != 15) nibs.push(nib0);
                        if (nib1 != 15) nibs.push(nib1);
                        if (nib1 == 15) break;
                    }
                    var s = "";
                    var chars = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber" ];
                    for (var i = 0; i < nibs.length; i++) s += chars[nibs[i]];
                    val = parseFloat(s);
                }
                if (b0 <= 21) {
                    var keys = [ "version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX" ];
                    key = keys[b0];
                    vs = 1;
                    if (b0 == 12) {
                        var keys = [ "Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", "", "", "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", "", "", "", "", "", "", "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName" ];
                        key = keys[b1];
                        vs = 2;
                    }
                }
                if (key != null) {
                    dict[key] = carr.length == 1 ? carr[0] : carr;
                    carr = [];
                } else carr.push(val);
                offset += vs;
            }
            return dict;
        }
    };
    Typr["T"].cmap = {
        parseTab: function(data, offset, length) {
            var obj = {
                tables: [],
                ids: {},
                off: offset
            };
            data = new Uint8Array(data.buffer, offset, length);
            offset = 0;
            var bin = Typr["B"], rU = bin.readUshort, cmap = Typr["T"].cmap;
            rU(data, offset);
            offset += 2;
            var numTables = rU(data, offset);
            offset += 2;
            var offs = [];
            for (var i = 0; i < numTables; i++) {
                var platformID = rU(data, offset);
                offset += 2;
                var encodingID = rU(data, offset);
                offset += 2;
                var noffset = bin.readUint(data, offset);
                offset += 4;
                var id = "p" + platformID + "e" + encodingID;
                var tind = offs.indexOf(noffset);
                if (tind == -1) {
                    tind = obj.tables.length;
                    var subt = {};
                    offs.push(noffset);
                    var format = subt.format = rU(data, noffset);
                    if (format == 0) subt = cmap.parse0(data, noffset, subt); else if (format == 4) subt = cmap.parse4(data, noffset, subt); else if (format == 6) subt = cmap.parse6(data, noffset, subt); else if (format == 12) subt = cmap.parse12(data, noffset, subt);
                    obj.tables.push(subt);
                }
                if (obj.ids[id] != null) throw "multiple tables for one platform+encoding";
                obj.ids[id] = tind;
            }
            return obj;
        },
        parse0: function(data, offset, obj) {
            var bin = Typr["B"];
            offset += 2;
            var len = bin.readUshort(data, offset);
            offset += 2;
            bin.readUshort(data, offset);
            offset += 2;
            obj.map = [];
            for (var i = 0; i < len - 6; i++) obj.map.push(data[offset + i]);
            return obj;
        },
        parse4: function(data, offset, obj) {
            var bin = Typr["B"], rU = bin.readUshort, rUs = bin.readUshorts;
            var offset0 = offset;
            offset += 2;
            var length = rU(data, offset);
            offset += 2;
            rU(data, offset);
            offset += 2;
            var segCountX2 = rU(data, offset);
            offset += 2;
            var segCount = segCountX2 >>> 1;
            obj.searchRange = rU(data, offset);
            offset += 2;
            obj.entrySelector = rU(data, offset);
            offset += 2;
            obj.rangeShift = rU(data, offset);
            offset += 2;
            obj.endCount = rUs(data, offset, segCount);
            offset += segCount * 2;
            offset += 2;
            obj.startCount = rUs(data, offset, segCount);
            offset += segCount * 2;
            obj.idDelta = [];
            for (var i = 0; i < segCount; i++) {
                obj.idDelta.push(bin.readShort(data, offset));
                offset += 2;
            }
            obj.idRangeOffset = rUs(data, offset, segCount);
            offset += segCount * 2;
            obj.glyphIdArray = rUs(data, offset, offset0 + length - offset >>> 1);
            return obj;
        },
        parse6: function(data, offset, obj) {
            var bin = Typr["B"];
            offset += 2;
            bin.readUshort(data, offset);
            offset += 2;
            bin.readUshort(data, offset);
            offset += 2;
            obj.firstCode = bin.readUshort(data, offset);
            offset += 2;
            var entryCount = bin.readUshort(data, offset);
            offset += 2;
            obj.glyphIdArray = [];
            for (var i = 0; i < entryCount; i++) {
                obj.glyphIdArray.push(bin.readUshort(data, offset));
                offset += 2;
            }
            return obj;
        },
        parse12: function(data, offset, obj) {
            var bin = Typr["B"], rU = bin.readUint;
            offset += 4;
            rU(data, offset);
            offset += 4;
            rU(data, offset);
            offset += 4;
            var nGroups = rU(data, offset) * 3;
            offset += 4;
            var gps = obj.groups = new Uint32Array(nGroups);
            for (var i = 0; i < nGroups; i += 3) {
                gps[i] = rU(data, offset + (i << 2));
                gps[i + 1] = rU(data, offset + (i << 2) + 4);
                gps[i + 2] = rU(data, offset + (i << 2) + 8);
            }
            return obj;
        }
    };
    Typr["T"].glyf = {
        parseTab: function(data, offset, length, font) {
            var obj = [], ng = font["maxp"]["numGlyphs"];
            for (var g = 0; g < ng; g++) obj.push(null);
            return obj;
        },
        _parseGlyf: function(font, g) {
            var bin = Typr["B"];
            var data = font["_data"], loca = font["loca"];
            if (loca[g] == loca[g + 1]) return null;
            var offset = Typr["findTable"](data, "glyf", font["_offset"])[0] + loca[g];
            var gl = {};
            gl.noc = bin.readShort(data, offset);
            offset += 2;
            gl.xMin = bin.readShort(data, offset);
            offset += 2;
            gl.yMin = bin.readShort(data, offset);
            offset += 2;
            gl.xMax = bin.readShort(data, offset);
            offset += 2;
            gl.yMax = bin.readShort(data, offset);
            offset += 2;
            if (gl.xMin >= gl.xMax || gl.yMin >= gl.yMax) return null;
            if (gl.noc > 0) {
                gl.endPts = [];
                for (var i = 0; i < gl.noc; i++) {
                    gl.endPts.push(bin.readUshort(data, offset));
                    offset += 2;
                }
                var instructionLength = bin.readUshort(data, offset);
                offset += 2;
                if (data.length - offset < instructionLength) return null;
                gl.instructions = bin.readBytes(data, offset, instructionLength);
                offset += instructionLength;
                var crdnum = gl.endPts[gl.noc - 1] + 1;
                gl.flags = [];
                for (var i = 0; i < crdnum; i++) {
                    var flag = data[offset];
                    offset++;
                    gl.flags.push(flag);
                    if ((flag & 8) != 0) {
                        var rep = data[offset];
                        offset++;
                        for (var j = 0; j < rep; j++) {
                            gl.flags.push(flag);
                            i++;
                        }
                    }
                }
                gl.xs = [];
                for (var i = 0; i < crdnum; i++) {
                    var i8 = (gl.flags[i] & 2) != 0, same = (gl.flags[i] & 16) != 0;
                    if (i8) {
                        gl.xs.push(same ? data[offset] : -data[offset]);
                        offset++;
                    } else {
                        if (same) gl.xs.push(0); else {
                            gl.xs.push(bin.readShort(data, offset));
                            offset += 2;
                        }
                    }
                }
                gl.ys = [];
                for (var i = 0; i < crdnum; i++) {
                    var i8 = (gl.flags[i] & 4) != 0, same = (gl.flags[i] & 32) != 0;
                    if (i8) {
                        gl.ys.push(same ? data[offset] : -data[offset]);
                        offset++;
                    } else {
                        if (same) gl.ys.push(0); else {
                            gl.ys.push(bin.readShort(data, offset));
                            offset += 2;
                        }
                    }
                }
                var x = 0, y = 0;
                for (var i = 0; i < crdnum; i++) {
                    x += gl.xs[i];
                    y += gl.ys[i];
                    gl.xs[i] = x;
                    gl.ys[i] = y;
                }
            } else {
                var ARG_1_AND_2_ARE_WORDS = 1 << 0;
                var ARGS_ARE_XY_VALUES = 1 << 1;
                var WE_HAVE_A_SCALE = 1 << 3;
                var MORE_COMPONENTS = 1 << 5;
                var WE_HAVE_AN_X_AND_Y_SCALE = 1 << 6;
                var WE_HAVE_A_TWO_BY_TWO = 1 << 7;
                var WE_HAVE_INSTRUCTIONS = 1 << 8;
                gl.parts = [];
                var flags;
                do {
                    flags = bin.readUshort(data, offset);
                    offset += 2;
                    var part = {
                        m: {
                            a: 1,
                            b: 0,
                            c: 0,
                            d: 1,
                            tx: 0,
                            ty: 0
                        },
                        p1: -1,
                        p2: -1
                    };
                    gl.parts.push(part);
                    part.glyphIndex = bin.readUshort(data, offset);
                    offset += 2;
                    if (flags & ARG_1_AND_2_ARE_WORDS) {
                        var arg1 = bin.readShort(data, offset);
                        offset += 2;
                        var arg2 = bin.readShort(data, offset);
                        offset += 2;
                    } else {
                        var arg1 = bin.readInt8(data, offset);
                        offset++;
                        var arg2 = bin.readInt8(data, offset);
                        offset++;
                    }
                    if (flags & ARGS_ARE_XY_VALUES) {
                        part.m.tx = arg1;
                        part.m.ty = arg2;
                    } else {
                        part.p1 = arg1;
                        part.p2 = arg2;
                    }
                    if (flags & WE_HAVE_A_SCALE) {
                        part.m.a = part.m.d = bin.readF2dot14(data, offset);
                        offset += 2;
                    } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
                        part.m.a = bin.readF2dot14(data, offset);
                        offset += 2;
                        part.m.d = bin.readF2dot14(data, offset);
                        offset += 2;
                    } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
                        part.m.a = bin.readF2dot14(data, offset);
                        offset += 2;
                        part.m.b = bin.readF2dot14(data, offset);
                        offset += 2;
                        part.m.c = bin.readF2dot14(data, offset);
                        offset += 2;
                        part.m.d = bin.readF2dot14(data, offset);
                        offset += 2;
                    }
                } while (flags & MORE_COMPONENTS);
                if (flags & WE_HAVE_INSTRUCTIONS) {
                    var numInstr = bin.readUshort(data, offset);
                    offset += 2;
                    gl.instr = [];
                    for (var i = 0; i < numInstr; i++) {
                        gl.instr.push(data[offset]);
                        offset++;
                    }
                }
            }
            return gl;
        }
    };
    Typr["T"].head = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var obj = {};
            bin.readFixed(data, offset);
            offset += 4;
            obj["fontRevision"] = bin.readFixed(data, offset);
            offset += 4;
            bin.readUint(data, offset);
            offset += 4;
            bin.readUint(data, offset);
            offset += 4;
            obj["flags"] = bin.readUshort(data, offset);
            offset += 2;
            obj["unitsPerEm"] = bin.readUshort(data, offset);
            offset += 2;
            obj["created"] = bin.readUint64(data, offset);
            offset += 8;
            obj["modified"] = bin.readUint64(data, offset);
            offset += 8;
            obj["xMin"] = bin.readShort(data, offset);
            offset += 2;
            obj["yMin"] = bin.readShort(data, offset);
            offset += 2;
            obj["xMax"] = bin.readShort(data, offset);
            offset += 2;
            obj["yMax"] = bin.readShort(data, offset);
            offset += 2;
            obj["macStyle"] = bin.readUshort(data, offset);
            offset += 2;
            obj["lowestRecPPEM"] = bin.readUshort(data, offset);
            offset += 2;
            obj["fontDirectionHint"] = bin.readShort(data, offset);
            offset += 2;
            obj["indexToLocFormat"] = bin.readShort(data, offset);
            offset += 2;
            obj["glyphDataFormat"] = bin.readShort(data, offset);
            offset += 2;
            return obj;
        }
    };
    Typr["T"].hhea = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var obj = {};
            bin.readFixed(data, offset);
            offset += 4;
            var keys = [ "ascender", "descender", "lineGap", "advanceWidthMax", "minLeftSideBearing", "minRightSideBearing", "xMaxExtent", "caretSlopeRise", "caretSlopeRun", "caretOffset", "res0", "res1", "res2", "res3", "metricDataFormat", "numberOfHMetrics" ];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var func = key == "advanceWidthMax" || key == "numberOfHMetrics" ? bin.readUshort : bin.readShort;
                obj[key] = func(data, offset + i * 2);
            }
            return obj;
        }
    };
    Typr["T"].hmtx = {
        parseTab: function(data, offset, length, font) {
            var bin = Typr["B"];
            var aWidth = [];
            var lsBearing = [];
            var nG = font["maxp"]["numGlyphs"], nH = font["hhea"]["numberOfHMetrics"];
            var aw = 0, lsb = 0, i = 0;
            while (i < nH) {
                aw = bin.readUshort(data, offset + (i << 2));
                lsb = bin.readShort(data, offset + (i << 2) + 2);
                aWidth.push(aw);
                lsBearing.push(lsb);
                i++;
            }
            while (i < nG) {
                aWidth.push(aw);
                lsBearing.push(lsb);
                i++;
            }
            return {
                aWidth: aWidth,
                lsBearing: lsBearing
            };
        }
    };
    Typr["T"].kern = {
        parseTab: function(data, offset, length, font) {
            var bin = Typr["B"], kern = Typr["T"].kern;
            var version = bin.readUshort(data, offset);
            if (version == 1) return kern.parseV1(data, offset, length, font);
            var nTables = bin.readUshort(data, offset + 2);
            offset += 4;
            var map = {
                glyph1: [],
                rval: []
            };
            for (var i = 0; i < nTables; i++) {
                offset += 2;
                var length = bin.readUshort(data, offset);
                offset += 2;
                var coverage = bin.readUshort(data, offset);
                offset += 2;
                var format = coverage >>> 8;
                format &= 15;
                if (format == 0) offset = kern.readFormat0(data, offset, map);
            }
            return map;
        },
        parseV1: function(data, offset, length, font) {
            var bin = Typr["B"], kern = Typr["T"].kern;
            bin.readFixed(data, offset);
            var nTables = bin.readUint(data, offset + 4);
            offset += 8;
            var map = {
                glyph1: [],
                rval: []
            };
            for (var i = 0; i < nTables; i++) {
                bin.readUint(data, offset);
                offset += 4;
                var coverage = bin.readUshort(data, offset);
                offset += 2;
                bin.readUshort(data, offset);
                offset += 2;
                var format = coverage & 255;
                if (format == 0) offset = kern.readFormat0(data, offset, map);
            }
            return map;
        },
        readFormat0: function(data, offset, map) {
            var bin = Typr["B"], rUs = bin.readUshort;
            var pleft = -1;
            var nPairs = rUs(data, offset);
            rUs(data, offset + 2);
            rUs(data, offset + 4);
            rUs(data, offset + 6);
            offset += 8;
            for (var j = 0; j < nPairs; j++) {
                var left = rUs(data, offset);
                offset += 2;
                var right = rUs(data, offset);
                offset += 2;
                var value = bin.readShort(data, offset);
                offset += 2;
                if (left != pleft) {
                    map.glyph1.push(left);
                    map.rval.push({
                        glyph2: [],
                        vals: []
                    });
                }
                var rval = map.rval[map.rval.length - 1];
                rval.glyph2.push(right);
                rval.vals.push(value);
                pleft = left;
            }
            return offset;
        }
    };
    Typr["T"].loca = {
        parseTab: function(data, offset, length, font) {
            var bin = Typr["B"];
            var obj = [];
            var ver = font["head"]["indexToLocFormat"];
            var len = font["maxp"]["numGlyphs"] + 1;
            if (ver == 0) for (var i = 0; i < len; i++) obj.push(bin.readUshort(data, offset + (i << 1)) << 1);
            if (ver == 1) for (var i = 0; i < len; i++) obj.push(bin.readUint(data, offset + (i << 2)));
            return obj;
        }
    };
    Typr["T"].maxp = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"], rU = bin.readUshort;
            var obj = {};
            bin.readUint(data, offset);
            offset += 4;
            obj["numGlyphs"] = rU(data, offset);
            offset += 2;
            return obj;
        }
    };
    Typr["T"].name = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var obj = {};
            bin.readUshort(data, offset);
            offset += 2;
            var count = bin.readUshort(data, offset);
            offset += 2;
            bin.readUshort(data, offset);
            offset += 2;
            var names = [ "copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette" ];
            var offset0 = offset;
            var rU = bin.readUshort;
            for (var i = 0; i < count; i++) {
                var platformID = rU(data, offset);
                offset += 2;
                var encodingID = rU(data, offset);
                offset += 2;
                var languageID = rU(data, offset);
                offset += 2;
                var nameID = rU(data, offset);
                offset += 2;
                var slen = rU(data, offset);
                offset += 2;
                var noffset = rU(data, offset);
                offset += 2;
                var soff = offset0 + count * 12 + noffset;
                var str;
                if (platformID == 0) str = bin.readUnicode(data, soff, slen / 2); else if (platformID == 3 && encodingID == 0) str = bin.readUnicode(data, soff, slen / 2); else if (encodingID == 0) str = bin.readASCII(data, soff, slen); else if (encodingID == 1) str = bin.readUnicode(data, soff, slen / 2); else if (encodingID == 3) str = bin.readUnicode(data, soff, slen / 2); else if (encodingID == 4) str = bin.readUnicode(data, soff, slen / 2); else if (encodingID == 10) str = bin.readUnicode(data, soff, slen / 2); else if (platformID == 1) {
                    str = bin.readASCII(data, soff, slen);
                    console.log("reading unknown MAC encoding " + encodingID + " as ASCII");
                } else {
                    console.log("unknown encoding " + encodingID + ", platformID: " + platformID);
                    str = bin.readASCII(data, soff, slen);
                }
                var tid = "p" + platformID + "," + languageID.toString(16);
                if (obj[tid] == null) obj[tid] = {};
                obj[tid][names[nameID]] = str;
                obj[tid]["_lang"] = languageID;
            }
            var psn = "postScriptName";
            for (var p in obj) if (obj[p][psn] != null && obj[p]["_lang"] == 1033) return obj[p];
            for (var p in obj) if (obj[p][psn] != null && obj[p]["_lang"] == 0) return obj[p];
            for (var p in obj) if (obj[p][psn] != null && obj[p]["_lang"] == 3084) return obj[p];
            for (var p in obj) if (obj[p][psn] != null) return obj[p];
            var out;
            for (var p in obj) {
                out = obj[p];
                break;
            }
            console.log("returning name table with languageID " + out._lang);
            if (out[psn] == null && out["ID"] != null) out[psn] = out["ID"];
            return out;
        }
    };
    Typr["T"].OS2 = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var ver = bin.readUshort(data, offset);
            offset += 2;
            var OS2 = Typr["T"].OS2;
            var obj = {};
            if (ver == 0) OS2.version0(data, offset, obj); else if (ver == 1) OS2.version1(data, offset, obj); else if (ver == 2 || ver == 3 || ver == 4) OS2.version2(data, offset, obj); else if (ver == 5) OS2.version5(data, offset, obj); else throw "unknown OS/2 table version: " + ver;
            return obj;
        },
        version0: function(data, offset, obj) {
            var bin = Typr["B"];
            obj["xAvgCharWidth"] = bin.readShort(data, offset);
            offset += 2;
            obj["usWeightClass"] = bin.readUshort(data, offset);
            offset += 2;
            obj["usWidthClass"] = bin.readUshort(data, offset);
            offset += 2;
            obj["fsType"] = bin.readUshort(data, offset);
            offset += 2;
            obj["ySubscriptXSize"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySubscriptYSize"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySubscriptXOffset"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySubscriptYOffset"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySuperscriptXSize"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySuperscriptYSize"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySuperscriptXOffset"] = bin.readShort(data, offset);
            offset += 2;
            obj["ySuperscriptYOffset"] = bin.readShort(data, offset);
            offset += 2;
            obj["yStrikeoutSize"] = bin.readShort(data, offset);
            offset += 2;
            obj["yStrikeoutPosition"] = bin.readShort(data, offset);
            offset += 2;
            obj["sFamilyClass"] = bin.readShort(data, offset);
            offset += 2;
            obj["panose"] = bin.readBytes(data, offset, 10);
            offset += 10;
            obj["ulUnicodeRange1"] = bin.readUint(data, offset);
            offset += 4;
            obj["ulUnicodeRange2"] = bin.readUint(data, offset);
            offset += 4;
            obj["ulUnicodeRange3"] = bin.readUint(data, offset);
            offset += 4;
            obj["ulUnicodeRange4"] = bin.readUint(data, offset);
            offset += 4;
            obj["achVendID"] = bin.readASCII(data, offset, 4);
            offset += 4;
            obj["fsSelection"] = bin.readUshort(data, offset);
            offset += 2;
            obj["usFirstCharIndex"] = bin.readUshort(data, offset);
            offset += 2;
            obj["usLastCharIndex"] = bin.readUshort(data, offset);
            offset += 2;
            obj["sTypoAscender"] = bin.readShort(data, offset);
            offset += 2;
            obj["sTypoDescender"] = bin.readShort(data, offset);
            offset += 2;
            obj["sTypoLineGap"] = bin.readShort(data, offset);
            offset += 2;
            obj["usWinAscent"] = bin.readUshort(data, offset);
            offset += 2;
            obj["usWinDescent"] = bin.readUshort(data, offset);
            offset += 2;
            return offset;
        },
        version1: function(data, offset, obj) {
            var bin = Typr["B"];
            offset = Typr["T"].OS2.version0(data, offset, obj);
            obj["ulCodePageRange1"] = bin.readUint(data, offset);
            offset += 4;
            obj["ulCodePageRange2"] = bin.readUint(data, offset);
            offset += 4;
            return offset;
        },
        version2: function(data, offset, obj) {
            var bin = Typr["B"], rU = bin.readUshort;
            offset = Typr["T"].OS2.version1(data, offset, obj);
            obj["sxHeight"] = bin.readShort(data, offset);
            offset += 2;
            obj["sCapHeight"] = bin.readShort(data, offset);
            offset += 2;
            obj["usDefault"] = rU(data, offset);
            offset += 2;
            obj["usBreak"] = rU(data, offset);
            offset += 2;
            obj["usMaxContext"] = rU(data, offset);
            offset += 2;
            return offset;
        },
        version5: function(data, offset, obj) {
            var rU = Typr["B"].readUshort;
            offset = Typr["T"].OS2.version2(data, offset, obj);
            obj["usLowerOpticalPointSize"] = rU(data, offset);
            offset += 2;
            obj["usUpperOpticalPointSize"] = rU(data, offset);
            offset += 2;
            return offset;
        }
    };
    Typr["T"].post = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var obj = {};
            obj["version"] = bin.readFixed(data, offset);
            offset += 4;
            obj["italicAngle"] = bin.readFixed(data, offset);
            offset += 4;
            obj["underlinePosition"] = bin.readShort(data, offset);
            offset += 2;
            obj["underlineThickness"] = bin.readShort(data, offset);
            offset += 2;
            return obj;
        }
    };
    Typr["T"].SVG = {
        parseTab: function(data, offset, length) {
            var bin = Typr["B"];
            var obj = {
                entries: []
            };
            var offset0 = offset;
            bin.readUshort(data, offset);
            offset += 2;
            var svgDocIndexOffset = bin.readUint(data, offset);
            offset += 4;
            bin.readUint(data, offset);
            offset += 4;
            offset = svgDocIndexOffset + offset0;
            var numEntries = bin.readUshort(data, offset);
            offset += 2;
            for (var i = 0; i < numEntries; i++) {
                var startGlyphID = bin.readUshort(data, offset);
                offset += 2;
                var endGlyphID = bin.readUshort(data, offset);
                offset += 2;
                var svgDocOffset = bin.readUint(data, offset);
                offset += 4;
                var svgDocLength = bin.readUint(data, offset);
                offset += 4;
                var sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
                var svg = bin.readUTF8(sbuf, 0, sbuf.length);
                for (var f = startGlyphID; f <= endGlyphID; f++) {
                    obj.entries[f] = svg;
                }
            }
            return obj;
        }
    };
    Typr["U"] = {
        shape: function(font, str, ltr) {
            var getGlyphPosition = function(font, gls, i1, ltr) {
                var g1 = gls[i1], g2 = gls[i1 + 1], kern = font["kern"];
                if (kern) {
                    var ind1 = kern.glyph1.indexOf(g1);
                    if (ind1 != -1) {
                        var ind2 = kern.rval[ind1].glyph2.indexOf(g2);
                        if (ind2 != -1) return [ 0, 0, kern.rval[ind1].vals[ind2], 0 ];
                    }
                }
                return [ 0, 0, 0, 0 ];
            };
            var gls = [];
            for (var i = 0; i < str.length; i++) {
                var cc = str.codePointAt(i);
                if (cc > 65535) i++;
                gls.push(Typr["U"]["codeToGlyph"](font, cc));
            }
            var shape = [];
            for (var i = 0; i < gls.length; i++) {
                var padj = getGlyphPosition(font, gls, i);
                var gid = gls[i];
                var ax = font["hmtx"].aWidth[gid] + padj[2];
                shape.push({
                    g: gid,
                    cl: i,
                    dx: 0,
                    dy: 0,
                    ax: ax,
                    ay: 0
                });
            }
            return shape;
        },
        shapeToPath: function(font, shape, clr) {
            var tpath = {
                cmds: [],
                crds: []
            };
            var x = 0, y = 0;
            for (var i = 0; i < shape.length; i++) {
                var it = shape[i];
                var path = Typr["U"]["glyphToPath"](font, it["g"]), crds = path["crds"];
                for (var j = 0; j < crds.length; j += 2) {
                    tpath.crds.push(crds[j] + x + it["dx"]);
                    tpath.crds.push(crds[j + 1] + y + it["dy"]);
                }
                if (clr) tpath.cmds.push(clr);
                for (var j = 0; j < path["cmds"].length; j++) tpath.cmds.push(path["cmds"][j]);
                var clen = tpath.cmds.length;
                if (clr) if (clen != 0 && tpath.cmds[clen - 1] != "X") tpath.cmds.push("X");
                x += it["ax"];
                y += it["ay"];
            }
            return {
                cmds: tpath.cmds,
                crds: tpath.crds
            };
        },
        codeToGlyph: function(font, code) {
            var cmap = font["cmap"];
            var tind = -1, pps = [ "p3e10", "p0e4", "p3e1", "p1e0", "p0e3", "p0e1" ];
            for (var i = 0; i < pps.length; i++) if (cmap.ids[pps[i]] != null) {
                tind = cmap.ids[pps[i]];
                break;
            }
            if (tind == -1) throw "no familiar platform and encoding!";
            var arrSearch = function(arr, k, v) {
                var l = 0, r = Math.floor(arr.length / k);
                while (l + 1 != r) {
                    var mid = l + (r - l >>> 1);
                    if (arr[mid * k] <= v) l = mid; else r = mid;
                }
                return l * k;
            };
            var tab = cmap.tables[tind], fmt = tab.format, gid = -1;
            if (fmt == 0) {
                if (code >= tab.map.length) gid = 0; else gid = tab.map[code];
            } else if (fmt == 4) {
                var sind = -1, ec = tab.endCount;
                if (code > ec[ec.length - 1]) sind = -1; else {
                    sind = arrSearch(ec, 1, code);
                    if (ec[sind] < code) sind++;
                }
                if (sind == -1) gid = 0; else if (code < tab.startCount[sind]) gid = 0; else {
                    var gli = 0;
                    if (tab.idRangeOffset[sind] != 0) gli = tab.glyphIdArray[code - tab.startCount[sind] + (tab.idRangeOffset[sind] >> 1) - (tab.idRangeOffset.length - sind)]; else gli = code + tab.idDelta[sind];
                    gid = gli & 65535;
                }
            } else if (fmt == 6) {
                var off = code - tab.firstCode, arr = tab.glyphIdArray;
                if (off < 0 || off >= arr.length) gid = 0; else gid = arr[off];
            } else if (fmt == 12) {
                var grp = tab.groups;
                if (code > grp[grp.length - 2]) gid = 0; else {
                    var i = arrSearch(grp, 3, code);
                    if (grp[i] <= code && code <= grp[i + 1]) {
                        gid = grp[i + 2] + (code - grp[i]);
                    }
                    if (gid == -1) gid = 0;
                }
            } else throw "unknown cmap table format " + tab.format;
            var SVG = font["SVG "], loca = font["loca"];
            if (gid != 0 && font["CFF "] == null && (SVG == null || SVG.entries[gid] == null) && loca[gid] == loca[gid + 1] && [ 9, 10, 11, 12, 13, 32, 133, 160, 5760, 8232, 8233, 8239, 12288, 6158, 8203, 8204, 8205, 8288, 65279 ].indexOf(code) == -1 && !(8192 <= code && code <= 8202)) gid = 0;
            return gid;
        },
        glyphToPath: function(font, gid) {
            var path = {
                cmds: [],
                crds: []
            };
            var SVG = font["SVG "], CFF = font["CFF "];
            var U = Typr["U"];
            if (SVG && SVG.entries[gid]) {
                var p = SVG.entries[gid];
                if (p != null) {
                    if (typeof p == "string") {
                        p = U["SVG"].toPath(p);
                        SVG.entries[gid] = p;
                    }
                    path = p;
                }
            } else if (CFF) {
                var pdct = CFF["Private"];
                var state = {
                    x: 0,
                    y: 0,
                    stack: [],
                    nStems: 0,
                    haveWidth: false,
                    width: pdct ? pdct["defaultWidthX"] : 0,
                    open: false
                };
                if (CFF["ROS"]) {
                    var gi = 0;
                    while (CFF["FDSelect"][gi + 2] <= gid) gi += 2;
                    pdct = CFF["FDArray"][CFF["FDSelect"][gi + 1]]["Private"];
                }
                U["_drawCFF"](CFF["CharStrings"][gid], state, CFF, pdct, path);
            } else if (font["glyf"]) {
                U["_drawGlyf"](gid, font, path);
            }
            return {
                cmds: path.cmds,
                crds: path.crds
            };
        },
        _drawGlyf: function(gid, font, path) {
            var gl = font["glyf"][gid];
            if (gl == null) gl = font["glyf"][gid] = Typr["T"].glyf._parseGlyf(font, gid);
            if (gl != null) {
                if (gl.noc > -1) Typr["U"]["_simpleGlyph"](gl, path); else Typr["U"]["_compoGlyph"](gl, font, path);
            }
        },
        _simpleGlyph: function(gl, p) {
            var P = Typr["U"]["P"];
            for (var c = 0; c < gl.noc; c++) {
                var i0 = c == 0 ? 0 : gl.endPts[c - 1] + 1;
                var il = gl.endPts[c];
                for (var i = i0; i <= il; i++) {
                    var pr = i == i0 ? il : i - 1;
                    var nx = i == il ? i0 : i + 1;
                    var onCurve = gl.flags[i] & 1;
                    var prOnCurve = gl.flags[pr] & 1;
                    var nxOnCurve = gl.flags[nx] & 1;
                    var x = gl.xs[i], y = gl.ys[i];
                    if (i == i0) {
                        if (onCurve) {
                            if (prOnCurve) P.MoveTo(p, gl.xs[pr], gl.ys[pr]); else {
                                P.MoveTo(p, x, y);
                                continue;
                            }
                        } else {
                            if (prOnCurve) P.MoveTo(p, gl.xs[pr], gl.ys[pr]); else P.MoveTo(p, Math.floor((gl.xs[pr] + x) * .5), Math.floor((gl.ys[pr] + y) * .5));
                        }
                    }
                    if (onCurve) {
                        if (prOnCurve) P.LineTo(p, x, y);
                    } else {
                        if (nxOnCurve) P.qCurveTo(p, x, y, gl.xs[nx], gl.ys[nx]); else P.qCurveTo(p, x, y, Math.floor((x + gl.xs[nx]) * .5), Math.floor((y + gl.ys[nx]) * .5));
                    }
                }
                P.ClosePath(p);
            }
        },
        _compoGlyph: function(gl, font, p) {
            for (var j = 0; j < gl.parts.length; j++) {
                var path = {
                    cmds: [],
                    crds: []
                };
                var prt = gl.parts[j];
                Typr["U"]["_drawGlyf"](prt.glyphIndex, font, path);
                var m = prt.m;
                for (var i = 0; i < path.crds.length; i += 2) {
                    var x = path.crds[i], y = path.crds[i + 1];
                    p.crds.push(x * m.a + y * m.b + m.tx);
                    p.crds.push(x * m.c + y * m.d + m.ty);
                }
                for (var i = 0; i < path.cmds.length; i++) p.cmds.push(path.cmds[i]);
            }
        },
        pathToSVG: function(path, prec) {
            var cmds = path["cmds"], crds = path["crds"];
            if (prec == null) prec = 5;
            var out = [], co = 0, lmap = {
                M: 2,
                L: 2,
                Q: 4,
                C: 6
            };
            for (var i = 0; i < cmds.length; i++) {
                var cmd = cmds[i], cn = co + (lmap[cmd] ? lmap[cmd] : 0);
                out.push(cmd);
                while (co < cn) {
                    var c = crds[co++];
                    out.push(parseFloat(c.toFixed(prec)) + (co == cn ? "" : " "));
                }
            }
            return out.join("");
        },
        SVGToPath: function(d) {
            var pth = {
                cmds: [],
                crds: []
            };
            Typr["U"]["SVG"].svgToPath(d, pth);
            return {
                cmds: pth.cmds,
                crds: pth.crds
            };
        },
        pathToContext: function(path, ctx) {
            var c = 0, cmds = path["cmds"], crds = path["crds"];
            for (var j = 0; j < cmds.length; j++) {
                var cmd = cmds[j];
                if (cmd == "M") {
                    ctx.moveTo(crds[c], crds[c + 1]);
                    c += 2;
                } else if (cmd == "L") {
                    ctx.lineTo(crds[c], crds[c + 1]);
                    c += 2;
                } else if (cmd == "C") {
                    ctx.bezierCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3], crds[c + 4], crds[c + 5]);
                    c += 6;
                } else if (cmd == "Q") {
                    ctx.quadraticCurveTo(crds[c], crds[c + 1], crds[c + 2], crds[c + 3]);
                    c += 4;
                } else if (cmd.charAt(0) == "#") {
                    ctx.beginPath();
                    ctx.fillStyle = cmd;
                } else if (cmd == "Z") {
                    ctx.closePath();
                } else if (cmd == "X") {
                    ctx.fill();
                }
            }
        },
        P: {
            MoveTo: function(p, x, y) {
                p.cmds.push("M");
                p.crds.push(x, y);
            },
            LineTo: function(p, x, y) {
                p.cmds.push("L");
                p.crds.push(x, y);
            },
            CurveTo: function(p, a, b, c, d, e, f) {
                p.cmds.push("C");
                p.crds.push(a, b, c, d, e, f);
            },
            qCurveTo: function(p, a, b, c, d) {
                p.cmds.push("Q");
                p.crds.push(a, b, c, d);
            },
            ClosePath: function(p) {
                p.cmds.push("Z");
            }
        },
        _drawCFF: function(cmds, state, font, pdct, p) {
            var stack = state.stack;
            var nStems = state.nStems, haveWidth = state.haveWidth, width = state.width, open = state.open;
            var i = 0;
            var x = state.x, y = state.y, c1x = 0, c1y = 0, c2x = 0, c2y = 0, c3x = 0, c3y = 0, c4x = 0, c4y = 0, jpx = 0, jpy = 0;
            var CFF = Typr["T"].CFF, P = Typr["U"]["P"];
            var nominalWidthX = pdct["nominalWidthX"];
            var o = {
                val: 0,
                size: 0
            };
            while (i < cmds.length) {
                CFF.getCharString(cmds, i, o);
                var v = o.val;
                i += o.size;
                if (v == "o1" || v == "o18") {
                    var hasWidthArg;
                    hasWidthArg = stack.length % 2 !== 0;
                    if (hasWidthArg && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                    }
                    nStems += stack.length >> 1;
                    stack.length = 0;
                    haveWidth = true;
                } else if (v == "o3" || v == "o23") {
                    var hasWidthArg;
                    hasWidthArg = stack.length % 2 !== 0;
                    if (hasWidthArg && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                    }
                    nStems += stack.length >> 1;
                    stack.length = 0;
                    haveWidth = true;
                } else if (v == "o4") {
                    if (stack.length > 1 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    if (open) P.ClosePath(p);
                    y += stack.pop();
                    P.MoveTo(p, x, y);
                    open = true;
                } else if (v == "o5") {
                    while (stack.length > 0) {
                        x += stack.shift();
                        y += stack.shift();
                        P.LineTo(p, x, y);
                    }
                } else if (v == "o6" || v == "o7") {
                    var count = stack.length;
                    var isX = v == "o6";
                    for (var j = 0; j < count; j++) {
                        var sval = stack.shift();
                        if (isX) x += sval; else y += sval;
                        isX = !isX;
                        P.LineTo(p, x, y);
                    }
                } else if (v == "o8" || v == "o24") {
                    var count = stack.length;
                    var index = 0;
                    while (index + 6 <= count) {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y + stack.shift();
                        P.CurveTo(p, c1x, c1y, c2x, c2y, x, y);
                        index += 6;
                    }
                    if (v == "o24") {
                        x += stack.shift();
                        y += stack.shift();
                        P.LineTo(p, x, y);
                    }
                } else if (v == "o11") break; else if (v == "o1234" || v == "o1235" || v == "o1236" || v == "o1237") {
                    if (v == "o1234") {
                        c1x = x + stack.shift();
                        c1y = y;
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        jpx = c2x + stack.shift();
                        jpy = c2y;
                        c3x = jpx + stack.shift();
                        c3y = c2y;
                        c4x = c3x + stack.shift();
                        c4y = y;
                        x = c4x + stack.shift();
                        P.CurveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
                        P.CurveTo(p, c3x, c3y, c4x, c4y, x, y);
                    }
                    if (v == "o1235") {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        jpx = c2x + stack.shift();
                        jpy = c2y + stack.shift();
                        c3x = jpx + stack.shift();
                        c3y = jpy + stack.shift();
                        c4x = c3x + stack.shift();
                        c4y = c3y + stack.shift();
                        x = c4x + stack.shift();
                        y = c4y + stack.shift();
                        stack.shift();
                        P.CurveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
                        P.CurveTo(p, c3x, c3y, c4x, c4y, x, y);
                    }
                    if (v == "o1236") {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        jpx = c2x + stack.shift();
                        jpy = c2y;
                        c3x = jpx + stack.shift();
                        c3y = c2y;
                        c4x = c3x + stack.shift();
                        c4y = c3y + stack.shift();
                        x = c4x + stack.shift();
                        P.CurveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
                        P.CurveTo(p, c3x, c3y, c4x, c4y, x, y);
                    }
                    if (v == "o1237") {
                        c1x = x + stack.shift();
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        jpx = c2x + stack.shift();
                        jpy = c2y + stack.shift();
                        c3x = jpx + stack.shift();
                        c3y = jpy + stack.shift();
                        c4x = c3x + stack.shift();
                        c4y = c3y + stack.shift();
                        if (Math.abs(c4x - x) > Math.abs(c4y - y)) {
                            x = c4x + stack.shift();
                        } else {
                            y = c4y + stack.shift();
                        }
                        P.CurveTo(p, c1x, c1y, c2x, c2y, jpx, jpy);
                        P.CurveTo(p, c3x, c3y, c4x, c4y, x, y);
                    }
                } else if (v == "o14") {
                    if (stack.length > 0 && !haveWidth) {
                        width = stack.shift() + font["nominalWidthX"];
                        haveWidth = true;
                    }
                    if (stack.length == 4) {
                        var adx = stack.shift();
                        var ady = stack.shift();
                        var bchar = stack.shift();
                        var achar = stack.shift();
                        var bind = CFF.glyphBySE(font, bchar);
                        var aind = CFF.glyphBySE(font, achar);
                        Typr["U"]["_drawCFF"](font["CharStrings"][bind], state, font, pdct, p);
                        state.x = adx;
                        state.y = ady;
                        Typr["U"]["_drawCFF"](font["CharStrings"][aind], state, font, pdct, p);
                    }
                    if (open) {
                        P.ClosePath(p);
                        open = false;
                    }
                } else if (v == "o19" || v == "o20") {
                    var hasWidthArg;
                    hasWidthArg = stack.length % 2 !== 0;
                    if (hasWidthArg && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                    }
                    nStems += stack.length >> 1;
                    stack.length = 0;
                    haveWidth = true;
                    i += nStems + 7 >> 3;
                } else if (v == "o21") {
                    if (stack.length > 2 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    y += stack.pop();
                    x += stack.pop();
                    if (open) P.ClosePath(p);
                    P.MoveTo(p, x, y);
                    open = true;
                } else if (v == "o22") {
                    if (stack.length > 1 && !haveWidth) {
                        width = stack.shift() + nominalWidthX;
                        haveWidth = true;
                    }
                    x += stack.pop();
                    if (open) P.ClosePath(p);
                    P.MoveTo(p, x, y);
                    open = true;
                } else if (v == "o25") {
                    while (stack.length > 6) {
                        x += stack.shift();
                        y += stack.shift();
                        P.LineTo(p, x, y);
                    }
                    c1x = x + stack.shift();
                    c1y = y + stack.shift();
                    c2x = c1x + stack.shift();
                    c2y = c1y + stack.shift();
                    x = c2x + stack.shift();
                    y = c2y + stack.shift();
                    P.CurveTo(p, c1x, c1y, c2x, c2y, x, y);
                } else if (v == "o26") {
                    if (stack.length % 2) {
                        x += stack.shift();
                    }
                    while (stack.length > 0) {
                        c1x = x;
                        c1y = y + stack.shift();
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x;
                        y = c2y + stack.shift();
                        P.CurveTo(p, c1x, c1y, c2x, c2y, x, y);
                    }
                } else if (v == "o27") {
                    if (stack.length % 2) {
                        y += stack.shift();
                    }
                    while (stack.length > 0) {
                        c1x = x + stack.shift();
                        c1y = y;
                        c2x = c1x + stack.shift();
                        c2y = c1y + stack.shift();
                        x = c2x + stack.shift();
                        y = c2y;
                        P.CurveTo(p, c1x, c1y, c2x, c2y, x, y);
                    }
                } else if (v == "o10" || v == "o29") {
                    var obj = v == "o10" ? pdct : font;
                    if (stack.length == 0) {
                        console.log("error: empty stack");
                    } else {
                        var ind = stack.pop();
                        var subr = obj["Subrs"][ind + obj["Bias"]];
                        state.x = x;
                        state.y = y;
                        state.nStems = nStems;
                        state.haveWidth = haveWidth;
                        state.width = width;
                        state.open = open;
                        Typr["U"]["_drawCFF"](subr, state, font, pdct, p);
                        x = state.x;
                        y = state.y;
                        nStems = state.nStems;
                        haveWidth = state.haveWidth;
                        width = state.width;
                        open = state.open;
                    }
                } else if (v == "o30" || v == "o31") {
                    var count, count1 = stack.length;
                    var index = 0;
                    var alternate = v == "o31";
                    count = count1 & ~2;
                    index += count1 - count;
                    while (index < count) {
                        if (alternate) {
                            c1x = x + stack.shift();
                            c1y = y;
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            y = c2y + stack.shift();
                            if (count - index == 5) {
                                x = c2x + stack.shift();
                                index++;
                            } else x = c2x;
                            alternate = false;
                        } else {
                            c1x = x;
                            c1y = y + stack.shift();
                            c2x = c1x + stack.shift();
                            c2y = c1y + stack.shift();
                            x = c2x + stack.shift();
                            if (count - index == 5) {
                                y = c2y + stack.shift();
                                index++;
                            } else y = c2y;
                            alternate = true;
                        }
                        P.CurveTo(p, c1x, c1y, c2x, c2y, x, y);
                        index += 4;
                    }
                } else if ((v + "").charAt(0) == "o") {
                    console.log("Unknown operation: " + v, cmds);
                    throw v;
                } else stack.push(v);
            }
            state.x = x;
            state.y = y;
            state.nStems = nStems;
            state.haveWidth = haveWidth;
            state.width = width;
            state.open = open;
        },
        SVG: function() {
            var M = {
                getScale: function(m) {
                    return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
                },
                translate: function(m, x, y) {
                    M.concat(m, [ 1, 0, 0, 1, x, y ]);
                },
                rotate: function(m, a) {
                    M.concat(m, [ Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a), 0, 0 ]);
                },
                scale: function(m, x, y) {
                    M.concat(m, [ x, 0, 0, y, 0, 0 ]);
                },
                concat: function(m, w) {
                    var a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    m[0] = a * w[0] + b * w[2];
                    m[1] = a * w[1] + b * w[3];
                    m[2] = c * w[0] + d * w[2];
                    m[3] = c * w[1] + d * w[3];
                    m[4] = tx * w[0] + ty * w[2] + w[4];
                    m[5] = tx * w[1] + ty * w[3] + w[5];
                },
                invert: function(m) {
                    var a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5], adbc = a * d - b * c;
                    m[0] = d / adbc;
                    m[1] = -b / adbc;
                    m[2] = -c / adbc;
                    m[3] = a / adbc;
                    m[4] = (c * ty - d * tx) / adbc;
                    m[5] = (b * tx - a * ty) / adbc;
                },
                multPoint: function(m, p) {
                    var x = p[0], y = p[1];
                    return [ x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5] ];
                },
                multArray: function(m, a) {
                    for (var i = 0; i < a.length; i += 2) {
                        var x = a[i], y = a[i + 1];
                        a[i] = x * m[0] + y * m[2] + m[4];
                        a[i + 1] = x * m[1] + y * m[3] + m[5];
                    }
                }
            };
            function _bracketSplit(str, lbr, rbr) {
                var out = [], pos = 0, ci = 0, lvl = 0;
                while (true) {
                    var li = str.indexOf(lbr, ci);
                    var ri = str.indexOf(rbr, ci);
                    if (li == -1 && ri == -1) break;
                    if (ri == -1 || li != -1 && li < ri) {
                        if (lvl == 0) {
                            out.push(str.slice(pos, li).trim());
                            pos = li + 1;
                        }
                        lvl++;
                        ci = li + 1;
                    } else if (li == -1 || ri != -1 && ri < li) {
                        lvl--;
                        if (lvl == 0) {
                            out.push(str.slice(pos, ri).trim());
                            pos = ri + 1;
                        }
                        ci = ri + 1;
                    }
                }
                return out;
            }
            function cssMap(str) {
                var pts = _bracketSplit(str, "{", "}");
                var css = {};
                for (var i = 0; i < pts.length; i += 2) {
                    var cn = pts[i].split(",");
                    for (var j = 0; j < cn.length; j++) {
                        var cnj = cn[j].trim();
                        if (css[cnj] == null) css[cnj] = "";
                        css[cnj] += pts[i + 1];
                    }
                }
                return css;
            }
            function readTrnf(trna) {
                var pts = _bracketSplit(trna, "(", ")");
                var m = [ 1, 0, 0, 1, 0, 0 ];
                for (var i = 0; i < pts.length; i += 2) {
                    var om = m;
                    m = _readTrnsAttr(pts[i], pts[i + 1]);
                    M.concat(m, om);
                }
                return m;
            }
            function _readTrnsAttr(fnc, vls) {
                var m = [ 1, 0, 0, 1, 0, 0 ], gotSep = true;
                for (var i = 0; i < vls.length; i++) {
                    var ch = vls.charAt(i);
                    if (ch == "," || ch == " ") gotSep = true; else if (ch == ".") {
                        if (!gotSep) {
                            vls = vls.slice(0, i) + "," + vls.slice(i);
                            i++;
                        }
                        gotSep = false;
                    } else if (ch == "-" && i > 0 && vls[i - 1] != "e") {
                        vls = vls.slice(0, i) + " " + vls.slice(i);
                        i++;
                        gotSep = true;
                    }
                }
                vls = vls.split(/\s*[\s,]\s*/).map(parseFloat);
                if (fnc == "translate") {
                    if (vls.length == 1) M.translate(m, vls[0], 0); else M.translate(m, vls[0], vls[1]);
                } else if (fnc == "scale") {
                    if (vls.length == 1) M.scale(m, vls[0], vls[0]); else M.scale(m, vls[0], vls[1]);
                } else if (fnc == "rotate") {
                    var tx = 0, ty = 0;
                    if (vls.length != 1) {
                        tx = vls[1];
                        ty = vls[2];
                    }
                    M.translate(m, -tx, -ty);
                    M.rotate(m, -Math.PI * vls[0] / 180);
                    M.translate(m, tx, ty);
                } else if (fnc == "matrix") m = vls; else console.log("unknown transform: ", fnc);
                return m;
            }
            function toPath(str) {
                var pth = {
                    cmds: [],
                    crds: []
                };
                if (str == null) return pth;
                var prsr = new DOMParser();
                var doc = prsr["parseFromString"](str, "image/svg+xml");
                var svg = doc.getElementsByTagName("svg")[0];
                var vb = svg.getAttribute("viewBox");
                if (vb) vb = vb.trim().split(" ").map(parseFloat); else vb = [ 0, 0, 1e3, 1e3 ];
                _toPath(svg.children, pth);
                for (var i = 0; i < pth.crds.length; i += 2) {
                    var x = pth.crds[i], y = pth.crds[i + 1];
                    x -= vb[0];
                    y -= vb[1];
                    y = -y;
                    pth.crds[i] = x;
                    pth.crds[i + 1] = y;
                }
                return pth;
            }
            function _toPath(nds, pth, fill) {
                for (var ni = 0; ni < nds.length; ni++) {
                    var nd = nds[ni], tn = nd.tagName;
                    var cfl = nd.getAttribute("fill");
                    if (cfl == null) cfl = fill;
                    if (tn == "g") {
                        var tp = {
                            crds: [],
                            cmds: []
                        };
                        _toPath(nd.children, tp, cfl);
                        var trf = nd.getAttribute("transform");
                        if (trf) {
                            var m = readTrnf(trf);
                            M.multArray(m, tp.crds);
                        }
                        pth.crds = pth.crds.concat(tp.crds);
                        pth.cmds = pth.cmds.concat(tp.cmds);
                    } else if (tn == "path" || tn == "circle" || tn == "ellipse") {
                        pth.cmds.push(cfl ? cfl : "#000000");
                        var d;
                        if (tn == "path") d = nd.getAttribute("d");
                        if (tn == "circle" || tn == "ellipse") {
                            var vls = [ 0, 0, 0, 0 ], nms = [ "cx", "cy", "rx", "ry", "r" ];
                            for (var i = 0; i < 5; i++) {
                                var V = nd.getAttribute(nms[i]);
                                if (V) {
                                    V = parseFloat(V);
                                    if (i < 4) vls[i] = V; else vls[2] = vls[3] = V;
                                }
                            }
                            var cx = vls[0], cy = vls[1], rx = vls[2], ry = vls[3];
                            d = [ "M", cx - rx, cy, "a", rx, ry, 0, 1, 0, rx * 2, 0, "a", rx, ry, 0, 1, 0, -rx * 2, 0 ].join(" ");
                        }
                        svgToPath(d, pth);
                        pth.cmds.push("X");
                    } else if (tn == "defs"); else console.log(tn, nd);
                }
            }
            function _tokens(d) {
                var ts = [], off = 0, rn = false, cn = "", pc = "";
                while (off < d.length) {
                    var cc = d.charCodeAt(off), ch = d.charAt(off);
                    off++;
                    var isNum = 48 <= cc && cc <= 57 || ch == "." || ch == "-" || ch == "e" || ch == "E";
                    if (rn) {
                        if (ch == "-" && pc != "e" || ch == "." && cn.indexOf(".") != -1) {
                            ts.push(parseFloat(cn));
                            cn = ch;
                        } else if (isNum) cn += ch; else {
                            ts.push(parseFloat(cn));
                            if (ch != "," && ch != " ") ts.push(ch);
                            rn = false;
                        }
                    } else {
                        if (isNum) {
                            cn = ch;
                            rn = true;
                        } else if (ch != "," && ch != " ") ts.push(ch);
                    }
                    pc = ch;
                }
                if (rn) ts.push(parseFloat(cn));
                return ts;
            }
            function _reps(ts, off, ps) {
                var i = off;
                while (i < ts.length) {
                    if (typeof ts[i] == "string") break;
                    i += ps;
                }
                return (i - off) / ps;
            }
            function svgToPath(d, pth) {
                var ts = _tokens(d);
                var i = 0, x = 0, y = 0, ox = 0, oy = 0, oldo = pth.crds.length;
                var pc = {
                    M: 2,
                    L: 2,
                    H: 1,
                    V: 1,
                    T: 2,
                    S: 4,
                    A: 7,
                    Q: 4,
                    C: 6
                };
                var cmds = pth.cmds, crds = pth.crds;
                while (i < ts.length) {
                    var cmd = ts[i];
                    i++;
                    var cmu = cmd.toUpperCase();
                    if (cmu == "Z") {
                        cmds.push("Z");
                        x = ox;
                        y = oy;
                    } else {
                        var ps = pc[cmu], reps = _reps(ts, i, ps);
                        for (var j = 0; j < reps; j++) {
                            if (j == 1 && cmu == "M") {
                                cmd = cmd == cmu ? "L" : "l";
                                cmu = "L";
                            }
                            var xi = 0, yi = 0;
                            if (cmd != cmu) {
                                xi = x;
                                yi = y;
                            }
                            if (cmu == "M") {
                                x = xi + ts[i++];
                                y = yi + ts[i++];
                                cmds.push("M");
                                crds.push(x, y);
                                ox = x;
                                oy = y;
                            } else if (cmu == "L") {
                                x = xi + ts[i++];
                                y = yi + ts[i++];
                                cmds.push("L");
                                crds.push(x, y);
                            } else if (cmu == "H") {
                                x = xi + ts[i++];
                                cmds.push("L");
                                crds.push(x, y);
                            } else if (cmu == "V") {
                                y = yi + ts[i++];
                                cmds.push("L");
                                crds.push(x, y);
                            } else if (cmu == "Q") {
                                var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++];
                                cmds.push("Q");
                                crds.push(x1, y1, x2, y2);
                                x = x2;
                                y = y2;
                            } else if (cmu == "T") {
                                var co = Math.max(crds.length - 2, oldo);
                                var x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
                                var x2 = xi + ts[i++], y2 = yi + ts[i++];
                                cmds.push("Q");
                                crds.push(x1, y1, x2, y2);
                                x = x2;
                                y = y2;
                            } else if (cmu == "C") {
                                var x1 = xi + ts[i++], y1 = yi + ts[i++], x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
                                cmds.push("C");
                                crds.push(x1, y1, x2, y2, x3, y3);
                                x = x3;
                                y = y3;
                            } else if (cmu == "S") {
                                var co = Math.max(crds.length - (cmds[cmds.length - 1] == "C" ? 4 : 2), oldo);
                                var x1 = x + x - crds[co], y1 = y + y - crds[co + 1];
                                var x2 = xi + ts[i++], y2 = yi + ts[i++], x3 = xi + ts[i++], y3 = yi + ts[i++];
                                cmds.push("C");
                                crds.push(x1, y1, x2, y2, x3, y3);
                                x = x3;
                                y = y3;
                            } else if (cmu == "A") {
                                var x1 = x, y1 = y;
                                var rx = ts[i++], ry = ts[i++];
                                var phi = ts[i++] * (Math.PI / 180), fA = ts[i++], fS = ts[i++];
                                var x2 = xi + ts[i++], y2 = yi + ts[i++];
                                if (x2 == x && y2 == y && rx == 0 && ry == 0) continue;
                                var hdx = (x1 - x2) / 2, hdy = (y1 - y2) / 2;
                                var cosP = Math.cos(phi), sinP = Math.sin(phi);
                                var x1A = cosP * hdx + sinP * hdy;
                                var y1A = -sinP * hdx + cosP * hdy;
                                var rxS = rx * rx, ryS = ry * ry;
                                var x1AS = x1A * x1A, y1AS = y1A * y1A;
                                var frc = (rxS * ryS - rxS * y1AS - ryS * x1AS) / (rxS * y1AS + ryS * x1AS);
                                var coef = (fA != fS ? 1 : -1) * Math.sqrt(Math.max(frc, 0));
                                var cxA = coef * (rx * y1A) / ry;
                                var cyA = -coef * (ry * x1A) / rx;
                                var cx = cosP * cxA - sinP * cyA + (x1 + x2) / 2;
                                var cy = sinP * cxA + cosP * cyA + (y1 + y2) / 2;
                                var angl = function(ux, uy, vx, vy) {
                                    var lU = Math.sqrt(ux * ux + uy * uy), lV = Math.sqrt(vx * vx + vy * vy);
                                    var num = (ux * vx + uy * vy) / (lU * lV);
                                    return (ux * vy - uy * vx >= 0 ? 1 : -1) * Math.acos(Math.max(-1, Math.min(1, num)));
                                };
                                var vX = (x1A - cxA) / rx, vY = (y1A - cyA) / ry;
                                var theta1 = angl(1, 0, vX, vY);
                                var dtheta = angl(vX, vY, (-x1A - cxA) / rx, (-y1A - cyA) / ry);
                                dtheta = dtheta % (2 * Math.PI);
                                var arc = function(gst, x, y, r, a0, a1, neg) {
                                    var rotate = function(m, a) {
                                        var si = Math.sin(a), co = Math.cos(a);
                                        var a = m[0], b = m[1], c = m[2], d = m[3];
                                        m[0] = a * co + b * si;
                                        m[1] = -a * si + b * co;
                                        m[2] = c * co + d * si;
                                        m[3] = -c * si + d * co;
                                    };
                                    var multArr = function(m, a) {
                                        for (var j = 0; j < a.length; j += 2) {
                                            var x = a[j], y = a[j + 1];
                                            a[j] = m[0] * x + m[2] * y + m[4];
                                            a[j + 1] = m[1] * x + m[3] * y + m[5];
                                        }
                                    };
                                    var concatA = function(a, b) {
                                        for (var j = 0; j < b.length; j++) a.push(b[j]);
                                    };
                                    var concatP = function(p, r) {
                                        concatA(p.cmds, r.cmds);
                                        concatA(p.crds, r.crds);
                                    };
                                    if (neg) while (a1 > a0) a1 -= 2 * Math.PI; else while (a1 < a0) a1 += 2 * Math.PI;
                                    var th = (a1 - a0) / 4;
                                    var x0 = Math.cos(th / 2), y0 = -Math.sin(th / 2);
                                    var x1 = (4 - x0) / 3, y1 = y0 == 0 ? y0 : (1 - x0) * (3 - x0) / (3 * y0);
                                    var x2 = x1, y2 = -y1;
                                    var x3 = x0, y3 = -y0;
                                    var ps = [ x1, y1, x2, y2, x3, y3 ];
                                    var pth = {
                                        cmds: [ "C", "C", "C", "C" ],
                                        crds: ps.slice(0)
                                    };
                                    var rot = [ 1, 0, 0, 1, 0, 0 ];
                                    rotate(rot, -th);
                                    for (var j = 0; j < 3; j++) {
                                        multArr(rot, ps);
                                        concatA(pth.crds, ps);
                                    }
                                    rotate(rot, -a0 + th / 2);
                                    rot[0] *= r;
                                    rot[1] *= r;
                                    rot[2] *= r;
                                    rot[3] *= r;
                                    rot[4] = x;
                                    rot[5] = y;
                                    multArr(rot, pth.crds);
                                    multArr(gst.ctm, pth.crds);
                                    concatP(gst.pth, pth);
                                };
                                var gst = {
                                    pth: pth,
                                    ctm: [ rx * cosP, rx * sinP, -ry * sinP, ry * cosP, cx, cy ]
                                };
                                arc(gst, 0, 0, 1, theta1, theta1 + dtheta, fS == 0);
                                x = x2;
                                y = y2;
                            } else console.log("Unknown SVG command " + cmd);
                        }
                    }
                }
            }
            return {
                cssMap: cssMap,
                readTrnf: readTrnf,
                svgToPath: svgToPath,
                toPath: toPath
            };
        }(),
        initHB: function(hurl, resp) {
            var codeLength = function(code) {
                var len = 0;
                if ((code & 4294967295 - (1 << 7) + 1) == 0) {
                    len = 1;
                } else if ((code & 4294967295 - (1 << 11) + 1) == 0) {
                    len = 2;
                } else if ((code & 4294967295 - (1 << 16) + 1) == 0) {
                    len = 3;
                } else if ((code & 4294967295 - (1 << 21) + 1) == 0) {
                    len = 4;
                }
                return len;
            };
            var te = new window["TextEncoder"]("utf8");
            fetch(hurl).then(function(x) {
                return x["arrayBuffer"]();
            }).then(function(ab) {
                return WebAssembly["instantiate"](ab);
            }).then(function(res) {
                console.log("HB ready");
                var exp = res["instance"]["exports"], mem = exp["memory"];
                mem["grow"](700);
                var heapu8 = new Uint8Array(mem.buffer);
                var u32 = new Uint32Array(mem.buffer);
                var i32 = new Int32Array(mem.buffer);
                var __lastFnt, blob, blobPtr, face, font;
                Typr["U"]["shapeHB"] = function() {
                    var toJson = function(ptr) {
                        var length = exp["hb_buffer_get_length"](ptr);
                        var result = [];
                        var iPtr32 = exp["hb_buffer_get_glyph_infos"](ptr, 0) >>> 2;
                        var pPtr32 = exp["hb_buffer_get_glyph_positions"](ptr, 0) >>> 2;
                        for (var i = 0; i < length; ++i) {
                            var a = iPtr32 + i * 5, b = pPtr32 + i * 5;
                            result.push({
                                g: u32[a + 0],
                                cl: u32[a + 2],
                                ax: i32[b + 0],
                                ay: i32[b + 1],
                                dx: i32[b + 2],
                                dy: i32[b + 3]
                            });
                        }
                        return result;
                    };
                    return function(fnt, str, ltr) {
                        var fdata = fnt["_data"], fn = fnt["name"]["postScriptName"];
                        if (__lastFnt != fn) {
                            if (blob != null) {
                                exp["hb_blob_destroy"](blob);
                                exp["free"](blobPtr);
                                exp["hb_face_destroy"](face);
                                exp["hb_font_destroy"](font);
                            }
                            blobPtr = exp["malloc"](fdata.byteLength);
                            heapu8.set(fdata, blobPtr);
                            blob = exp["hb_blob_create"](blobPtr, fdata.byteLength, 2, 0, 0);
                            face = exp["hb_face_create"](blob, 0);
                            font = exp["hb_font_create"](face);
                            __lastFnt = fn;
                        }
                        var buffer = exp["hb_buffer_create"]();
                        var bytes = te["encode"](str);
                        var len = bytes.length, strp = exp["malloc"](len);
                        heapu8.set(bytes, strp);
                        exp["hb_buffer_add_utf8"](buffer, strp, len, 0, len);
                        exp["free"](strp);
                        exp["hb_buffer_set_direction"](buffer, ltr ? 4 : 5);
                        exp["hb_buffer_guess_segment_properties"](buffer);
                        exp["hb_shape"](font, buffer, 0, 0);
                        var json = toJson(buffer);
                        exp["hb_buffer_destroy"](buffer);
                        var arr = json.slice(0);
                        if (!ltr) arr.reverse();
                        var ci = 0, bi = 0;
                        for (var i = 1; i < arr.length; i++) {
                            var gl = arr[i], cl = gl["cl"];
                            while (true) {
                                var cpt = str.codePointAt(ci), cln = codeLength(cpt);
                                if (bi + cln <= cl) {
                                    bi += cln;
                                    ci += cpt <= 65535 ? 1 : 2;
                                } else break;
                            }
                            gl["cl"] = ci;
                        }
                        return json;
                    };
                }();
                resp();
            });
        }
    };
    const QQ_GROUP = [ "854137118" ];
    var _self = unsafeWindow;
    var top = _self;
    var UE$1;
    var modelId = "modelId_xx";
    const selfintv = setInterval(() => {
        if (unsafeWindow) {
            _self = unsafeWindow;
            top = _self;
            UE$1 = _self.UE;
            try {
                reportOnline();
                String.prototype.replaceAll = function(s1, s2) {
                    return this.replace(new RegExp(s1, "gm"), s2);
                };
                while (top !== _self.top) {
                    top = top.parent.document ? top.parent : _self.top;
                    if (top.location.pathname === "/mycourse/studentstudy") break;
                }
            } catch (err) {
                top = _self;
            }
            clearInterval(selfintv);
        }
    }, GLOBAL.delay);
    function checkVersion() {
        function compare(v1 = "0", v2 = "0") {
            v1 = String(v1).split(".");
            v2 = String(v2).split(".");
            const minVersionLens = Math.min(v1.length, v2.length);
            let result = 0;
            for (let i = 0; i < minVersionLens; i++) {
                const curV1 = Number(v1[i]);
                const curV2 = Number(v2[i]);
                if (curV1 > curV2) {
                    result = 1;
                    break;
                } else if (curV1 < curV2) {
                    result = -1;
                    break;
                }
            }
            if (result === 0 && v1.length !== v2.length) {
                const v1BiggerThenv2 = v1.length > v2.length;
                const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
                for (let i = minVersionLens; i < maxLensVersion.length; i++) {
                    const curVersion = Number(maxLensVersion[i]);
                    if (curVersion > 0) {
                        v1BiggerThenv2 ? result = 1 : result = -1;
                        break;
                    }
                }
            }
            return result;
        }
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://greasyfork.org/en/scripts/451356.json",
            timeout: GLOBAL.timeout,
            onload: function(r) {
                const obj = JSON.parse(r.responseText);
                if (obj.name === GM_info.script.name && compare(obj.version, GM_info.script.version) === 1 && new Date(obj.code_updated_at).getTime() + 1e3 * 60 * 60 * 2 < new Date().getTime()) {
                    iframeMsg("update", {
                        v1: GM_info.script.version,
                        v2: obj.version,
                        href: obj.url
                    });
                }
            }
        });
    }
    top.addEventListener("message", event => {
        if (event.data.type === "jump") {
            GLOBAL.index++;
            iframeMsg("tip", {
                tip: "准备答第" + (GLOBAL.index + 1) + "题"
            });
        } else if (event.data.type === "stop") {
            GLOBAL.stop = event.data.val;
        } else if (event.data.type === "start_pay") {
            if (event.data.flag) {
                if (String(GM_getValue("token")).length === 10 || String(GM_getValue("token")).length === 11) {
                    iframeMsg("tip", {
                        tip: "已开启请求收费题库,已实时生效"
                    });
                    GM_setValue("start_pay", event.data.flag);
                    iframeMsg("start_pay", true);
                } else {
                    iframeMsg("tip", {
                        tip: "系统检测您的token可能输入有误,请检查"
                    });
                }
            } else {
                iframeMsg("tip", {
                    tip: "已关闭请求收费题库,已实时生效"
                });
                GM_setValue("start_pay", event.data.flag);
                iframeMsg("start_pay", false);
            }
        } else if (event.data.type === "auto_jump") {
            GM_setValue("auto_jump", event.data.flag);
            iframeMsg("tip", {
                tip: "已" + (event.data.flag ? "开启" : "关闭") + "自动切换,页面刷新后生效"
            });
        } else if (event.data.type === "confim") {
            if (event.data.token.length === 10 || event.data.token.length === 11) {
                GM_setValue("token", event.data.token);
                iframeMsg("tip", {
                    tip: "成功设置token,请点击开启付费题库"
                });
            } else {
                iframeMsg("tip", {
                    tip: "系统检测您的token可能输入有误,请检查"
                });
            }
        } else if (event.data.type === "save_setting") {
            GM_setValue("gpt", event.data.gpt);
            GM_setValue("search_delay", event.data.search_delay);
            GM_setValue("tiku_adapter", event.data.tiku_adapter);
        }
    }, false);
    $(document).keydown(function(event) {
        if (event.keyCode === 38) {
            $("." + modelId).hide();
        } else if (event.keyCode === 40) {
            $("." + modelId).show();
        } else if (event.keyCode === 37) {
            $("." + modelId).hide();
            GM_setValue("hide", true);
        } else if (event.keyCode === 39) {
            $("." + modelId).show();
            GM_setValue("hide", false);
            GM_setValue("pos", "50px,50px");
        } else if (event.keyCode === 83) {
            GLOBAL.stop = true;
            iframeMsg("stop", GLOBAL.stop);
        } else if (event.keyCode === 68) {
            GLOBAL.stop = false;
            iframeMsg("stop", GLOBAL.stop);
        }
    });
    function getAnswerForKey(keys, options) {
        return keys.map(function(val) {
            return options[val.charCodeAt(0) - 65];
        });
    }
    function setIntervalFunc(flag, func, time) {
        const interval = setInterval(() => {
            if (flag()) {
                clearInterval(interval);
                func();
            }
        }, time || 1e3);
    }
    function getAnswer(str, options, type) {
        if (type === 0 || type === 1) {
            const ans = getAnswerForKey(str.match(/[A-G]/gi) || [], options);
            return ans.length > 0 ? ans : [ str ];
        } else {
            return [ str ];
        }
    }
    function getQuestionType(str) {
        if (!str) return;
        str = str.trim().replaceAll(/\s+/g, "");
        if (TYPE[str]) return TYPE[str];
        const regex = Object.keys(TYPE).join("|");
        const matcher = str.match(regex);
        if (matcher) return TYPE[matcher[0]];
    }
    function rand(m, n) {
        return Math.ceil(Math.random() * (n - m + 1) + m - 1);
    }
    const TYPE = {
        "阅读理解（选择）/完型填空": 66,
        "听力训练": 66,
        multichoice: 1,
        singlechoice: 0,
        SingleChoice: 0,
        bijudgement: 3,
        Judgement: 3,
        "单项选择题": 0,
        "单项选择": 0,
        "单选题": 0,
        "单选": 0,
        "多选": 1,
        "多选题": 1,
        "案例分析": 1,
        "多项选择题": 1,
        "多项选择": 1,
        "客观题": 1,
        "填空题": 2,
        "填空": 2,
        "对错题": 3,
        "判断题": 3,
        "判断正误": 3,
        "判断": 3,
        "主观题": 4,
        "问答题": 4,
        "简答题": 4,
        "名词解释": 5,
        "论述题": 6,
        "计算题": 7,
        "其它": 8,
        "分录题": 9,
        "资料题": 10,
        "连线题": 11,
        "排序题": 13,
        "完形填空": 14,
        "完型填空": 14,
        "阅读理解": 15,
        "口语题": 18,
        "听力题": 19,
        "A1A2题": 1,
        "文件作答": 4,
        "视频题": 1
    };
    function sleep(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }
    function iframeMsg(type, message) {
        try {
            top.document.getElementById("iframeNode").contentWindow.vueDefinedProp(type, message);
        } catch (e) {}
    }
    function filterImg(dom) {
        if (location.host === "ncexam.cug.edu.cn") {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/gm, "");
            };
        }
        return $(dom).clone().find("img[src]").replaceWith(function() {
            return $("<p></p>").text('<img src="' + $(this).attr("src") + '">');
        }).end().find("iframe[src]").replaceWith(function() {
            return $("<p></p>").text('<iframe src="' + $(this).attr("src") + '"></irame>');
        }).end().text().trim();
    }
    function createContainer(name, childElem) {
        name = name.toLowerCase();
        let elem = top.document.createElement(name);
        elem.style.display = "block";
        elem.id = name.replace("hcsearche", "hcSearche").replace(/\-[a-z]/g, function(w) {
            return w.replace("-", "").toUpperCase();
        });
        if (childElem) {
            if (Array.isArray(childElem) === false) childElem = [ childElem ];
            for (let i = 0; i < childElem.length; i++) elem.appendChild(childElem[i]);
        }
        return elem;
    }
    function dragModel(drag) {
        const TOP = top;
        drag.onmousedown = function(e) {
            drag.style.cursor = "move";
            e = e || window.event;
            let diffX = e.clientX - drag.offsetLeft;
            let diffY = e.clientY - drag.offsetTop;
            top.onmousemove = function(e) {
                e = e || top.event;
                let left = e.clientX - diffX;
                let top = e.clientY - diffY;
                if (left < 0) {
                    left = 0;
                } else if (left > TOP.innerWidth * .95 - drag.offsetWidth) {
                    left = TOP.innerWidth * .95 - drag.offsetWidth;
                }
                if (top < 0) {
                    top = 0;
                } else if (top > TOP.innerHeight - drag.offsetHeight) {
                    top = TOP.innerHeight - drag.offsetHeight;
                }
                drag.style.left = left + "px";
                drag.style.top = top + "px";
                GM_setValue("pos", drag.style.left + "," + drag.style.top);
            };
            top.onmouseup = function(e) {
                drag.style.cursor = "default";
                this.onmousemove = null;
                this.onmouseup = null;
            };
        };
    }
    function defaultWorkTypeResolver($options) {
        function count(selector) {
            let sum = 0;
            for (const option of $options || []) {
                if ($(option).find(selector).length || $(option).parent().find(selector).length) {
                    sum++;
                }
            }
            return sum;
        }
        return count('[type="radio"]') === 2 ? 3 : count('[type="radio"]') > 2 ? 0 : count('[type="checkbox"]') > 2 ? 1 : count("textarea") >= 1 ? 4 : undefined;
    }
    function waitWithTimeout(promise, timeout, timeoutMessage = "timeout", defaultRes) {
        let timer;
        const timeoutPromise = new Promise((resolve, reject) => {
            timer = setTimeout(() => defaultRes === undefined ? reject(timeoutMessage) : resolve(defaultRes), timeout);
        });
        return Promise.race([ timeoutPromise, promise ]).finally(() => clearTimeout(timer));
    }
    async function formatSearchAnswer(initData) {
        const data = {
            plat: initData.plat ? parseInt(initData.plat) : null,
            qid: initData.qid ? String(initData.qid) : null,
            question: initData.question,
            options: initData.options,
            options_id: initData.options_id ? initData.options_id : [],
            type: initData.type
        };
        let res;
        const list = [];
        const apis = GLOBAL.answerApi;
        const answerApiFunc = Object.keys(apis).map(item => {
            return waitWithTimeout(apis[item](data), 5e3, "", []);
        });
        answerApiFunc.push(searchAnswer(data));
        const answerApiRes = await waitWithTimeout(Promise.all(answerApiFunc), 1e4, "(接口超时)");
        answerApiRes.map(item => {
            if (item instanceof Array) {
                console.log("tikuAdapter结果", JSON.stringify(item));
                list.push(...item);
            } else if (item instanceof Object && Object.keys(item).length === 1) {
                const key = Object.keys(item)[0];
                item[key];
            } else {
                res = item;
            }
        });
        try {
            const msg = res.message || res.msg;
            if (res.code !== 0) {
                return {
                    success: false,
                    msg: msg
                };
            }
            if (res.result.success) {
                return {
                    success: true,
                    msg: msg,
                    num: res.result.num,
                    answers: res.result.answers
                };
            }
            console.log("官方结果", JSON.stringify(res));
            if (res.result.answers instanceof Array && res.result.answers.length > 0) {
                list.push(...res.result.answers);
            }
            return {
                success: true,
                msg: msg,
                num: res.result.num,
                list: list
            };
        } catch (e) {
            return {
                success: false,
                msg: "发生异常" + e + "请反馈至学长微信"
            };
        }
    }
    function similar(s, t, f) {
        if (!s || !t) {
            return 0;
        }
        if (s === t) {
            return 100;
        }
        var l = s.length > t.length ? s.length : t.length;
        var n = s.length;
        var m = t.length;
        var d = [];
        f = f || 2;
        var min = function(a, b, c) {
            return a < b ? a < c ? a : c : b < c ? b : c;
        };
        var i, j, si, tj, cost;
        if (n === 0) return m;
        if (m === 0) return n;
        for (i = 0; i <= n; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0; j <= m; j++) {
            d[0][j] = j;
        }
        for (i = 1; i <= n; i++) {
            si = s.charAt(i - 1);
            for (j = 1; j <= m; j++) {
                tj = t.charAt(j - 1);
                if (si === tj) {
                    cost = 0;
                } else {
                    cost = 1;
                }
                d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            }
        }
        let res = (1 - d[n][m] / l) * 100;
        return res.toFixed(f);
    }
    function answerSimilar(src, list) {
        return $.map(list, function(val) {
            return Number(similar(formatString(val), formatString(src), 2));
        });
    }
    function isPlainAnswer(answer) {
        if (answer.length > 8 || !/[A-Z]/.test(answer)) {
            return false;
        }
        let min = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer.charCodeAt(i) < min) {
                return false;
            }
            min = answer.charCodeAt(i);
        }
        return true;
    }
    function isTrue(str) {
        return Boolean(String(str).match(/(^|,)(正确|是|对|√|T|ri|true|A)(,|$)/));
    }
    function isFalse(str) {
        return Boolean(String(str).match(/(^|,)(错误|否|错|×|F|不是|wr|false|B)(,|$)/));
    }
    async function defaultQuestionResolve(list, data, handler, ignore_click) {
        let targetOptionsList = [];
        for (const answers of list) {
            if (data.type === 4 || data.type === 2 || data.type === 5) {
                let ans = answers.length > data.$options.length ? answers.slice(0, data.$options.length) : answers;
                for (let index in ans) {
                    if (typeof handler === "function") await handler(data.type, ans[index], data.$options.eq(index));
                }
                return {
                    style: "success-row",
                    ans: answers.join("===="),
                    question: data.question
                };
            } else if (data.type === 3) {
                if (targetOptionsList.length > 3) break;
                let targetOptions = new Set();
                if (isTrue(answers.join())) {
                    targetOptions.add(Number(isFalse(data.options[0])));
                } else if (isFalse(answers.join())) {
                    targetOptions.add(Number(isTrue(data.options[0])));
                }
                targetOptions.size > 0 && targetOptionsList.push(targetOptions);
            } else if (data.type === 0 || data.type === 1 || data.type === 66) {
                const beautifulOptions = data.options.map(i => {
                    return formatString(i).toLowerCase().replace(/\s/g, "");
                });
                let targetOptions = new Set();
                for (const ans of answers) {
                    if (ans.length === 1 && isPlainAnswer(ans)) {
                        targetOptions.add(ans.charCodeAt(0) - 65);
                    }
                    const val = formatString(ans).toLowerCase().replace(/\s/g, "");
                    let optIndex = $.inArray(val, beautifulOptions);
                    if (optIndex >= 0) {
                        targetOptions.add(optIndex);
                    }
                }
                if ((data.type === 0 && targetOptions.size === 0 || data.type === 1 && targetOptions.size < 2) && targetOptionsList.length === 0) {
                    for (const ans of answers) {
                        const val = formatString(ans).toLowerCase();
                        if (val.length >= 5 && !val.includes("<img")) {
                            const ratings = answerSimilar(val, beautifulOptions);
                            const maxScore = Math.max(...ratings);
                            if (maxScore > 65) {
                                targetOptions.add(ratings.indexOf(maxScore));
                            }
                        }
                    }
                }
                targetOptions.size > 0 && targetOptionsList.push(targetOptions);
            }
        }
        let items = [];
        let sortArr = targetOptionsList.map(item => {
            const s = Array.from(item).sort();
            return s;
        });
        if (data.type === 0 || data.type === 3) {
            items = getMost(sortArr.filter(i => i.length === 1));
            if (!items || items.length === 0) {
                items = getMost(sortArr.filter(i => i.length > 0));
            }
        } else if (data.type === 1 || data.type === 66) {
            items = getMost(sortArr.filter(i => i.length > 1));
            if (!items || items.length === 0) {
                items = getLang(sortArr.filter(i => i.length > 0));
            }
        }
        if (items && items.length > 0) {
            for (let index = 0; index < data.$options.length; index++) {
                const $item = data.$options.eq(index);
                if (Boolean($.inArray(index, items) + 1) !== Boolean(ignore_click($item, data.type))) {
                    $item.get(0).click();
                    await sleep(GLOBAL.fillAnswerDelay);
                }
            }
            return {
                type: data.type,
                style: "primary-row",
                ans: items.map(i => {
                    return data.options[i];
                }).join("===="),
                question: data.question
            };
        } else {
            return {
                type: data.type,
                style: "warning-row",
                question: data.question,
                ans: list.join('<span style="color: red">====</span>'),
                options: data.options
            };
        }
    }
    async function defaultFillAnswer(answers, data, handler, ignore_click) {
        for (let index = 0; index < data.$options.length; index++) {
            const $item = data.$options.eq(index);
            if (Boolean($.inArray(index, answers) + 1) !== Boolean(ignore_click($item, data.type))) {
                $item.get(0).click();
                await sleep(GLOBAL.fillAnswerDelay);
            }
        }
        return {
            type: data.type,
            style: "success-row",
            question: data.question,
            ans: answers.map(i => {
                return String.fromCharCode(i + 65);
            }).join(""),
            options: data.options
        };
    }
    function getMost(arr) {
        arr.reverse();
        if (arr.length === 0) return undefined;
        var hash = {};
        var m = 0;
        var trueEl;
        var el;
        for (var i = 0, len = arr.length; i < len; i++) {
            el = arr[i];
            hash[el] === undefined ? hash[el] = 1 : hash[el]++;
            if (hash[el] >= m) {
                m = hash[el];
                trueEl = el;
            }
        }
        return trueEl;
    }
    function getLang(arr) {
        if (arr.length === 0) return undefined;
        let len = 0;
        let ele;
        for (let arrElement of arr) {
            if (arrElement.length > len) {
                len = arrElement.length;
                ele = arrElement;
            }
        }
        return ele ? ele : arr.length > 0 ? arr[0] : [];
    }
    function HTMLDecode(text) {
        var temp = document.createElement("div");
        temp.innerHTML = text;
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
    function formatString(src) {
        src = String(src);
        src = src.includes("img") || src.includes("iframe") ? src : HTMLDecode(src);
        src = src.replace(/[\uff01-\uff5e]/g, function(str) {
            return String.fromCharCode(str.charCodeAt(0) - 65248);
        });
        return src.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/。/g, ".").replace(/[,.?:!;]$/, "").trim();
    }
    function division(arr, size) {
        var objArr = new Array();
        var index = 0;
        var objArrLen = arr.length / size;
        for (var i = 0; i < objArrLen; i++) {
            var arrTemp = new Array();
            for (var j = 0; j < size; j++) {
                arrTemp[j] = arr[index++];
                if (index === arr.length) {
                    break;
                }
            }
            objArr[i] = arrTemp;
        }
        return objArr;
    }
    const cache = {};
    const sourceTable = JSON.parse(GM_getResourceText("SourceTable"));
    async function genTable(ttf) {
        const res = await axios.get(ttf, {
            responseType: "arraybuffer"
        });
        const font = Typr.parse(res.data)[0];
        const table = {};
        for (let i = 19968; i < 40870; i++) {
            const g = Typr.U.codeToGlyph(font, i);
            if (g) {
                const path = Typr.U.glyphToPath(font, g);
                if (path) {
                    table[i] = MD5(JSON.stringify(path));
                }
            }
        }
        cache[ttf] = table;
    }
    async function getEncryptString(str, ttf) {
        if (!cache[ttf]) {
            await genTable(ttf);
        }
        const match = str.match(/<span class="xuetangx-com-encrypted-font">(.*?)</g);
        if (match === null) {
            return formatString(str);
        }
        const encStrArr = match.map(string => {
            return string.replace(/^<span class="xuetangx-com-encrypted-font">/, "").replace(/<$/, "");
        });
        encStrArr.forEach(encStr => {
            const decStr = encStr.split("").map(string => {
                const md5 = cache[ttf][string.charCodeAt(0)];
                return String.fromCharCode(sourceTable[md5]);
            }).join("");
            str = str.replace(encStr, decStr);
        });
        return formatString(str);
    }







var vm = {
  hideTip() {
      var tip = document.createElement("div");
      tip.id = "yinc";
      tip.innerHTML = `
      <div style="
          position:fixed;
          right:0;
          top:10%;
          color: #8a6d3b;
          background-color: #fcf8e3;
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid transparent;
          border-radius: 4px;
          border-color: #faebcc;">
          学习通助手已被隐藏<br>如果需要显示答题面板，请按键盘右箭头
      <button style="
          padding: 0;
          color: inherit;
          border: 0;
          background: inherit;
          top:-22px;
          position:relative"
          type="button" id="cl_yinc" data-dismiss="alert" aria-label="Close">&times;</button>
      </div>`;
      top.document.getElementsByTagName("body")[0].appendChild(tip);
      top.document.querySelector("#cl_yinc").onclick = function() {
          top.document.querySelector("#yinc").remove();
      };
      setTimeout(() => {
          top.document.querySelector("#yinc").remove();
      }, 3e3);
  },
  zhihuishuSaveTip() {
      var zhihuishuSaveTip = document.createElement("div");
      zhihuishuSaveTip.id = "zhihuishuSaveTip";
      zhihuishuSaveTip.innerHTML = `
      <div style="
          position: fixed;
          opacity: 1;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 1040;
          background:rgba(0,0,0,.46);">
      <div style="
          position: relative;
          margin: 10px;
          top: 50%;
          left: 40%;
          width: 20%;">
      <div style="
          position: relative;
          background-color: #fff;
          -webkit-background-clip: padding-box;
          background-clip: padding-box;
          /*border: 1px solid #999;*/
          border: 1px solid rgba(0,0,0,.2);
          border-radius: 6px;
          outline: 0;
          -webkit-box-shadow: 0 3px 9px rgba(0,0,0,.5);
          box-shadow: 0 3px 9px rgba(0,0,0,.5);">
      <div style="
          line-height: 25px;
          font-size: 15px;
          margin: 5px;">
      <h4 class="modal-title">正在保存</h4>


      <!-- 模态框主体 -->
      <div class="modal-body" style="height: 50px;
          margin: 5px;
          padding: 5px;
          margin-top: 15px;
          line-height: 15px;
          font-size: 15px;">
          <progress style="width: 100%" id="gs_p" value="0" max="100"></progress> <span id="gs_text">0%</span>


      </div>



      </div>
 </div>
    </div>`;
      top.document.getElementsByTagName("body")[0].appendChild(zhihuishuSaveTip);
  }
};
function showPanel() {
    let html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      ` + GM_getResourceText("ElementUiCss") + `
      /* Fix for modal display */
      html, body {
        overflow: visible !important;
        max-height: none !important;
        max-width: none !important;
      }

      .el-table .warning-row {
        background: oldlace;
      }

      #app {
        border: 5px solid #000000;
        border-radius: 6px;
        overflow: visible !important;
      }

      .el-table .default-row {
        background: #f0f9eb;
      }

      .el-table .primary-row {
        background: rgb(236, 245, 255);
      }

      * {
        padding: 0px;
        margin: 0px;
      }

      .el-button {
        margin-bottom: 4px;
      }

      .el-button + .el-button {
        margin-left: 0px;
      }

      .el-form-item-confim {
        display: flex;
        justify-content: center
      }

      .drag_auto_answer-class {
        width: 360px;
        background-color: rgb(255, 255, 255);
        overflow: visible !important;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: -17px;
      }

      /* 侧边竖排文字样式 */
      .side-hint {
        position: absolute;
        text-align: center;
        font-size: 12px;
        color: #666;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 140px; /* 与二维码高度一致 */
        justify-content: space-around;
      }

      .left-hint {
        left: 0;
      }

      .right-hint {
        right: 0;
      }

      .side-hint span {
        display: block;
        line-height: 1.2;
      }
    </style>
</head>
<body>

<div id="app">

    <div id="drag_auto_answer" class="drag_auto_answer-class">
        <el-main style="min-width: 360px;padding: 25px 0px 10px; z-index: 99999;">
            <el-row>
                <el-form>
               <center> <h4>学习通小助手-考试端</h4></center>
<br>
                    <el-form-item class="el-form-item-confim" label="请输入token"  style="margin-top: 0px" :prop="passw">
                        <el-input :type="passw" v-model="opt.token" placeholder="请输入内容" style="max-width: 130px" size="mini" ></el-input>
                        <el-button @click="btnClick(opt.token,'opt.confim')" size="mini" type="default" @mousedown.native="passw = 'text'" @mouseup.native="passw = 'password'">确定</el-button>
                    </el-form-item>
                </el-form>
            </el-row>
            <el-row style="margin-top: -20px;margin-bottom: 5px;display: flex">
                <el-alert
                        style="display: block"
                        :title="tip"
                        :closable="false"
                        type="success">
                    <el-button v-if="need_jump" @click="btnClick(opt.jump,'opt.jump')" size="mini" type="info">跳过本题</el-button>
                    <el-button v-if="!hidden" @click="btnClick(opt.auto_jump,'opt.auto_jump')" size="mini" type="default">{{opt.auto_jump ? '停止自动切换': '开启自动切换'}}</el-button>
                </el-alert>
            </el-row>
            <el-row>
              <center>  <el-button v-if="!hidden" @click="btnClick(opt.stop,'opt.stop')" size="mini" type="default">{{!opt.stop ? '暂停答题': '继续答题'}}</el-button> <center>

            </el-row>

            <div class="qrcode-container" style="position: relative; margin: 0 20px; padding: 0 25px;">
                <!-- 左侧竖排文字 -->
                <div class="side-hint left-hint">
                    <span>按</span>
                    <span>→</span>
                    <span>↓</span>
                    <span>显</span>
                    <span>示</span>
                    <span>窗</span>
                    <span>口</span>
                </div>

                <div class="qrcode-text" style="text-align: center;">如果有帮助到你，可以赞赏支持一下吗？亲亲</div>
                <div class="qrcode-wrapper">
                    <img class="qrcode-img"
                         width="140"
                         height="140"
                         src="data:image/png;base64,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"
                         alt="赞赏二维码"
                         style="display: block; margin: 0 auto;"/>
                </div>

                <!-- 右侧竖排文字 -->
                <div class="side-hint right-hint">
                    <span>按</span>
                    <span>←</span>
                    <span>↑</span>
                    <span>隐</span>
                    <span>藏</span>
                    <span>窗</span>
                    <span>口</span>
                </div>
            </div>

            <el-row style="margin-top: -5px;margin-bottom: 5px;display: flex">
                <el-alert style="display: block" :title="tip" :closable="false" type="success">
                    <el-button v-if="need_jump" @click="btnClick(opt.jump,'opt.jump')" size="mini" type="info">跳过本题</el-button>
                    <el-button v-if="!hidden" @click="btnClick(opt.auto_jump,'opt.auto_jump')" size="mini" type="default">{{opt.auto_jump ? '停止自动切换': '开启自动切换'}}</el-button>
                </el-alert>
            </el-row>



            </el-row>

            <el-table size="mini" :data="tableData" style="width: 100%;margin-top: 5px" :row-class-name="tableRowClassName">
                <el-table-column prop="index" label="题号" width="45"></el-table-column>
                <el-table-column prop="question" label="问题" width="130">
                  <template slot-scope="scope">
                        <div style="font-size: 11px;" v-html="scope.row.question"></div>
                  </template>
                </el-table-column>
                <el-table-column prop="answer" label="答案" width="130">
                 <template slot-scope="scope">
                     <el-popover
                        v-if="scope.row.style === 'warning-row'"
                        placement="bottom-end"
                        title="相似答案"
                        width="240"
                        trigger="click">
                        <div style="font-size: 10px;height: 220px; overflow: auto;" v-html="scope.row.answer"></div>
                        <el-button slot="reference" size="small" type="danger">查看相关答案</el-button>
                     </el-popover>
                     <p v-if="scope.row.style != 'warning-row'" style="font-size: 11px;" v-html="scope.row.answer"></p>
                  </template>
                </el-table-column>
            </el-table>
        </el-main>
    </div>
</div>
</body>
<script>` + GM_getResourceText("Vue") + `</script>
<script>` + GM_getResourceText("ElementUi") + `</script>
<script>
const tips = [
    '想要隐藏此搜索框，按键盘的⬆箭头，想要显示按⬇箭头',
    '想要永久隐藏此搜索框，按键盘的左箭头，想要显示在屏幕中央按右箭头',
]
    new Vue({
        el: '#app',
        data: function () {
            return {
                tiku_adapter: '` + (GM_getValue("tiku_adapter") || "") + `',
                search_delay: ` + (isNaN(parseInt(GM_getValue("search_delay"))) ? 2 : GM_getValue("search_delay")) + `,
                gpt: String(` + (GM_getValue("gpt") || -1) + `),
                show_setting: false,
                hidden: false,
                need_jump: false,
                tip: tips[Math.floor(Math.random()*tips.length)],
                opt:{
                    token: '` + GM_getValue("token") + `',
                    auto_jump: ` + GM_getValue("auto_jump") + `,
                    stop: false,
                    start_pay: ` + GM_getValue("start_pay") + `
                },
                input: '',
                visible: false,
                tableData: [],
                passw:"password"
            }
        },
        created(){
            /**
            *
            * @param type 消息类型
            * @param receiveParams 消息参数
            */
            window['vueDefinedProp'] = (type,receiveParams) => {
                if (type === 'push'){
                    let length = this.tableData.length
                    this.tableData.push({index: length + 1,question: receiveParams.question,answer: receiveParams.answer,style:receiveParams.style})
                }else if (type === 'clear'){
                    this.tableData = []
                }else if (type === 'tip'){
                    if (receiveParams.type && receiveParams.type === 'jump'){
                         window.parent.postMessage({"type": 'jump'}, '*');
                    }else if (receiveParams.type && receiveParams.type === 'error'){
                         this.need_jump = true
                    }else if (receiveParams.type && receiveParams.type === 'hidden'){
                         this.hidden = true
                    }else if (receiveParams.type && receiveParams.type === 'stop'){
                         this.opt.stop = true
                    }
                    this.tip = receiveParams.tip
                }else if (type === 'stop'){
                    this.opt.stop = receiveParams
                }else if (type === 'start_pay'){
                    this.opt.start_pay = receiveParams
                }else if (type === 'update'){
                    this.updateScript(receiveParams.v1,receiveParams.v2,receiveParams.href)
                }
            }
        },
        methods: {
            save_setting(){
                 window.parent.postMessage({type: 'save_setting',search_delay:this.search_delay,gpt:this.gpt,tiku_adapter:this.tiku_adapter}, '*');
                 this.show_setting = false
            },

            tableRowClassName({row, rowIndex}) {
                return row.style
            },
            btnClick(e,type){
                if (type === 'opt.stop'){//暂停搜索
                    this.opt.stop = !this.opt.stop
                    this.tip = this.opt.stop? '已暂停搜索': '继续搜索'
                    window.parent.postMessage({type: 'stop',val:this.opt.stop}, '*');
                }else if (type === 'opt.start_pay'){
                     window.parent.postMessage({type: 'start_pay',flag:!this.opt.start_pay}, '*');
                }else if (type === 'opt.auto_jump'){//开启自动切换
                    this.opt.auto_jump = ! this.opt.auto_jump
                    window.parent.postMessage({type: 'auto_jump',flag:this.opt.auto_jump}, '*');
                }else if (type === 'opt.jump'){//跳过本题
                    window.parent.postMessage({type: 'jump'}, '*');
                    this.need_jump = false
                }else if (type === 'opt.confim'){
                    window.parent.postMessage({type: 'confim',token:e}, '*');
                }
            }
        }
    })
</script>
</html>
`;
    addModal2(html);
    checkVersion();
}

function dragModel(modal) {
    // 获取拖动句柄
    const headerElem = modal.querySelector("#hcsearche-modal-links");
    if (headerElem) {
        headerElem.style.cursor = "move";
    }

    // 设置初始位置
    const pos = GM_getValue("pos");
    if (pos) {
        const [left, top] = pos.split(",");
        modal.style.left = left;
        modal.style.top = top;
    } else {
        modal.style.left = "30px";
        modal.style.top = "30px";
    }

    // 确保模态框可见并置顶
    modal.style.position = "fixed";
    modal.style.zIndex = "999999999";
    modal.style.overflow = "visible";

    // 简单的鼠标事件变量
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // 鼠标按下事件 - 开始拖动
    if (headerElem) {
        headerElem.addEventListener("mousedown", function(e) {
            e.preventDefault();

            // 计算鼠标位置与模态框位置之间的偏移量
            offsetX = e.clientX - parseInt(modal.style.left);
            offsetY = e.clientY - parseInt(modal.style.top);

            isDragging = true;

            // 临时增加z-index在拖动过程中
            const oldZIndex = modal.style.zIndex;
            modal.style.zIndex = "9999999999";

            // 添加临时鼠标移动和鼠标松开处理程序
            function moveHandler(e) {
                if (!isDragging) return;

                // 计算新位置
                let newLeft = e.clientX - offsetX;
                let newTop = e.clientY - offsetY;

                // 获取窗口尺寸和模态框尺寸
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const modalWidth = modal.offsetWidth;
                const modalHeight = modal.offsetHeight;

                // 防止拖出屏幕 - 左侧和上侧边界
                newLeft = Math.max(0, newLeft);
                newTop = Math.max(0, newTop);

                // 防止拖出屏幕 - 右侧和下侧边界
                // 保留至少50px在屏幕内，确保用户能够访问到模态框
                newLeft = Math.min(newLeft, windowWidth - Math.min(modalWidth, 100));
                newTop = Math.min(newTop, windowHeight - Math.min(modalHeight, 80));

                // 应用新位置
                modal.style.left = newLeft + "px";
                modal.style.top = newTop + "px";

                // 保存位置
                GM_setValue("pos", newLeft + "px," + newTop + "px");
            }

            function upHandler() {
                isDragging = false;
                modal.style.zIndex = oldZIndex;

                // 移除临时事件监听器
                document.removeEventListener("mousemove", moveHandler);
                document.removeEventListener("mouseup", upHandler);
            }

            // 添加临时事件监听器
            document.addEventListener("mousemove", moveHandler);
            document.addEventListener("mouseup", upHandler);
        });
    }

    // 添加快捷键控制显示/隐藏
    document.addEventListener("keydown", function(e) {
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            modal.style.display = "none";
            GM_setValue("hide", true);
            vm.hideTip();
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            modal.style.display = "block";
            GM_setValue("hide", false);
        }
    });

    // 如果之前设置为隐藏，则隐藏模态框
    if (GM_getValue("hide")) {
        modal.style.display = "none";
        vm.hideTip();
    }

    // 初始检查 - 确保弹窗在可视范围内
    setTimeout(function() {
        // 获取当前位置
        let currentLeft = parseInt(modal.style.left || "0");
        let currentTop = parseInt(modal.style.top || "0");

        // 获取窗口尺寸和模态框尺寸
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const modalWidth = modal.offsetWidth;
        const modalHeight = modal.offsetHeight;

        // 检查是否在可视范围内
        let needsAdjustment = false;

        // 左侧和上侧边界检查
        if (currentLeft < 0) {
            currentLeft = 0;
            needsAdjustment = true;
        }
        if (currentTop < 0) {
            currentTop = 0;
            needsAdjustment = true;
        }

        // 右侧和下侧边界检查
        if (currentLeft > windowWidth - Math.min(modalWidth, 100)) {
            currentLeft = windowWidth - Math.min(modalWidth, 100);
            needsAdjustment = true;
        }
        if (currentTop > windowHeight - Math.min(modalHeight, 80)) {
            currentTop = windowHeight - Math.min(modalHeight, 80);
            needsAdjustment = true;
        }

        // 如果需要调整，应用新位置
        if (needsAdjustment) {
            modal.style.left = currentLeft + "px";
            modal.style.top = currentTop + "px";
            GM_setValue("pos", currentLeft + "px," + currentTop + "px");
        }
    }, 500);
}

function createContainer(className, childElements) {
    let container = top.document.createElement("div");
    container.className = className;

    // Ensure container doesn't clip its contents
    container.style.overflow = "visible";
    container.style.maxHeight = "none";
    container.style.maxWidth = "none";

    if (Array.isArray(childElements)) {
        childElements.forEach(child => {
            container.appendChild(child);
        });
    } else if (childElements) {
        container.appendChild(childElements);
    }
    return container;
}

function render(tagName, elemId, childElem, isFixed, newPos) {
    let doc = top.document;
    let elem = doc.getElementById(elemId);

    if (elem) {
        elem.innerHTML = "";
    } else {
        elem = doc.createElement(tagName);
        elem.id = elemId;

        // Make sure styles are applied before adding to DOM
        elem.style.position = "fixed";
        elem.style.zIndex = "999999999";
        elem.style.overflow = "visible";
        elem.style.left = "30px";
        elem.style.top = "30px";

        doc.body.appendChild(elem);
    }

    // Create content container
    let contentNode = doc.createElement("div");
    contentNode.className = tagName + "-container";
    contentNode.style.overflow = "visible";

    // Add child elements
    if (Array.isArray(childElem)) {
        childElem.forEach(child => contentNode.appendChild(child));
    } else if (childElem) {
        contentNode.appendChild(childElem);
    }

    elem.appendChild(contentNode);
    elem.classList.add(elemId);

    // Apply animation class with slight delay
    setTimeout(function() {
        elem.classList.add(elemId + "-show");
    }, 10);

    return elem;
}

function renderModal(childElem, newPos) {
    // Generate random ID for the element
    const randomTag = String.fromCharCode(rand(65, 90), rand(65, 90), rand(65, 90)) + rand(1, 100).toString();

    // Create the modal element
    const modal = render(randomTag, modelId, childElem);

    // Apply drag behavior
    dragModel(modal);

    // Apply visibility based on GM_getValue
    if (GM_getValue("hide")) {
        $("#" + modelId).hide();
        vm.hideTip();
    }

    return modal;
}

function addModal2(html, newPos, footerChildNode = false) {
    // 创建干净的拖动标题栏（使用成功提示框的颜色）
    let headerNode = document.createElement("div");
    headerNode.id = "hcsearche-modal-links";
    headerNode.style.cssText = `
        background-color: #f0f9eb;
        padding: 10px;
        text-align: center;
        cursor: move;
        font-weight: bold;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        user-select: none;
        overflow: visible;
        width: 360px;
    `;

    // 添加标题文本
    let titleNode = document.createElement("div");
    titleNode.textContent = "学习通小助手-考试端";
    titleNode.style.cssText = `
        font-size: 16px;
        color: #333;
    `;
    headerNode.appendChild(titleNode);

    // 创建iframe容器
    let iframeNode = document.createElement("iframe");
    iframeNode.id = "iframeNode";
    iframeNode.width = "100%";
    iframeNode.height = GLOBAL.length + "px";
    iframeNode.style.height = GLOBAL.length + "px";
    iframeNode.frameBorder = "0";
    iframeNode.srcdoc = html;

    // 创建内容容器
    let contentContainer = document.createElement("div");
    contentContainer.className = "content-modal";
    contentContainer.style.cssText = `
        position: relative;
        border-left: 5px solid #f0f9eb;
        border-right: 5px solid #f0f9eb;
        border-bottom: 5px solid #f0f9eb;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        background-color: white;
        overflow: visible;
        width: 360px;
    `;

    // 添加元素到容器
    contentContainer.appendChild(headerNode);
    contentContainer.appendChild(iframeNode);

    // 创建并返回模态框
    let modal = renderModal(contentContainer, newPos);

    // 确保模态框可见并可拖动
    if (modal) {
        modal.style.borderRadius = "6px";
        modal.style.overflow = "visible";
        modal.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        modal.style.width = "370px";
    }

    return modal;
}

const init$1 = async ($TiMu, select, wrap) => {
    let question = formatString(filterImg($TiMu.find(select.elements.question)));
    if (select.elements.type && select.elements.type.includes("input[name^=type]:eq")) {
        select.elements.type = "input[name^=type]:eq(" + GLOBAL.i + ")";
    }
    let data = {
        $item: $TiMu,
        question_text: $TiMu.find(select.elements.question).text(),
        question: question.length === 0 ? $TiMu.find(select.elements.question) : question.replace(/^\d+、/, "").replace(/[(（](\d+\s?(\.\d+)?分)[)）]$/, "").replace(/^((\d+.(\s+)?)?)[\[(（【](.*?)[】)）\]]/, "").trim(),
        $options: select.elements.$options ? $TiMu.find(select.elements.$options) : undefined,
        options: select.elements.options ? jQuery.map($TiMu.find(select.elements.options), function(val) {
            return formatString(filterImg(val)).replace(/^[A-Ga-g][.、]/, "").trim();
        }) : undefined
    };
    if (select.elements.type) {
        const getType = getQuestionType($TiMu.find(select.elements.type).text());
        const val = $TiMu.find(select.elements.type).val();
        data.type = isNaN(getType) ? isNaN(val) ? val : parseInt(val) : getType;
    } else {
        data.type = defaultWorkTypeResolver(data.$options);
    }
    if (select.elements.answer) {
        data.answer = getAnswer(filterImg($TiMu.find(select.elements.answer)) || $TiMu.find(select.elements.answer).val(), data.options, data.type);
    }
    if (data && data.type === 3 && data.options.length === 0) {
        data.options = [ "正确", "错误" ];
    }

    try {
        const r = await wrap(data);
        if (typeof r === "boolean") return undefined;
        return data;
    } catch (error) {
        console.error("Error in init$1:", error);
        return data;
    }
};

async function WorkerJSPlus(options) {
    if (GLOBAL.isMatch) return;
    const match = options.match ? typeof options.match === "boolean" ? options.match : options.match() : false;
    if (!match) return;
    GLOBAL.isMatch = true;
    if (options.hook && typeof options.hook === "function") {
        if (options.hook()) return;
    }
    const defaultFunc = () => {};
    const main = () => {
        setTimeout(() => {
            showPanel();
            if (options.init && typeof options.init === "function") {
                if (options.init()) return;
            }
            const select = {
                root: options.root,
                elements: options.elements,
                ignore_click: options.ignore_click
            };
            new WorkerJS(select, options.wrap ? options.wrap : defaultFunc, options.fill ? options.fill : defaultFunc, options.finished ? options.finished : defaultFunc, options.fillFinish ? options.fillFinish : defaultFunc).fillAnswer();
        }, GLOBAL.delay);
    };
    if (options.intv) {
        setIntervalFunc(options.intv, main);
    } else {
        main();
    }
}

var WorkerJS = function(select, searchHander, fillHander, onFinish = function(need_jump) {}, fillFinish = function() {}) {
    GLOBAL.index = 0;
    this.init = init$1;
    this.fillAnswer = async () => {
        let arr = jQuery(select.root);
        while (true) {
            if (arr.length === 0) return;
            await sleep((isNaN(parseInt(GM_getValue("search_delay"))) ? 2 : GM_getValue("search_delay")) * 1e3);
            if (GLOBAL.stop) {
                continue;
            }
            if (GLOBAL.index >= arr.length) {
                let auto_jump = GM_getValue("auto_jump") === undefined || GM_getValue("auto_jump");
                const next = await onFinish(auto_jump);
                if (next) {
                    GLOBAL.index = 0;
                    setTimeout(this.fillAnswer, 300);
                }
                if (auto_jump) {
                    iframeMsg("tip", {
                        tip: "自动答题已完成,即将切换下一题"
                    });
                    next || setTimeout(() => {
                        iframeMsg("tip", {
                            type: "hidden",
                            tip: "自动答题已完成,请检查提交"
                        });
                    }, Math.max(GM_getValue("search_delay") || 2, 5) * 1e3);
                } else {
                    iframeMsg("tip", {
                        tip: "自动答题已完成" + (arr.length === 1 ? ",请手动切换" : "请检查提交")
                    });
                }
                return true;
            }
            try {
                let data = await this.init(jQuery(arr[GLOBAL.index++]), select, searchHander);
                if (!data) {
                    GLOBAL.index--;
                    continue;
                }
                iframeMsg("tip", {
                    tip: "准备答第" + GLOBAL.index + "题"
                });
                const formatResult = await formatSearchAnswer(data);
                const hookAnswer = data.answer && data.answer.length > 0 && GM_getValue("start_pay");
                const formatAns = hookAnswer ? {
                    success: true,
                    num: formatResult.num,
                    list: [ data.answer ]
                } : formatResult;
                if (formatResult.answers || formatAns.success) {
                    iframeMsg("tip", {
                        tip: "准备填充答案,当前使用免费题库"
                    });
                    const func = !hookAnswer && formatResult.answers ? defaultFillAnswer : defaultQuestionResolve;
                    let r = await func(hookAnswer ? formatAns.list : formatAns.answers ? formatResult.answers : formatAns.list, data, fillHander, select.ignore_click ? select.ignore_click : () => {
                        return false;
                    });
                    iframeMsg("push", {
                        index: GLOBAL.index,
                        question: r.question,
                        answer: r.ans,
                        style: r.style
                    });
                    GM_getValue("start_pay") && String(GM_getValue("token")).length === 10 && catchAnswer(r);
                    await fillFinish(r);
                } else {
                    GLOBAL.index--;
                    iframeMsg("tip", {
                        tip: formatAns.msg
                    });
                }
            } catch (e) {
                GLOBAL.index--;
                console.table(e);
            }
        }
    };
};









    // @thanks 特别感谢 qxin i 借鉴 网页限制解除(改) 开源地址 https://greasyfork.org/zh-CN/scripts/28497
    function init() {
        rule = rwl_userData.rules.rule_def;
        hook_eventNames = rule.hook_eventNames.split("|");
        unhook_eventNames = rule.unhook_eventNames.split("|");
        eventNames = hook_eventNames.concat(unhook_eventNames);
        if (rule.dom0) {
            setInterval(clearLoop, 10 * 1e3);
            setTimeout(clearLoop, 1500);
            window.addEventListener("load", clearLoop, true);
            clearLoop();
        }
        if (rule.hook_addEventListener) {
            EventTarget.prototype.addEventListener = addEventListener;
            document.addEventListener = addEventListener;
            if (hasFrame) {
                for (let i = 0; i < hasFrame.length; i++) {
                    hasFrame[i].contentWindow.document.addEventListener = addEventListener;
                }
            }
        }
        if (rule.hook_preventDefault) {
            Event.prototype.preventDefault = function() {
                if (hook_eventNames.indexOf(this.type) < 0) {
                    Event_preventDefault.apply(this, arguments);
                }
            };
            if (hasFrame) {
                for (let i = 0; i < hasFrame.length; i++) {
                    hasFrame[i].contentWindow.Event.prototype.preventDefault = function() {
                        if (hook_eventNames.indexOf(this.type) < 0) {
                            Event_preventDefault.apply(this, arguments);
                        }
                    };
                }
            }
        }
        if (rule.hook_set_returnValue) {
            Event.prototype.__defineSetter__("returnValue", function() {
                if (this.returnValue !== true && hook_eventNames.indexOf(this.type) >= 0) {
                    this.returnValue = true;
                }
            });
        }
    }
    function addEventListener(type, func, useCapture) {
        var _addEventListener = this === document ? document_addEventListener : EventTarget_addEventListener;
        if (hook_eventNames.indexOf(type) >= 0) {
            _addEventListener.apply(this, [ type, returnTrue, useCapture ]);
        } else if (unhook_eventNames.indexOf(type) >= 0) {
            var funcsName = storageName + type + (useCapture ? "t" : "f");
            if (this[funcsName] === undefined) {
                this[funcsName] = [];
                _addEventListener.apply(this, [ type, useCapture ? unhook_t : unhook_f, useCapture ]);
            }
            this[funcsName].push(func);
        } else {
            _addEventListener.apply(this, arguments);
        }
    }
    function clearLoop() {
        rule = clear();
        var elements = getElements();
        for (var i in elements) {
            for (var j in eventNames) {
                var name = "on" + eventNames[j];
                if (Object.prototype.toString.call(elements[i]) == "[object String]") {
                    continue;
                }
                if (elements[i][name] !== null && elements[i][name] !== onxxx) {
                    if (unhook_eventNames.indexOf(eventNames[j]) >= 0) {
                        elements[i][storageName + name] = elements[i][name];
                        elements[i][name] = onxxx;
                    } else {
                        elements[i][name] = null;
                    }
                }
            }
        }
        document.onmousedown = function() {
            return true;
        };
    }
    function returnTrue(e) {
        return true;
    }
    function unhook_t(e) {
        return unhook(e, this, storageName + e.type + "t");
    }
    function unhook_f(e) {
        return unhook(e, this, storageName + e.type + "f");
    }
    function unhook(e, self, funcsName) {
        var list = self[funcsName];
        for (var i in list) {
            list[i](e);
        }
        e.returnValue = true;
        return true;
    }
    function onxxx(e) {
        var name = storageName + "on" + e.type;
        this[name](e);
        e.returnValue = true;
        return true;
    }
    function getElements() {
        var elements = Array.prototype.slice.call(document.getElementsByTagName("*"));
        elements.push(document);
        var frames = document.querySelectorAll("frame");
        if (frames) {
            hasFrame = frames;
            var frames_element;
            for (let i = 0; i < frames.length; i++) {
                frames_element = Array.prototype.slice.call(frames[i].contentWindow.document.querySelectorAll("*"));
                elements.push(frames[i].contentWindow.document);
                elements = elements.concat(frames_element);
            }
        }
        return elements;
    }
    var settingData = {
        status: 1,
        version: .1,
        message: "",
        positionTop: "0",
        positionLeft: "0",
        positionRight: "auto",
        addBtn: false,
        connectToTheServer: false,
        waitUpload: [],
        currentURL: "null",
        shortcut: 3,
        rules: {},
        data: []
    };
    var rwl_userData = null;
    var rule = null;
    var hasFrame = false;
    var storageName = "storageName";
    var hook_eventNames, unhook_eventNames, eventNames;
    var EventTarget_addEventListener = EventTarget.prototype.addEventListener;
    var document_addEventListener = document.addEventListener;
    var Event_preventDefault = Event.prototype.preventDefault;
    rwl_userData = GM_getValue("rwl_userData");
    if (!rwl_userData) {
        rwl_userData = settingData;
    }
    for (let value in settingData) {
        if (!rwl_userData.hasOwnProperty(value)) {
            rwl_userData[value] = settingData[value];
            GM_setValue("rwl_userData", rwl_userData);
        }
    }
    // @thanks 特别感谢 wyn大佬 提供的 字典匹配表 原作者 wyn665817@163.com 开源地址 https://scriptcat.org/script-show-page/432/code
    function removeF() {
        var $tip = $("style:contains(font-cxsecret)");
        if (!$tip.length) return;
        var font = $tip.text().match(/base64,([\w\W]+?)'/)[1];
        font = Typr.parse(base64ToUint8Array(font))[0];
        var table = JSON.parse(GM_getResourceText("Table"));
        var match = {};
        for (var i = 19968; i < 40870; i++) {
            $tip = Typr.U.codeToGlyph(font, i);
            if (!$tip) continue;
            $tip = Typr.U.glyphToPath(font, $tip);
            $tip = MD5(JSON.stringify($tip)).slice(24);
            match[i] = table[$tip];
        }
        $(".font-cxsecret").html(function(index, html) {
            $.each(match, function(key, value) {
                key = String.fromCharCode(key);
                key = new RegExp(key, "g");
                value = String.fromCharCode(value);
                html = html.replace(key, value);
            });
            return html;
        }).removeClass("font-cxsecret");
        function base64ToUint8Array(base64) {
            var data = window.atob(base64);
            var buffer = new Uint8Array(data.length);
            for (var i = 0; i < data.length; ++i) {
                buffer[i] = data.charCodeAt(i);
            }
            return buffer;
        }
    }
    function start() {
        try {
            removeF();
        } catch (e) {}
        try {
            init();
        } catch (e) {}
    }
    WorkerJSPlus({
        name: "学习通作业",
        match: location.pathname === "/mooc2/work/dowork" || location.pathname === "/mooc-ans/mooc2/work/dowork",
        root: ".questionLi",
        elements: {
            question: "h3",
            options: ".stem_answer .answerBg .answer_p, .textDIV, .eidtDiv",
            $options: ".stem_answer .answerBg, .textDIV, .eidtDiv",
            type: "input[type^=hidden]:eq(0)"
        },
        wrap: obj => {
            obj.question = obj.question.replace(obj.$item.find(".colorShallow").text(), "").replace(/^(\d+\.\s)/, "");
        },
        ignore_click: $item => {
            return Boolean($item.find(".check_answer,.check_answer_dx").length);
        },
        fill: (type, answer, $option) => {
            if (type === 4 || type === 2 || type === 5) {
                UE$1.getEditor($option.find("textarea").attr("name")).setContent(answer);
            }
        }
    });
    WorkerJSPlus({
        name: "超星旧版考试",
        match: (location.pathname === "/exam/test/reVersionTestStartNew" || location.pathname === "/exam-ans/exam/test/reVersionTestStartNew") && !location.href.includes("newMooc=true"),
        root: ".TiMu",
        elements: {
            question: ".Cy_TItle .clearfix",
            options: ".Cy_ulTop .clearfix",
            $options: ":radio, :checkbox, .Cy_ulTk textarea",
            type: "[name^=type]:not([id])"
        },
        ignore_click: $item => {
            return $item.get(0).checked;
        },
        fill: (type, answer, $option) => {
            if (type === 4 || type === 2 || type === 5) {
                UE$1.getEditor($option.attr("name")).setContent(answer);
            }
        },
        finished: auto_jump => {
            auto_jump && setInterval(function() {
                const btn = $(".saveYl:contains(下一题)").offset();
                var mouse = document.createEvent("MouseEvents"), arr = [ btn.left + Math.ceil(Math.random() * 80), btn.top + Math.ceil(Math.random() * 26) ];
                mouse.initMouseEvent("click", true, true, document.defaultView, 0, 0, 0, arr[0], arr[1], false, false, false, false, 0, null);
                _self.event = $.extend(true, {}, mouse);
                delete _self.event.isTrusted;
                _self.getTheNextQuestion(1);
            }, Math.ceil(GLOBAL.fillAnswerDelay * Math.random()) * 2);
        }
    });
    WorkerJSPlus({
        name: "超星章节测验",
        match: location.pathname === "/work/doHomeWorkNew" || location.pathname === "/mooc-ans/work/doHomeWorkNew",
        init: start,
        root: ".clearfix .TiMu",
        elements: {
            question: ".Zy_TItle .clearfix",
            options: "ul:eq(0) li .after",
            $options: "ul:eq(0) li :radio,:checkbox,textarea,.num_option_dx,.num_option",
            type: "input[name^=answertype]"
        },
        ignore_click: $item => {
            if ($item.is("input")) {
                return $item.get(0).checked;
            }
            return $item.attr("class").includes("check_answer");
        },
        fill: async (type, answer, $option) => {
            if (type === 4 || type === 2 || type === 5) {
                UE$1.getEditor($option.attr("name")).setContent(answer);
            }
        }
    });
    WorkerJSPlus({
        name: "超星新版考试",
        match: () => {
            const cxSinglePage = (location.pathname === "/exam/test/reVersionTestStartNew" || location.pathname === "/exam-ans/exam/test/reVersionTestStartNew" || location.pathname === "/mooc-ans/exam/test/reVersionTestStartNew") && location.href.includes("newMooc=true");
            const cxAll = location.pathname === "/mooc2/exam/preview" || location.pathname === "/exam-ans/mooc2/exam/preview" || location.pathname === "/mooc-ans/mooc2/exam/preview";
            return cxSinglePage || cxAll;
        },
        root: ".questionLi",
        elements: {
            question: "h3 div",
            options: ".answerBg .answer_p, .textDIV, .eidtDiv",
            $options: ".answerBg, .textDIV, .eidtDiv",
            type: "input[name^=type]:eq(" + GLOBAL.i + ")"
        },
        ignore_click: $item => {
            return Boolean($item.find(".check_answer,.check_answer_dx").length);
        },
        hook: () => {
            GLOBAL.i = Number((location.pathname === "/exam/test/reVersionTestStartNew" || location.pathname === "/exam-ans/exam/test/reVersionTestStartNew" || location.pathname === "/mooc-ans/exam/test/reVersionTestStartNew") && location.href.includes("newMooc=true"));
        },
        wrap: obj => {
            if (obj.type === 6) {
                obj.type = 4;
            }
        },
        fill: (type, answer, $option) => {
            if (type === 4 || type === 2 || type === 5) {
                const name = $option.find("textarea").attr("name");
                UE$1.getEditor(name).setContent(answer);
                if (GLOBAL.i === 0) {
                    console.log("#" + name.replace("answerEditor", "save_"));
                    $("#" + name.replace("answerEditor", "save_")).click();
                }
            }
        },
        finished: a => {
            a && $('.nextDiv .jb_btn:contains("下一题")').click();
        }
    });
    WorkerJSPlus({
        name: "超星随堂测验",
        match: location.pathname.includes("/page/quiz/stu/answerQuestion"),
        root: ".question-item",
        elements: {
            question: ".topic-txt",
            options: ".topic-option-list",
            $options: ".topic-option-list input",
            type: "input[class^=que-type]"
        },
        ignore_click: $item => {
            return Boolean($item.find(".check_answer,.check_answer_dx").length);
        },
        wrap: obj => {
            if (obj.type === 16) {
                obj.type = 3;
            }
        },
        fill: (type, answer, $option) => {
            if (type === 4 || type === 2) {
                $option.val(answer);
            }
        }
    });
    function JSONParseHook(func) {
        const parse = JSON.parse;
        JSON.parse = function(...args) {
            const o = parse.call(this, ...args);
            func(o);
            return o;
        };
    }
    function hookZhiHuiShuWork(o, arr) {
        function format(item) {
            let options = [];
            let options_id;
            if (item.questionOptions && item.questionOptions.length) {
                options = item.questionOptions.map(o => {
                    return formatString(o.content);
                });
                options_id = item.questionOptions.map(o => {
                    return o.id;
                });
            }
            return {
                qid: item.id,
                question: formatString(item.name),
                type: getQuestionType(item.questionType.name),
                options_id: options_id,
                options: options
            };
        }
        if (o.rt && o.rt.examBase && o.rt.examBase.workExamParts.length > 0) {
            GLOBAL.content = o.rt;
            GLOBAL.json = o.rt.examBase.workExamParts.map(part => {
                return part.questionDtos.map(item => {
                    if ("阅读理解（选择）/完型填空" === item.questionType.name || "听力训练" === item.questionType.name || !(item.questionType.name.includes("填空") || item.questionType.name.includes("问答")) && item.questionChildrens && item.questionChildrens.length > 0) {
                        return item.questionChildrens.map(i => {
                            console.log(format(i));
                            return format(i);
                        }).flat();
                    } else {
                        return format(item);
                    }
                });
            }).flat();
        } else if (o.rt && Object.keys(o.rt).length > 0 && !isNaN(Object.keys(o.rt)[0])) {
            GLOBAL.img = o.rt;
        }
    }

    WorkerJSPlus({
        match: location.href.includes("checkHomework") && location.host.includes("zhihuishu"),
        hook: () => {
            JSONParseHook(hookZhiHuiShuWork);
        },
        init: () => {
            R({
                type: 2,
                content: GLOBAL.content,
                img: GLOBAL.img
            });
        }
    });
    GLOBAL.timeout = 10 * 1e3;
    function uploadAnswer(data) {
        const arr2 = division(data, 100);
        for (let arr2Element of arr2) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://lyck6.cn/pcService/api/uploadAnswer",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify(arr2Element),
                timeout: GLOBAL.timeout
            });
        }
    }
    function uploadAnswerToPlat(data, plat) {
        const arr2 = division(data, 100);
        for (let arr2Element of arr2) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://lyck6.cn/collect-service/v1/uploadAnswerToPlat?plat=" + plat,
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                data: JSON.stringify(arr2Element),
                timeout: GLOBAL.timeout
            });
        }
    }

    function parseIcve(questions) {
        return questions.map(item => {
            const options = item.Selects.map(opt => {
                return formatString(opt);
            });
            const type = getQuestionType(item.ACHType.QuestionTypeName);
            const answer = item.Answers.map(key => {
                if (type === 0 || type === 1) {
                    return options[key.charCodeAt() - 65];
                } else if (type === 3) {
                    return key === "1" ? "正确" : "错误";
                }
            });
            const answerKey = type === 0 || type === 1 ? item.Answers : answer;
            return {
                id: item.Id,
                question: item.ContentText,
                answerKey: answerKey,
                options: type === 3 ? [ "正确", "错误" ] : options,
                answer: answer,
                type: type
            };
        });
    }
    WorkerJSPlus({
        name: "资源库 WWW开头",
        match: location.pathname === "/study/works/works.html" || location.pathname === "/study/exam/exam.html",
        root: ".questions",
        elements: {
            question: ".preview_stem",
            options: "li .preview_cont",
            $options: "li input",
            type: "input:hidden"
        },
        hook: () => {
            JSONParseHook(o => {
                if (location.pathname === "/study/works/works.html") {
                    if (o.paper) {
                        GLOBAL.json = parseIcve(o.paper.PaperQuestions);
                        uploadAnswer(GLOBAL.json);
                    }
                } else if (location.pathname === "/study/exam/exam.html") {
                    if (o.array) {
                        GLOBAL.json = parseIcve(o.array.map(item => {
                            return item.Questions;
                        }).flat());
                        uploadAnswer(GLOBAL.json);
                    }
                }
            });
        },
        ignore_click: $item => {
            return $item.prop("checked");
        },
        wrap: obj => {
            function get_element(id) {
                for (let jsonElement of GLOBAL.json) {
                    if (jsonElement.id === id) {
                        return jsonElement;
                    }
                }
            }
            const ele = get_element(obj.$item.find("input:hidden").val());
            obj.question = ele.question;
            obj.answer = ele.answerKey ? ele.answerKey : ele.answer;
            obj.type = ele.type;
            obj.options = ele.options;
            console.log(obj);
        },
        fill: (type, answer, $option) => {
            if (type === 4 || type === 2) {
                UE$1.getEditor($option.attr("name")).setContent(answer);
            }
        }
    });

    function parseYkt(problems) {
        return problems.map(item => {
            const question = formatString(item.Body);
            const type = getQuestionType(item.TypeText);
            const options = [];
            const answer = [];
            if (type <= 1) {
                options.push(...item.Options.sort((a, b) => {
                    return a.key.charCodeAt(0) - b.key.charCodeAt(0);
                }).map(item => {
                    return formatString(item.value);
                }));
                if (item.Answer) {
                    if (Array.isArray(item.Answer)) {
                        answer.push(...item.Answer);
                    } else {
                        answer.push(...item.Answer.split(""));
                    }
                }
            } else if (type === 3 && item.Answer && item.Answer.length === 1) {
                answer.push(item.Answer[0].replace("true", "正确").replace("false", "错误"));
            }
            return {
                answer: answer,
                options: options,
                type: type,
                qid: item.problem_id,
                question: question
            };
        });
    }
    function parsehnzkwText(problems) {
        return problems.map(item => {
            const type = item.flag === 1 ? 2 : item.flag === 0 ? 0 : item.flag === 4 ? 1 : item.flag === 3 ? 3 : undefined;
            let answer = [];
            let options = [];
            if (type === 2) {
                answer.push(item.answer);
                return {
                    question: formatString(item.content),
                    options: options,
                    type: type,
                    answer: answer
                };
            } else if (type === 0) {
                for (let subjectOption of item.optionss) {
                    const opt = formatString(subjectOption);
                    options.push(opt);
                }
                if (type === 1) {
                    item.answer.split("|").map(i => {
                        answer.push(options[i.toUpperCase().charCodeAt(0) - 65]);
                    });
                } else {
                    answer.push(options[item.answer.toUpperCase().charCodeAt(0) - 65]);
                }
                return {
                    question: formatString(item.content),
                    options: options,
                    type: type,
                    answer: answer
                };
            } else if (type === 3) {
                for (let subjectOption of item.selectOption) {
                    const opt = formatString(subjectOption);
                    options.push(opt);
                }
                answer.push(item.answer);
                return {
                    question: formatString(item.content),
                    options: options,
                    type: type,
                    answer: answer
                };
            }
        });
    }
    function parseDanWei(pro) {
        return pro.map(i => {
            const type = getQuestionType(i.ttop010);
            const question = i.ttop011;
            const options = [];
            const answer = [];
            if (type === 0 || type === 1 || type === 3) {
                options.push(...i.ttop018.length > 0 ? i.ttop018.split("$$") : [ "正确", "错误" ]);
                answer.push(...i.ttop022.split("").map(item => {
                    return options[item.charCodeAt(0) - 65];
                }));
            } else if (type === 2 || type === 4) {
                answer.push(...i.ttop021.split("$$"));
            }
            return {
                question: question,
                type: type,
                answer: answer,
                options: options
            };
        }).filter(i => i);
    }
    function parseYxbyunExam(problems) {
        return problems.map(item => {
            const type = getQuestionType(item.bigName);
            return item.smallContent.map(item => {
                let answer = [];
                let options = [];
                if (type === 2) {
                    answer.push(item.answer);
                    return {
                        question: formatString(item.content),
                        options: options,
                        type: type,
                        answer: answer
                    };
                } else if (type === 0 || type === 3 || type === 1) {
                    let answer = [];
                    let options = [];
                    for (let subjectOption of item.question.optionList) {
                        const opt = formatString(subjectOption.questionContent);
                        options.push(opt);
                    }
                    if (type === 1) {
                        item.question.questionAnswer.split(",").map(i => {
                            answer.push(options[i.toUpperCase().charCodeAt(0) - 65]);
                        });
                    } else {
                        answer.push(options[item.question.questionAnswer.toUpperCase().charCodeAt(0) - 65]);
                    }
                    return {
                        question: formatString(item.question.questionTitle),
                        options: options,
                        type: type,
                        answer: answer
                    };
                }
            });
        });
    }

    WorkerJSPlus({
        name: "exam2_euibe_com_exam",
        match: location.hostname === "exam2.euibe.com" && location.pathname === "/KaoShi/ShiTiYe.aspx",
        root: ".question",
        elements: {
            question: ".wenti",
            options: "li label span",
            $options: "li label"
        },
        wrap: obj => {
            obj.type = getQuestionType($(".question_head").text());
        },
        finished: need_jump => {
            $(".paginationjs-next").click();
            return true;
        }
    });
    WorkerJSPlus({
        name: "lzwyedu_jijiaool_com_exam",
        match: () => {
            const pathMatch = location.pathname.includes("/learnspace/course/test/") || location.pathname.includes("/Student/ExamManage/CourseOnlineExamination");
            const matchHostArr = [ "lzwyedu.jijiaool.com", "cgjx.jsnu.edu.cn", "learn-cs.icve.com.cn", "nwnu.jijiaool.com", "lut.jijiaool.com", "learn.courshare.cn", "cj1027-kfkc.webtrn.cn" ];
            return pathMatch && matchHostArr.includes(location.host);
        },
        root: ".test_item",
        elements: {
            question: ".test_item_tit",
            options: ".test_item_theme label .zdh_op_con",
            $options: "label input"
        },
        wrap: obj => {
            obj.question = obj.question.replace(/该题未做$/, "").replace(/^\d+\./, "").replace(/^\d+、/, "").replace(/[(（](\d+\s?(\.\d+)?分)[)）]$/, "").replace(/^((\d+.(\s+)?)?)[\[(（【](.*?)[】)）\]]/, "").trim();
            obj.type = getQuestionType(obj.$item.prevAll(".test_item_type:first").text());
            if (obj.type === 3) {
                obj.options = [ "对", "错" ];
            }
        }
    });
    WorkerJSPlus({
        name: "zzx_ouchn_edu_cn_exam",
        match: location.hostname === "zzx.ouchn.edu.cn" && location.pathname.includes("/edu/public/student/"),
        root: ".subject",
        elements: {
            question: ".question span",
            options: ".answer>span>p:first-child",
            $options: ".answer>span>p:first-child"
        },
        wrap: obj => {
            if (obj.$options.length > 1) {
                obj.type = 0;
            }
        }
    });
    WorkerJSPlus({
        name: "zzx_ouchn_edu_cn_exam",
        match: location.hostname === "zzx.ouchn.edu.cn" && location.pathname.includes("/edu/public/student/"),
        root: ".subject",
        elements: {
            question: ".question span",
            options: ".answer>span>p:first-child",
            $options: ".answer>span>p:first-child"
        },
        wrap: obj => {
            if (obj.$options.length > 1) {
                obj.type = 0;
            }
        }
    });
    WorkerJSPlus({
        name: "havust_hnscen_cn_exam",
        match: location.hostname === "havust.hnscen.cn" && location.pathname.includes("/stuExam/examing/"),
        root: ".main .mt_2 > div",
        elements: {
            question: ".flex_row+div",
            options: ".flex_row+div+div .el-radio__label,.el-checkbox__label",
            $options: ".flex_row+div+div .el-radio__label,.el-checkbox__label",
            type: ".flex_row .mr_2"
        }
    });
    WorkerJSPlus({
        name: "www_zygbxxpt_com_exam",
        match: location.hostname === "www.zygbxxpt.com" && location.pathname.includes("/exam"),
        root: ".Body",
        elements: {
            question: ".QName",
            options: ".QuestinXuanXiang p:parent",
            $options: ".QuestinXuanXiang p:parent",
            type: ".QName span"
        },
        wrap: obj => {
            obj.question = obj.question.replace(/\([^\)]*\)/g, "").replace(/\【.*?\】/g, "");
            obj.options = obj.options.map(item => {
                return item.split(">").pop().trim();
            });
        }
    });
    WorkerJSPlus({
        name: "xuexi_jsou_cn_work",
        match: location.hostname === "xuexi.jsou.cn" && location.pathname.includes("/jxpt-web/student/newHomework/showHomeworkByStatus"),
        root: ".insert",
        elements: {
            question: ".window-title",
            options: ".questionId-option .option-title div[style^=display]",
            $options: ".questionId-option .option-title .numberCover"
        },
        wrap: obj => {
            obj.type = {
                1: 0,
                2: 1,
                7: 3
            }[obj.$item.find(".question-type").val()];
            if (obj.options.length == 2) {
                obj.type = 3;
            }
        }
    });
    WorkerJSPlus({
        name: "czvtc_cjEdu_com_exam",
        match: () => {
            const pathMatch = location.pathname.includes("/ExamInfo") || location.pathname.includes("/Examination");
            const matchHostArr = [ "czvtc.cj-edu.com", "hbkjxy.cj-edu.com", "bhlgxy.cj-edu.com", "hbsi.cj-edu.com", "czys.cj-edu.com", "hbjd.cj-edu.com", "xttc.cj-edu.com", "bvtc.cj-edu.com", "caztc.cj-edu.com" ];
            return pathMatch && matchHostArr.includes(location.host);
        },
        intv: () => {
            return $(".el-container .all_subject>.el-row").length;
        },
        root: ".el-container .all_subject>.el-row",
        elements: {
            question: ".stem div:last-child",
            options: ".el-radio-group .el-radio__label,.el-checkbox-group .el-checkbox__label",
            $options: ".el-radio-group .el-radio__original,.el-checkbox-group .el-checkbox__original"
        },
        wrap: obj => {
            if (obj.$options.length < 3 && obj.$options.eq(0).attr("type") === "radio") {
                obj.type = 3;
            } else if (obj.$options.length > 2 && obj.$options.eq(0).attr("type") === "radio") {
                obj.type = 0;
            } else if (obj.$options.length > 2 && obj.$options.eq(0).attr("type") === "checkbox") {
                obj.type = 1;
            }
        }
    });
    WorkerJSPlus({
        name: "learning_mhtall_com_exam",
        match: location.host.includes("learning.mhtall.com") && location.pathname.includes("/rest/course/exercise/item"),
        root: "#div_item",
        elements: {
            question: ".item_title",
            options: ".opt div label",
            $options: ".opt div input:not(.button_short)",
            type: "h4"
        },
        ignore_click: $item => {
            return $item.prop("checked");
        },
        wrap: obj => {
            if (obj.type === 0 || obj.type === 3) {
                obj.answer = $(".div_answer").text().match(/[a-zA-Z]/).map(i => {
                    return obj.options[i.charCodeAt(0) - 65];
                });
            } else if (obj.type === 2) {
                obj.answer = $(".div_answer").text().replace("参考答案：", "").split("，");
            }
        },
        fill: (type, answer, $option) => {
            if (type === 2 || type === 4) {
                $option.val(answer);
                $(".DIV_TYPE_BLANK .button_short").click();
            }
        },
        fillFinish: () => {
            if ($(".opt+div+div input:eq(1)").val() === "下一题") {
                $(".opt+div+div input:eq(1)").click();
            } else {
                $(".button_short:eq(2)").click();
            }
        }
    });

})();
//安全网址请填写在上方空白区域
// ==/UserScript==
(() => {
  //  var token = 'dampmQGPizKmgwAI', //因为淋过雨，所以想替学弟撑把伞。
   var token = GM_getValue('tikutoken'),
        jumpType = 1, // 0:智能模式，1:遍历模式，2:不跳转，如果智能模式出现无限跳转/不跳转情况，请切换为遍历模式
        disableMonitor = 0, // 0:无操作，1:解除多端学习监控，开启此功能后可以多端学习，不会被强制下线。
        randomDo = 1, //将0改为1，找不到答案的单选、多选、判断就会自动选【B、ABCD、错】，只在规定正确率不为100%时才生效
        backGround = 0, //是否对接超星挂机小助手，需要先安装对应脚本
        //-----------------------------------------------------------------------------------------------------
        autoLogin = 0, //掉线是否自动登录，1为自动登录，需要配置登录信息（仅支持手机号+密码登陆）
        phoneNumber = '', //自动登录的手机号，填写在单引号之间。
        password = ''; //自动登录的密码，填写在单引号之间。
    //-----------------------------------------------------------------------------------------------------
    var host = 'http://14.29.190.187:54223/',
        rate = GM_getValue('unrivalrate', '1'),//倍速
        accuracy = GM_getValue('accuracy',80), //章节测试正确率百分比，在答题正确率在规定之上并且允许自动提交时才会提交答案
        ctUrl = 'https://cx.icodef.com/wyn-nb?v=4',
        getQueryVariable = (variable) => {
            let q = _l.search.substring(1),
                v = q.split("&"),
                r = false;
            for (let i = 0, l = v.length; i < l; i++) {
                let p = v[i].split("=");
                p[0] == variable && (r = p[1]);
            }
            return r;
        },
        getCookie = name => `; ${document.cookie}`.split(`; ${name}=`).pop().split(';').shift(),
        isCat = GM_info.scriptHandler == 'ScriptCat',
        _w = unsafeWindow,
        _d = _w.document,
        _l = _w.location,
        _p = _l.protocol,
        _h = _l.host,
        //isEdge = _w.navigator.userAgent.includes("Edg/"),
        isFf = _w.navigator.userAgent.includes("Firefox"),
        isMobile = _w.navigator.userAgent.includes("Android"),
        stop = false,
        handleImgs = (s) => {
            imgEs = s.match(/(<img([^>]*)>)/);
            if (imgEs) {
                for (let j = 0, k = imgEs.length; j < k; j++) {
                    let urls = imgEs[j].match(
                        /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/),
                        url;
                    if (urls) {
                        url = urls[0].replace(/http[s]?:\/\//, '');
                        s = s.replaceAll(imgEs[j], url);
                    }
                }
            }
            return s;
        },
        trim = (s) => {
            return handleImgs(s).replaceAll('javascript:void(0);', '').replaceAll("&nbsp;", '').replaceAll("，", ',').replaceAll(
                "。", '.').replaceAll("：", ':').replaceAll("；",
                    ';').replaceAll("？", '?').replaceAll("（", '(').replaceAll("）", ')').replaceAll("“", '"')
                .replaceAll("”", '"').replaceAll("！", '!').replaceAll("-", ' ').replace(/(<([^>]+)>)/ig, '')
                .replace(/^\s+/ig, '').replace(/\s+$/ig, '');
        },
        cVersion = 999,
        classId = getQueryVariable('clazzid') || getQueryVariable('clazzId') || getQueryVariable('classid') ||
            getQueryVariable('classId'),
        courseId = getQueryVariable('courseid') || getQueryVariable('courseId'),
        UID = getCookie('_uid') || getCookie('UID'),
        FID = getCookie('fid'),
        jq = _w.top.$ || _w.top.jQuery;
    _w.confirm = (msg) => {
        return true;
    }
    setInterval(function () {
        _w.confirm = (msg) => {
            return true;
        }
    }, 2000);
    if (parseFloat(rate) == parseInt(rate)) {
        rate = parseInt(rate);
    } else {
        rate = parseFloat(rate);
    }
    try {
        _w.top.unrivalReviewMode = GM_getValue('unrivalreview', '0') || '0';
        _w.top.unrivalDoWork = GM_getValue('unrivaldowork', '1') || '1';
        _w.top.unrivalAutoSubmit = GM_getValue('unrivalautosubmit', '1') || '1';
        _w.top.unrivalAutoSave = GM_getValue('unrivalautosave', '0') || '0';
    } catch (e) { }
    if (_l.href.indexOf("knowledge/cards") > 0) {
        let allowBackground = false,
            spans = _d.getElementsByTagName('span');
        for (let i = 0, l = spans.length; i < l; i++) {
            if (spans[i].innerHTML.indexOf('章节未开放') != -1) {
                if (_l.href.indexOf("ut=s") != -1) {
                    _l.href = _l.href.replace("ut=s", "ut=t").replace(/&cpi=[0-9]{1,10}/, '');
                } else if (_l.href.indexOf("ut=t") != -1) {
                    spans[i].innerHTML = '此课程为闯关模式，请回到上一章节完成学习任务！'
                    return;
                }
                break;
            }
        }
        _w.top.unrivalPageRd = String(Math.random());
        if (!isFf) {
            try {
                cVersion = parseInt(navigator.userAgent.match(/Chrome\/[0-9]{2,3}./)[0].replace('Chrome/', '')
                    .replace('.', ''));
            } catch (e) { }
        }
        var busyThread = 0,
            getStr = (str, start, end) => {
                let res = str.substring(str.indexOf(start), str.indexOf(end)).replace(start, '');
                return res;
            },
            scripts = _d.getElementsByTagName('script'),
            param = null;
        for (let i = 0, l = scripts.length; i < l; i++) {
            if (scripts[i].innerHTML.indexOf('mArg = "";') != -1 && scripts[i].innerHTML.indexOf(
                '==UserScript==') == -1) {
                param = getStr(scripts[i].innerHTML, 'try{\n    mArg = ', ';\n}catch(e){');
            }
        }
        if (param == null) {
            return;
        }
        try {
            vrefer = _d.getElementsByClassName('ans-attach-online ans-insertvideo-online')[0].src;
        } catch (e) {
            vrefer = _p + '//' + _h + '/ananas/modules/video/index.html?v=2022-1118-1729';
        }
        GM_setValue('vrefer', vrefer);
        GM_setValue('host', _h);
        var base222 = `data:image/png;base64,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`
         _d.getElementsByTagName("html")[0].innerHTML =`
 <!DOCTYPE html>
 <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>学习通小助手</title>
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
        <link href="https://z.chaoxing.com/yanshi/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="row" style="margin: 10px;">
            <div class="col-md-6 col-md-offset-3">
                <div class="header clearfix">
                    <h3 class="text-muted" style="margin-top: 20px;margin-bottom: 0;float: left;"><a href="https://scriptcat.org/script-show-page/336" target="view_window">学习通小助手top1.0&ensp;</a></h3><div id="onlineNum"></div>
                </div>
                <hr style="margin-top: 10px;margin-bottom: 20px;">
                <div class="panel panel-info" id="normalQuery">
                    <div class="panel-heading">任务配置</div>
                    <div class="panel-body">
                        <div>如果显示视频已观看完毕，但视频任务未完成，可以点开复习模式，开1倍速，多刷几次</div></br>
                            <div style="padding: 0;font-size: 20px;float: left;">视频倍速：</div>

                            <div>
                                <input type="number" id="unrivalRate" style="width: 80px;">
                                &ensp;
                                <a id='updateRateButton' class="btn btn-default"style="color: white;background-color:darkcyan;">保存</a>
                                &nbsp;|&nbsp;
                                <a id='reviewModeButton' class="btn btn-default">复习模式</a>
                                &nbsp;|&nbsp;
                                <a id='videoTimeButton' class="btn btn-default">查看学习进度</a>
                                &nbsp;|&nbsp;
                                <a id='fuckMeModeButton' class="btn btn-default" href="https://scriptcat.org/script-show-page/379" target="view_window">后台挂机</a>
                                &nbsp;
                                <a id='backGround' class="btn btn-default" target="view_window">激活挂机</a>
                            </div>

                            <br>
                            <div style="padding: 0;font-size: 20px;float: left;">章节测试：</div>

                            <a id='autoDoWorkButton' class="btn btn-default">自动答题</a>&nbsp;|&nbsp;
                            <a id='autoSubmitButton' class="btn btn-default">自动提交</a>&nbsp;|&nbsp;
                            <a id='autoSaveButton' class="btn btn-default">自动保存</a><br/><br/>
                            <div style="padding:0;font-size:20px;float:left;">章节测试正确率(百分比): </div>
                            <div>

                <input type="number" id="accuracy" style="width: 80px;">
                &ensp;
                <a id='updateaccuracy' class="btn btn-default" style="color: white;background-color: darkcyan;">保存</a>
                &nbsp;
                在答题正确率在规定之上并且允许自动提交时才会提交答案
            </div>
            <div style="margin-top: 10px;">
                                    <div style="padding: 0;font-size: 20px;float: left;">考试功能：</div>  &nbsp; <a id='Button' class="btn btn-default">打开考试界面后自动显示</a>
                                </div>
        </div>
    </div>
</div>

                            <div class="panel panel-info" id='tikupeizhi' style="width: 100% ;height:100%">
    <div class="panel-heading">题库配置</div>
    <div class="panel-body" style="height: 100%;">
        <p>关注微信公众号：一之哥哥，发送 “token” 领取你的token，可以提高答题并发数量。</p>
        <p>领取到token后，填入输入框中，点击保存即可。还有undefined是没有设定，而不是有效token</p>
        <div style="padding: 0;font-size: 20px;float: left;">题库Token：</div>
        <input type="text" id="token" style="width: 150px;" value="`+GM_getValue("tikutoken")+`">
        <a id='updateToken' class="btn btn-default" >保存</a>
    </div>
                                <div class="panel-body">
                                    <img src="`+base222 + `" alt="love" width="120" height="120">
                                    <p>🔔恭喜你啊年轻人，你被我恭喜到了<p/>
                                    <p>✨你还年轻，你把钱给我，你自己再去赚可以吗？（珠海科技学院的不准白嫖）
                                    <p>如果你觉得这个对你有帮助，欢迎您的打赏。我会非常感激你的慷慨和鼓励(*^▽^*)<p/>
                                    <p>❗❗❗每一次优化都是学长透支身体的结果，熬穿了不知道多少个夜晚，您的赞赏会是刺破黑暗苍穹的亮光照亮我前行的路<p/>
                                    <P>❗注意哦倍速不要改太高，不然会被学习通检测，进度会被清除。<p/>
                                    <p>因为淋过雨，所以想替学弟撑把伞。学长已经把路铺好了。学长都快点不起拼好饭了，打赏一下呗。<p/>
                                    <p>✨✨✨有的学弟很调皮啊，给我的赞赏备注个学长CPDD，哎，说来惭愧，学长现在还没牵过女孩子的手，所以可以赞赏安慰一下学长吗？<p/>
                                    <p>❗❗❗不支持把正确率修改为100%，因为这个是题库，题库很难保证真确率为100%，脚本定义的是正确率达不到用户定义的正确率就不会提交。（注释里面也写的很清楚哈）<p/>
                                    <p>学长也还有学业在身，如果加微信未能及时回复，请多多包涵哈！！学长目前准备优化 1.激活挂机的自动打开（已完成）  2.简介的修改，脚本的使用介绍（持续优化中） 3.刷考试题目（已完成） 【目前的计划】欢迎大家加微信咨询:Why15236444193<p/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-12" style="margin-bottom: 20px;">
                    <div class="panel panel-default">
                        <div class="panel-heading">StudyAI-题库连接失败时可用于手动查题</div>
                        <div class="panel-body">
  <iframe
  src="https://cloud.fastgpt.cn/chat/share?shareId=healvo7h60bo7xdjk06b8ao7"
  style="width: 100%; height: 600px;"
  frameborder="0"
  allow="*"
/></iframe>
                        </div>
                    </div>
                </div>
                <div class="panel panel-info" id='videoTime' style="display: none;height: 300px;">
                    <div class="panel-heading">学习进度</div>
                    <div class="panel-body" style="height: 100%;">
                        <iframe id="videoTimeContent" src="" frameborder="0" scrolling="auto"
                            style="width: 100%;height: 85%;"></iframe>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">任务列表</div>
                    <div class="panel-body" id='joblist'>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">运行日志</div>
                    <div class="panel-body">
                        <div id="result" style="overflow:auto;line-height: 30px;">
                            <div id="log">
                                <span style="color: red">[00:00:00]如果此提示不消失，说明页面出现了错误，请联系作者</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel panel-info" id='workPanel' style="display: none;height: 1000px;">
                    <div class="panel-heading">章节测试</div>
                    <div class="panel-body" id='workWindow' style="height: 100%;">
                        <iframe id="frame_content" name="frame_content" src="" frameborder="0" scrolling="auto"
                            style="width: 100%;height: 95%;"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
        var logs = {
            "logArry": [],
            "addLog": function (str, color = "black") {
                if (this.logArry.length >= 50) {
                    this.logArry.splice(0, 1);
                }
                var nowTime = new Date();
                var nowHour = (Array(2).join(0) + nowTime.getHours()).slice(-2);
                var nowMin = (Array(2).join(0) + nowTime.getMinutes()).slice(-2);
                var nowSec = (Array(2).join(0) + nowTime.getSeconds()).slice(-2);
                this.logArry.push("<span style='color: " + color + "'>[" + nowHour + ":" + nowMin + ":" +
                    nowSec + "] " + str + "</span>");
                let logStr = "";
                for (let logI = 0, logLen = this.logArry.length; logI < logLen; logI++) {
                    logStr += this.logArry[logI] + "<br>";
                }
                _d.getElementById('log').innerHTML = logStr;
                var logElement = _d.getElementById('log');
                logElement.scrollTop = logElement.scrollHeight;
            }
        },
            htmlHook = setInterval(function () {
                if (_d.getElementById('unrivalRate') && _d.getElementById('updateRateButton') && _d
                    .getElementById('reviewModeButton') && _d.getElementById('autoDoWorkButton') && _d
                        .getElementById('autoSubmitButton') && _d.getElementById('autoSaveButton')) {
                    if (!backGround) {
                        _d.getElementById('fuckMeModeButton').style.display = "none";
                    }
                    allowBackground = Math.round(new Date() / 1000) - parseInt(GM_getValue(
                        'unrivalBackgroundVideoEnable',
                        '6')) < 15;
                    if (allowBackground) {
                        _d.getElementById('fuckMeModeButton').setAttribute('href', 'unrivalxxtbackground/');
                    }
                    clearInterval(htmlHook);
                    if (cVersion < 86) {
                        logs.addLog(
                            '\u60a8\u7684\u6d4f\u89c8\u5668\u5185\u6838\u8fc7\u8001\uff0c\u8bf7\u66f4\u65b0\u7248\u672c\u6216\u4f7f\u7528\u4e3b\u6d41\u6d4f\u89c8\u5668\uff0c\u63a8\u8350\u003c\u0061\u0020\u0068\u0072\u0065\u0066\u003d\u0022\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006d\u0069\u0063\u0072\u006f\u0073\u006f\u0066\u0074\u002e\u0063\u006f\u006d\u002f\u007a\u0068\u002d\u0063\u006e\u002f\u0065\u0064\u0067\u0065\u0022\u0020\u0074\u0061\u0072\u0067\u0065\u0074\u003d\u0022\u0076\u0069\u0065\u0077\u005f\u0077\u0069\u006e\u0064\u006f\u0077\u0022\u003e\u0065\u0064\u0067\u0065\u6d4f\u89c8\u5668\u003c\u002f\u0061\u003e',
                            'red');
                        stop = true;
                        return;
                    }
                    if (isMobile) {
                        logs.addLog('手机浏览器不保证能正常运行此脚本', 'orange');
                    }
                    _d.addEventListener('visibilitychange', function () {
                        let isH = _d.hidden;
                        if (!isH) {
                            logs.addLog('挂机功能不稳定，不建议长时间最小化窗口', 'orange');
                        }
                    });
                    _d.getElementById('unrivalRate').value = rate;
                     _d.getElementById('updateToken').onclick = function () {
                         var token = _d.getElementById('token').value;
                           logs.addLog('题库token已更新为' +token, 'green');
                         GM_setValue('tikutoken', token);
                     }
                    _d.getElementById('accuracy').value=accuracy;
                    _d.getElementById('updateaccuracy').onclick = function () {
                        var uaccuracy = _d.getElementById('accuracy').value;
                        if (parseFloat(uaccuracy) == parseInt(uaccuracy)) {
                            uaccuracy = parseInt(uaccuracy);
                        } else {
                            uaccuracy = parseFloat(uaccuracy);
                        }
                        GM_setValue('accuracy', uaccuracy);
                        accuracy = uaccuracy;
                         if (uaccuracy >= 0 && uaccuracy<=100) {
                            logs.addLog('章节测试正确率已更新为'+uaccuracy+'%，将在3秒内生效', 'green');
                        } else {
                            logs.addLog('奇怪正确率', 'orange');
                        }



                    }


                    _d.getElementById('updateRateButton').onclick = function () {
                        let urate = _d.getElementById('unrivalRate').value;
                        if (parseFloat(urate) == parseInt(urate)) {
                            urate = parseInt(urate);
                        } else {
                            urate = parseFloat(urate);
                        }
                        GM_setValue('unrivalrate', urate);
                        rate = urate;
                        if (urate > 0) {
                            logs.addLog('视频倍速已更新为' + urate + '倍，将在3秒内生效', 'green');
                        } else {
                            logs.addLog('奇怪的倍速，将会自动跳过视频任务', 'orange');
                        }
                    }
                    _d.getElementById('backGround').onclick = function () {
    let backGroundButton = _d.getElementById('backGround');
    if (backGroundButton.getAttribute('class') == 'btn btn-default') {
        logs.addLog('挂机激活成功，您现在可以最小化页面了', 'green');
        _w.top.backNow = 1;
        GM_setValue('unrivalbackground', '1'); // 保存激活状态
        backGroundButton.setAttribute('class', 'btn btn-success'); // 设置按钮为绿色
    } else {
        logs.addLog('挂机已取消激活', 'green');
        _w.top.backNow = 0;
        GM_setValue('unrivalbackground', '0'); // 保存取消激活状态
        backGroundButton.setAttribute('class', 'btn btn-default'); // 设置按钮恢复原状
    }
}
                    _d.getElementById('reviewModeButton').onclick = function () {
                        let reviewButton = _d.getElementById('reviewModeButton');
                        if (reviewButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('reviewModeButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('复习模式已开启，遇到已完成的视频任务不会跳过', 'green');
                            GM_setValue('unrivalreview', '1');
                            _w.top.unrivalReviewMode = '1';
                        } else {
                            _d.getElementById('reviewModeButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('复习模式已关闭，遇到已完成的视频任务会自动跳过', 'green');
                            GM_setValue('unrivalreview', '0');
                            _w.top.unrivalReviewMode = '0';
                        }
                    }
                    _d.getElementById('autoDoWorkButton').onclick = function () {
                        let autoDoWorkButton = _d.getElementById('autoDoWorkButton');
                        if (autoDoWorkButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoDoWorkButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('自动做章节测试已开启，将会自动做章节测试', 'green');
                            GM_setValue('unrivaldowork', '1');
                            _w.top.unrivalDoWork = '1';
                        } else {
                            _d.getElementById('autoDoWorkButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('自动做章节测试已关闭，将不会自动做章节测试', 'green');
                            GM_setValue('unrivaldowork', '0');
                            _w.top.unrivalDoWork = '0';
                        }
                    }
                    _d.getElementById('autoSubmitButton').onclick = function () {
                        let autoSubmitButton = _d.getElementById('autoSubmitButton');
                        if (autoSubmitButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoSubmitButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('符合提交标准的章节测试将会自动提交', 'green');
                            GM_setValue('unrivalautosubmit', '1');
                            _w.top.unrivalAutoSubmit = '1';
                        } else {
                            _d.getElementById('autoSubmitButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('章节测试将不会自动提交', 'green');
                            GM_setValue('unrivalautosubmit', '0');
                            _w.top.unrivalAutoSubmit = '0';
                        }
                    }
                    _d.getElementById('autoSaveButton').onclick = function () {
                        let autoSaveButton = _d.getElementById('autoSaveButton');
                        if (autoSaveButton.getAttribute('class') == 'btn btn-default') {
                            _d.getElementById('autoSaveButton').setAttribute('class', 'btn btn-success');
                            logs.addLog('不符合提交标准的章节测试将会自动保存', 'green');
                            GM_setValue('unrivalautosave', '1');
                            _w.top.unrivalAutoSave = '1';
                        } else {
                            _d.getElementById('autoSaveButton').setAttribute('class', 'btn btn-default');
                            logs.addLog('不符合提交标准的章节测试将不会自动保存，等待用户自己操作', 'green');
                            GM_setValue('unrivalautosave', '0');
                            _w.top.unrivalAutoSave = '0';
                        }
                    }
                    _d.getElementById('videoTimeButton').onclick = function () {
                        _d.getElementById('videoTime').style.display = 'block';
                        _d.getElementById('videoTimeContent').src = _p +
                            '//stat2-ans.chaoxing.com/task/s/index?courseid=' + courseId + '&clazzid=' +
                            classId;
                    }
                }
            }, 100),
            loopjob = () => {
                if (_w.top.unrivalScriptList.length > 1) {
                    logs.addLog('您同时开启了多个刷课脚本，建议关闭其他脚本，否则会有挂科风险！', 'red');
                }
                if (cVersion < 8.6 * 10) {
                    logs.addLog(
                        '\u60a8\u7684\u6d4f\u89c8\u5668\u5185\u6838\u8fc7\u8001\uff0c\u8bf7\u66f4\u65b0\u7248\u672c\u6216\u4f7f\u7528\u4e3b\u6d41\u6d4f\u89c8\u5668\uff0c\u63a8\u8350\u003c\u0061\u0020\u0068\u0072\u0065\u0066\u003d\u0022\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006d\u0069\u0063\u0072\u006f\u0073\u006f\u0066\u0074\u002e\u0063\u006f\u006d\u002f\u007a\u0068\u002d\u0063\u006e\u002f\u0065\u0064\u0067\u0065\u0022\u0020\u0074\u0061\u0072\u0067\u0065\u0074\u003d\u0022\u0076\u0069\u0065\u0077\u005f\u0077\u0069\u006e\u0064\u006f\u0077\u0022\u003e\u0065\u0064\u0067\u0065\u6d4f\u89c8\u5668\u003c\u002f\u0061\u003e',
                        'red');
                    stop = true;
                    return;
                }
                if (stop) {
                    return;
                }
                let missionli = missionList;
                if (missionli == []) {
                    setTimeout(loopjob, 500);
                    return;
                }
                for (let itemName in missionli) {
                    if (missionli[itemName]['running']) {
                        setTimeout(loopjob, 500);
                        return;
                    }
                }
                for (let itemName in missionli) {
                    if (!missionli[itemName]['done']) {
                        switch (missionli[itemName]['type']) {
                            case 'video':
                                doVideo(missionli[itemName]);
                                break;
                            case 'document':
                                doDocument(missionli[itemName]);
                                break;
                            case 'work':
                                doWork(missionli[itemName]);
                                break;
                        }
                        setTimeout(loopjob, 500);
                        return;
                    }
                }
                if (busyThread <= 0) {
                    if (jumpType != 2) {
                        _w.top.jump = true;
                        logs.addLog('所有任务处理完毕，5秒后自动下一章', 'green');
                    } else {
                        logs.addLog('所有任务处理完毕，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
                    }
                    clearInterval(loopjob);
                } else {
                    setTimeout(loopjob, 500);
                }
            },
            readyCheck = () => {
                setTimeout(function () {
                    try {
                        if (!isCat) {
                            logs.addLog(
                                '推荐使用<a href="https://docs.scriptcat.org/use/#%E5%AE%89%E8%A3%85%E6%89%A9%E5%B1%95" target="view_window">脚本猫</a>运行此脚本，使用其他脚本管理器不保证能正常运行',
                                'orange');
                        }
                        if (_w.top.unrivalReviewMode == '1') {
                            logs.addLog('复习模式已开启，遇到已完成的视频任务不会跳过', 'green');
                            _d.getElementById('reviewModeButton').setAttribute('class', ['btn btn-default',
                                'btn btn-success'
                            ][_w.top.unrivalReviewMode]);
                        }
                        var backGroundStatus = GM_getValue('unrivalbackground', '0');
if (backGroundStatus === '1') {
    _w.top.backNow = 1;
    _d.getElementById('backGround').setAttribute('class', 'btn btn-success'); // 设置按钮为绿色
}
                        if (_w.top.unrivalDoWork == '1') {
                            logs.addLog('自动做章节测试已开启，将会自动做章节测试', 'green');
                            _d.getElementById('autoDoWorkButton').setAttribute('class', ['btn btn-default',
                                'btn btn-success'
                            ][_w.top.unrivalDoWork]);
                        }
                        if (GM_getValue('unrivalbackground', '0') === '1') {
    logs.addLog('挂机激活成功，您现在可以最小化页面了', 'green');
    _d.getElementById('backGround').setAttribute('class', 'btn btn-success'); // 设置按钮为绿色
}
                        _d.getElementById('autoSubmitButton').setAttribute('class', ['btn btn-default',
                            'btn btn-success'
                        ][_w.top.unrivalAutoSubmit]);
                        _d.getElementById('autoSaveButton').setAttribute('class', ['btn btn-default',
                            'btn btn-success'
                        ][_w.top.unrivalAutoSave]);
                    } catch (e) {
                        console.log(e);
                        readyCheck();
                        return;
                    }
                }, 500);
            }
        readyCheck();
        try {
            var pageData = JSON.parse(param);
        } catch (e) {
            if (jumpType != 2) {
                _w.top.jump = true;
                logs.addLog('此页无任务，5秒后自动下一章', 'green');
            } else {
                logs.addLog('此页无任务，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
            }
            return;
        }
        var data = pageData['defaults'],
            jobList = [],
            classId = data['clazzId'],
            chapterId = data['knowledgeid'],
            reportUrl = data['reportUrl'],
            ktoken = data['ktoken'];
        UID = UID || data['userid'];
        FID = FID || data['fid'];
        for (let i = 0, l = pageData['attachments'].length; i < l; i++) {
            let item = pageData['attachments'][i];
            if (item['job'] != true || item['isPassed'] == true) {
                if (_w.top.unrivalReviewMode == '1' && item['type'] == 'video') {
                    jobList.push(item);
                }
                continue;
            } else {
                jobList.push(item);
            }
        }
        var video_getReady = (item) => {
            let statusUrl = _p + '//' + _h + '/ananas/status/' + item['property']['objectid'] + '?k=' +
                FID + '&flag=normal&_dc=' + String(Math.round(new Date())),
                doubleSpeed = item['property']['doublespeed'];
            busyThread += 1;
            GM_xmlhttpRequest({
                method: "get",
                headers: {
                    'Host': _h,
                    'Referer': vrefer,
                    'Sec-Fetch-Site': 'same-origin'
                },
                url: statusUrl,
                onload: function (res) {
                    try {
                        busyThread -= 1;
                        let videoInfo = JSON.parse(res.responseText),
                            duration = videoInfo['duration'],
                            dtoken = videoInfo['dtoken'];
                        if (duration == undefined) {
                            _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[无效视频]' + item['property']['name'] + `
                                </div>
                            </div>`
                            return;
                        }
                        missionList['m' + item['jobid']] = {
                            'module': item['property']['module'],
                            'type': 'video',
                            'dtoken': dtoken,
                            'duration': duration,
                            'objectId': item['property']['objectid'],
                            'rt': item['property']['rt'] || '0.9',
                            'otherInfo': item['otherInfo'],
                            'doublespeed': doubleSpeed,
                            'jobid': item['jobid'],
                            'name': item['property']['name'],
                            'done': false,
                            'running': false
                        };
                        _d.getElementById('joblist').innerHTML += `

                            <div class="panel panel-default">

                                <div class="panel-body">
                                    ` + '[视频]' + item['property']['name'] + `
                                </div>
                            </div>`
                    } catch (e) { }
                },
                onerror: function (err) {
                    console.log(err);
                    if (err.error.indexOf('@connect list') >= 0) {
                        logs.addLog('请添加安全网址，将 【 //@connect      ' + _h +
                            ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：', 'red');
                        logs.addLog(
                            '<img src="https://pan-yz.chaoxing.com/thumbnail/0,0,0/609a8b79cbd6a91d10c207cf2b5f368d">'
                        );
                        stop = true;
                    } else {
                        logs.addLog('获取任务详情失败', 'red');
                        logs.addLog('错误原因：' + err.error, 'red');
                    }
                }
            });
        },
            doVideo = (item) => {
                if (rate <= 0) {
                    missionList['m' + item['jobid']]['running'] = true;
                    logs.addLog('奇怪的倍速，视频已自动跳过', 'orange');
                    setTimeout(function () {
                        missionList['m' + item['jobid']]['running'] = false;
                        missionList['m' + item['jobid']]['done'] = true;
                    }, 5000);
                    return;
                }
                if (allowBackground && backGround) {
                    if (_w.top.document.getElementsByClassName('catalog_points_sa').length > 0 || _w.top.document
                        .getElementsByClassName('lock').length > 0) {
                        logs.addLog('您已安装超星挂机小助手，但此课程可能为闯关模式，不支持后台挂机，将为您在线完成', 'blue');
                    } else {
                        item['userid'] = UID;
                        item['classId'] = classId;
                        item['review'] = [false, true][_w.top.unrivalReviewMode];
                        item['reportUrl'] = reportUrl;
                        item['rt'] = missionList['m' + item['jobid']]['rt'];
                        GM_setValue('unrivalBackgroundVideo', item);
                        _d.cookie = "videojs_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        logs.addLog(
                            '您已安装超星挂机小助手，已添加至后台任务，<a href="unrivalxxtbackground/" target="view_window">点我查看后台</a>',
                            'green');
                        missionList['m' + item['jobid']]['running'] = true;
                        setTimeout(function () {
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }, 5000);
                        return;
                    }
                }
                let videojs_id = String(parseInt(Math.random() * 9999999));
                _d.cookie = 'videojs_id=' + videojs_id + ';path=/'
                logs.addLog('开始刷视频：' + item['name'] + '，倍速：' + String(rate) + '倍');
                logs.addLog('视频观看信息每60秒上报一次，请耐心等待', 'green');
                logs.addLog('如遇脚本使用异常情况，请检查脚本版本是否为最新版，<a href="https://scriptcat.org/zh-CN/script-show-page/3321" target="view_window">点我(脚本猫)</a>或<a href="https://greasyfork.org/zh-CN/users/1446006-%E4%BC%8F%E9%BB%91%E7%94%9A%E8%80%8C" target="view_window">点我(greasyfork)</a>检查', 'orange');
                if (disableMonitor) {
                    logs.addLog('解除多端学习监控有清除进度风险，请谨慎使用', 'orange');
                }
                let dtype = 'Video';
                if (item['module'].includes('audio')) {
                    dtype = 'Audio';
                    rt = '';
                }
                let playTime = 0,
                    playsTime = 0,
                    isdrag = '3',
                    times = 0,
                    encUrl = '',
                    first = true,
                    loop = setInterval(function () {
                        if (rate <= 0) {
                            clearInterval(loop);
                            logs.addLog('奇怪的倍速，视频已自动跳过', 'orange');
                            setTimeout(function () {
                                missionList['m' + item['jobid']]['running'] = false;
                                missionList['m' + item['jobid']]['done'] = true;
                            }, 5000);
                            return;
                        } else if (item['doublespeed'] == 0 && rate > 1 && _w.top.unrivalReviewMode == '0') {
                            //rate = 1;
                            //logs.addLog('该视频不允许倍速播放，已恢复至一倍速，高倍速会被清空进度挂科，勿存侥幸', 'red');
                        }
                        rt = missionList['m' + item['jobid']]['rt'];
                        playsTime += rate;
                        playTime = Math.ceil(playsTime);
                        if (times == 0 || times % 30 == 0 || playTime >= item['duration']) {
                            if (first) {
                                playTime = 0;
                            }
                            if (playTime >= item['duration']) {
                                clearInterval(loop);
                                playTime = item['duration'];
                                isdrag = '4';
                            } else if (playTime > 0) {
                                isdrag = '0';
                            }
                            encUrl = host + 'chaoXing/v3/getEnc.php?classid=' + classId +
                                '&playtime=' + playTime + '&duration=' + item['duration'] + '&objectid=' + item[
                                'objectId'] + '&jobid=' + item['jobid'] + '&uid=' + UID;
                            busyThread += 1;
                            var _bold_playTime = playTime;
                            function ecOnload(res) {
                                let enc = '';
                                if (res && res.status == 200) {
                                    enc = res.responseText;
                                    if (enc.includes('--#')) {
                                        let warnInfo = enc.match(new RegExp('--#(.*?)--#', "ig"))[0]
                                            .replace(/--#/ig, '');
                                        logs.addLog(warnInfo, 'red');
                                        enc = enc.replace(/--#(.*?)--#/ig, '');
                                    }
                                    if (enc.indexOf('.stop') >= 0) {
                                        clearInterval(loop);
                                        stop = true;
                                        return;
                                    }
                                } else {
                                    strEc = `[${classId}][${UID}][${item['jobid']}][${item['objectId']}][${playTime * 1000}][d_yHJ!$pdA~5][${item['duration'] * 1000}][0_${item['duration']}]`,
                                        enc = jq.md5(strEc);
                                }
                                if (enc.length != 32) {
                                    clearInterval(loop);
                                    stop = true;
                                    return;
                                }
                                let reportsUrl = reportUrl + '/' + item['dtoken'] +
                                    '?clazzId=' + classId + '&playingTime=' + playTime +
                                    '&duration=' + item['duration'] + '&clipTime=0_' + item[
                                    'duration'] + '&objectId=' + item['objectId'] +
                                    '&otherInfo=' + item['otherInfo'] + '&jobid=' + item[
                                    'jobid'] + '&userid=' + UID + '&isdrag=' + isdrag +
                                    '&view=pc&enc=' + enc + '&rt=' + rt + '&dtype=' + dtype +
                                    '&_t=' + String(Math.round(new Date()));
                                GM_xmlhttpRequest({
                                    method: "get",
                                    headers: {
                                        'Host': _h,
                                        'Referer': vrefer,
                                        'Sec-Fetch-Site': 'same-origin',
                                        'Content-Type': 'application/json'
                                    },
                                    url: reportsUrl,
                                    onload: function (res) {
                                        try {
                                            let today = new Date(),
                                                todayStr = today.getFullYear() +
                                                    'd' + today.getMonth() + 'd' + today
                                                        .getDate(),
                                                timelong = GM_getValue(
                                                    'unrivaltimelong', {});
                                            if (timelong[UID] == undefined ||
                                                timelong[UID]['today'] != todayStr
                                            ) {
                                                timelong[UID] = {
                                                    'time': 0,
                                                    'today': todayStr
                                                };
                                            } else {
                                                timelong[UID]['time']++;
                                            }
                                            GM_setValue('unrivaltimelong',
                                                timelong);
                                            busyThread -= 1;
                                            if (timelong[UID]['time'] / 60 > 22 &&
                                                item['doublespeed'] == 0 && _w.top
                                                    .unrivalReviewMode == '0') {
                                                clearInterval(loop);
                                                logs.addLog(
                                                    '今日学习时间过长，继续学习会导致清空进度，请明天再来',
                                                    'red');
                                                setTimeout(function () {
                                                    missionList['m' + item[
                                                        'jobid']][
                                                        'running'
                                                    ] = false;
                                                    missionList['m' + item[
                                                        'jobid']][
                                                        'done'
                                                    ] = true;
                                                }, 5000);
                                                return;
                                            }
                                            let ispass = JSON.parse(res
                                                .responseText);
                                            first = false;
                                            if (ispass['isPassed'] && _w.top
                                                .unrivalReviewMode == '0') {
                                                logs.addLog('视频任务已完成', 'green');
                                                missionList['m' + item['jobid']]['running'] = false;
                                                missionList['m' + item['jobid']]['done'] = true;
                                                clearInterval(loop);
                                                return;
                                            } else if (isdrag == '4') {
                                                if (_w.top.unrivalReviewMode ==
                                                    '1') {
                                                    logs.addLog('视频已观看完毕', 'green');
                                                } else {
                                                    logs.addLog('视频已观看完毕，但视频任务未完成',
                                                        'red');
                                                }
                                                missionList['m' + item['jobid']][
                                                    'running'
                                                ] = false;
                                                missionList['m' + item['jobid']][
                                                    'done'
                                                ] = true;
                                                try {
                                                    clearInterval(loop);
                                                } catch (e) {

                                                }
                                            } else {
                                                logs.addLog(item['name'] + '已观看' +
                                                    _bold_playTime + '秒，剩余大约' +
                                                    String(item['duration'] -
                                                        _bold_playTime) + '秒');
                                            }
                                        } catch (e) {
                                            console.log(e);
                                            if (res.responseText.indexOf('验证码') >=
                                                0) {
                                                logs.addLog('已被超星风控，请<a href="' +
                                                    reportsUrl +
                                                    '" target="_blank">点我处理</a>，60秒后自动刷新页面',
                                                    'red');
                                                missionList['m' + item['jobid']][
                                                    'running'
                                                ] = false;
                                                clearInterval(loop);
                                                stop = true;
                                                setTimeout(function () {
                                                    _l.reload();
                                                }, 60000);
                                                return;
                                            }
                                            logs.addLog('超星返回错误信息，十秒后重试，请重新登录或重新打开浏览器', 'red');
                                            times = -10;
                                            return;
                                        }
                                    },
                                    onerror: function (err) {
                                        console.log(err);
                                        if (err.error.indexOf('@connect list') >=
                                            0) {
                                            logs.addLog(
                                                '请添加安全网址，将 【 //@connect      ' +
                                                _h +
                                                ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：',
                                                'red');
                                            logs.addLog(
                                                '<img src="https://pan-yz.chaoxing.com/thumbnail/0,0,0/609a8b79cbd6a91d10c207cf2b5f368d">'
                                            );
                                            stop = true;
                                        } else {
                                            logs.addLog('观看视频失败', 'red');
                                            logs.addLog('错误原因：' + err.error, 'red');
                                        }
                                        missionList['m' + item['jobid']][
                                            'running'
                                        ] = false;
                                        clearInterval(loop);
                                    }
                                });
                            };
                            GM_xmlhttpRequest({
                                method: "get",
                                url: encUrl,
                                timeout: 2000,
                                onload: ecOnload,
                                onerror: function (err) {
                                    console.log(err);
                                    ecOnload(false);
                                },
                                ontimeout: function (err) {
                                    console.log(err);
                                    ecOnload(false);
                                }
                            });
                        }
                        times += 1;
                    }, 1000);
                missionList['m' + item['jobid']]['running'] = true;
            },
            doDocument = (item) => {
                missionList['m' + item['jobid']]['running'] = true;
                logs.addLog('开始刷文档：' + item['name']);
                setTimeout(function () {
                    busyThread += 1;
                    GM_xmlhttpRequest({
                        method: "get",
                        url: _p + '//' + _h + '/ananas/job/document?jobid=' + item['jobid'] +
                            '&knowledgeid=' + chapterId + '&courseid=' + courseId + '&clazzid=' +
                            classId + '&jtoken=' + item['jtoken'],
                        onload: function (res) {
                            try {
                                busyThread -= 1;
                                let ispass = JSON.parse(res.responseText);
                                if (ispass['status']) {
                                    logs.addLog('文档任务已完成', 'green');
                                } else {
                                    logs.addLog('文档已阅读完成，但任务点未完成', 'red');
                                }

                            } catch (err) {
                                console.log(err);
                                console.log(res.responseText);
                                logs.addLog('解析文档内容失败', 'red');
                            }
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        },
                        onerror: function (err) {
                            console.log(err);
                            if (err.error.indexOf('@connect list') >= 0) {
                                logs.addLog('请添加安全网址，将 【 //@connect      ' + _h +
                                    ' 】方括号里的内容(不包括方括号)添加到脚本代码内指定位置，否则脚本无法正常运行，如图所示：', 'red');
                                logs.addLog(
                                    '<img src="https://pan-yz.chaoxing.com/thumbnail/0,0,0/609a8b79cbd6a91d10c207cf2b5f368d">'
                                );
                                stop = true;
                            } else {
                                logs.addLog('阅读文档失败', 'red');
                                logs.addLog('错误原因：' + err.error, 'red');
                            }
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }
                    });
                }, parseInt(Math.random() * 2000 + 9000, 10))
            },
            doWork = (item) => {
                missionList['m' + item['jobid']]['running'] = true;
                logs.addLog('开始刷章节测试：' + item['name']);
                logs.addLog('您设置的答题正确率为：' + String(accuracy) + '%，只有在高于此正确率时才会提交测试', 'blue');
                _d.getElementById('workPanel').style.display = 'block';
                _d.getElementById('frame_content').src = _p + '//' + _h + '/work/phone/work?workId=' + item['jobid']
                    .replace('work-', '') + '&courseId=' + courseId + '&clazzId=' + classId + '&knowledgeId=' +
                    chapterId + '&jobId=' + item['jobid'] + '&enc=' + item['enc'];
                _w.top.unrivalWorkInfo = '';
                _w.top.unrivalDoneWorkId = '';
                setInterval(function () {
                    if (_w.top.unrivalWorkInfo != '') {
                        logs.addLog(_w.top.unrivalWorkInfo);
                        _w.top.unrivalWorkInfo = '';
                    }
                }, 100);
                let checkcross = setInterval(function () {
                    if (_w.top.unrivalWorkDone == false) {
                        clearInterval(checkcross);
                        return;
                    }
                    let ifW = _d.getElementById('frame_content').contentWindow;
                    try {
                        ifW.location.href;
                    } catch (e) {
                        console.log(e);
                        if (e.message.indexOf('cross-origin') != -1) {
                            clearInterval(checkcross);
                            _w.top.unrivalWorkDone = true;
                            return;
                        }
                    }
                }, 2000);
                let workDoneInterval = setInterval(function () {
                    if (_w.top.unrivalWorkDone) {
                        _w.top.unrivalWorkDone = false;
                        clearInterval(workDoneInterval);
                        _w.top.unrivalDoneWorkId = '';
                        _d.getElementById('workPanel').style.display = 'none';
                        _d.getElementById('frame_content').src = '';
                        setTimeout(function () {
                            missionList['m' + item['jobid']]['running'] = false;
                            missionList['m' + item['jobid']]['done'] = true;
                        }, 5000);
                    }
                }, 500);
            },
            missionList = [];
        if (jobList.length <= 0) {
            if (jumpType != 2) {
                _w.top.jump = true;
                logs.addLog('此页无任务，5秒后自动下一章', 'green');
            } else {
                logs.addLog('此页无任务，用户设置为不跳转，脚本已结束运行，如需自动跳转，请编辑脚本代码参数', 'green');
            }
            return;
        }
        for (let i = 0, l = jobList.length; i < l; i++) {
            let item = jobList[i];
            if (item['type'] == 'video') {
                video_getReady(item);
            } else if (item['type'] == 'document') {
                missionList['m' + item['jobid']] = {
                    'type': 'document',
                    'jtoken': item['jtoken'],
                    'jobid': item['jobid'],
                    'name': item['property']['name'],
                    'done': false,
                    'running': false
                };
                _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[文档]' + item['property']['name'] + `
                                </div>
                            </div>`
            } else if (item['type'] == 'workid' && _w.top.unrivalDoWork == '1') {
                missionList['m' + item['jobid']] = {
                    'type': 'work',
                    'workid': item['property']['workid'],
                    'jobid': item['jobid'],
                    'name': item['property']['title'],
                    'enc': item['enc'],
                    'done': false,
                    'running': false
                };
                _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[章节测试]' + item['property']['title'] + `
                                </div>
                            </div>`
            } else {
                try {
                    let jobName = item['property']['name'];
                    if (jobName == undefined) {
                        jobName = item['property']['title'];
                    }
                    _d.getElementById('joblist').innerHTML += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '已跳过：' + jobName + `
                                </div>
                            </div>`
                } catch (e) { }
            }
        }
        loopjob();
    } else if (_l.href.includes("mycourse/studentstudy")) {
        var audiofile =
            'data:audio/ogg;base64,T2dnUwACAAAAAAAAAABwRPFFAAAAAGFtEqwBHgF2b3JiaXMAAAAAAUAfAAAAAAAAUHgAAAAAAACZAU9nZ1MAAAAAAAAAAAAAcETxRQEAAAA7J4IBDP8F////////////tQN2b3JiaXMvAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAxNDAxMjIgKFR1cnBha8OkcsOkamlpbikGAAAAJQAAAEVOQ09ERVI9U291bmQgU3R1ZGlvLCBsaWJWb3JiaXMgMS4zLjEbAAAAQUxCVU0gQVJUSVNUPUFkdmVudHVyZSBMYW5kFAAAAEFMQlVNPUFkdmVudHVyZSBMYW5kIQAAAEVOQ09ESU5HIEFQUExJQ0FUSU9OPVNvdW5kIFN0dWRpbxUAAABBUlRJU1Q9QWR2ZW50dXJlIExhbmQjAAAAVElUTEU9RW1wdHkgTG9vcCBGb3IgSlMgUGVyZm9ybWFuY2UBBXZvcmJpcxJCQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBADIAAAYhiGH3knMkFOQSSYpVcw5CKH1DjnlFGTSUsaYYoxRzpBTDDEFMYbQKYUQ1E45pQwiCENInWTOIEs96OBi5zgQGrIiAIgCAACMQYwhxpBzDEoGIXKOScggRM45KZ2UTEoorbSWSQktldYi55yUTkompbQWUsuklNZCKwUAAAQ4AAAEWAiFhqwIAKIAABCDkFJIKcSUYk4xh5RSjinHkFLMOcWYcowx6CBUzDHIHIRIKcUYc0455iBkDCrmHIQMMgEAAAEOAAABFkKhISsCgDgBAIMkaZqlaaJoaZooeqaoqqIoqqrleabpmaaqeqKpqqaquq6pqq5seZ5peqaoqp4pqqqpqq5rqqrriqpqy6ar2rbpqrbsyrJuu7Ks256qyrapurJuqq5tu7Js664s27rkearqmabreqbpuqrr2rLqurLtmabriqor26bryrLryratyrKua6bpuqKr2q6purLtyq5tu7Ks+6br6rbqyrquyrLu27au+7KtC7vourauyq6uq7Ks67It67Zs20LJ81TVM03X9UzTdVXXtW3VdW1bM03XNV1XlkXVdWXVlXVddWVb90zTdU1XlWXTVWVZlWXddmVXl0XXtW1Vln1ddWVfl23d92VZ133TdXVblWXbV2VZ92Vd94VZt33dU1VbN11X103X1X1b131htm3fF11X11XZ1oVVlnXf1n1lmHWdMLqurqu27OuqLOu+ruvGMOu6MKy6bfyurQvDq+vGseu+rty+j2rbvvDqtjG8um4cu7Abv+37xrGpqm2brqvrpivrumzrvm/runGMrqvrqiz7uurKvm/ruvDrvi8Mo+vquirLurDasq/Lui4Mu64bw2rbwu7aunDMsi4Mt+8rx68LQ9W2heHVdaOr28ZvC8PSN3a+AACAAQcAgAATykChISsCgDgBAAYhCBVjECrGIIQQUgohpFQxBiFjDkrGHJQQSkkhlNIqxiBkjknIHJMQSmiplNBKKKWlUEpLoZTWUmotptRaDKG0FEpprZTSWmopttRSbBVjEDLnpGSOSSiltFZKaSlzTErGoKQOQiqlpNJKSa1lzknJoKPSOUippNJSSam1UEproZTWSkqxpdJKba3FGkppLaTSWkmptdRSba21WiPGIGSMQcmck1JKSamU0lrmnJQOOiqZg5JKKamVklKsmJPSQSglg4xKSaW1kkoroZTWSkqxhVJaa63VmFJLNZSSWkmpxVBKa621GlMrNYVQUgultBZKaa21VmtqLbZQQmuhpBZLKjG1FmNtrcUYSmmtpBJbKanFFluNrbVYU0s1lpJibK3V2EotOdZaa0ot1tJSjK21mFtMucVYaw0ltBZKaa2U0lpKrcXWWq2hlNZKKrGVklpsrdXYWow1lNJiKSm1kEpsrbVYW2w1ppZibLHVWFKLMcZYc0u11ZRai621WEsrNcYYa2415VIAAMCAAwBAgAlloNCQlQBAFAAAYAxjjEFoFHLMOSmNUs45JyVzDkIIKWXOQQghpc45CKW01DkHoZSUQikppRRbKCWl1losAACgwAEAIMAGTYnFAQoNWQkARAEAIMYoxRiExiClGIPQGKMUYxAqpRhzDkKlFGPOQcgYc85BKRljzkEnJYQQQimlhBBCKKWUAgAAChwAAAJs0JRYHKDQkBUBQBQAAGAMYgwxhiB0UjopEYRMSielkRJaCylllkqKJcbMWomtxNhICa2F1jJrJcbSYkatxFhiKgAA7MABAOzAQig0ZCUAkAcAQBijFGPOOWcQYsw5CCE0CDHmHIQQKsaccw5CCBVjzjkHIYTOOecghBBC55xzEEIIoYMQQgillNJBCCGEUkrpIIQQQimldBBCCKGUUgoAACpwAAAIsFFkc4KRoEJDVgIAeQAAgDFKOSclpUYpxiCkFFujFGMQUmqtYgxCSq3FWDEGIaXWYuwgpNRajLV2EFJqLcZaQ0qtxVhrziGl1mKsNdfUWoy15tx7ai3GWnPOuQAA3AUHALADG0U2JxgJKjRkJQCQBwBAIKQUY4w5h5RijDHnnENKMcaYc84pxhhzzjnnFGOMOeecc4wx55xzzjnGmHPOOeecc84556CDkDnnnHPQQeicc845CCF0zjnnHIQQCgAAKnAAAAiwUWRzgpGgQkNWAgDhAACAMZRSSimllFJKqKOUUkoppZRSAiGllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimVUkoppZRSSimllFJKKaUAIN8KBwD/BxtnWEk6KxwNLjRkJQAQDgAAGMMYhIw5JyWlhjEIpXROSkklNYxBKKVzElJKKYPQWmqlpNJSShmElGILIZWUWgqltFZrKam1lFIoKcUaS0qppdYy5ySkklpLrbaYOQelpNZaaq3FEEJKsbXWUmuxdVJSSa211lptLaSUWmstxtZibCWlllprqcXWWkyptRZbSy3G1mJLrcXYYosxxhoLAOBucACASLBxhpWks8LR4EJDVgIAIQEABDJKOeecgxBCCCFSijHnoIMQQgghREox5pyDEEIIIYSMMecghBBCCKGUkDHmHIQQQgghhFI65yCEUEoJpZRSSucchBBCCKWUUkoJIYQQQiillFJKKSGEEEoppZRSSiklhBBCKKWUUkoppYQQQiillFJKKaWUEEIopZRSSimllBJC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',
            audioPlayer = new Audio(audiofile);
        _w.top.backNow = 0;
        audioPlayer.loop = true;
        _w.audioPlayer = audioPlayer;
        setInterval(function () {
            try {
                _w.jQuery.fn.viewer.Constructor.prototype.show = () => { };
            } catch (e) {
            }
        }, 1000);
        try {
            _w.unrivalScriptList.push('Fuck me please');
        } catch (e) {
            _w.unrivalScriptList = ['Fuck me please'];
        }
        function checkOffline() {
            let dleft = _d.getElementsByClassName('left');
            if (dleft.length == 1) {
                let img = dleft[0].getElementsByTagName('img');
                if (img.length == 1) {
                    if (img[0].src.indexOf('loading.gif') != -1) {
                        return true;
                    }
                }
            }
            return false;
        }
        setInterval(function () {
            if (checkOffline()) {
                setTimeout(function () {
                    if (checkOffline()) {
                        _l.reload();
                    }
                }, 10000)
            }
        }, 3000);
        _d.addEventListener('visibilitychange', function () {
            var c = 0;
            if (_w.top.backNow == 0) {
                _d.title = '⚠️请先激活挂机';
                return
            } else {
                _d.title = '学生学习页面';
            }
            if (_d.hidden) {
                audioPlayer.play();
                var timer = setInterval(function () {
                    if (c) {
                        _d.title = '挂机中';
                        c = 0;
                    } else {
                        _d.title = '挂机中';
                        c = 1;
                    }
                    if (!_d.hidden) {
                        clearInterval(timer);
                        _d.title = '学生学习页面';
                    }
                }, 1300);
            } else {
                audioPlayer.pause();
            }
        });
        _w.unrivalgetTeacherAjax = _w.getTeacherAjax;
        _w.getTeacherAjax = (courseid, classid, cid) => {
            if (cid == getQueryVariable('chapterId')) {
                return;
            }
            _w.top.unrivalPageRd = '';
            _w.unrivalgetTeacherAjax(courseid, classid, cid);
        }
        if (disableMonitor == 1) {
            _w.appendChild = _w.Element.prototype.appendChild;
            _w.Element.prototype.appendChild = function () {
                try {
                    if (arguments[0].src.indexOf('detect.chaoxing.com') > 0) {
                        return;
                    }
                } catch (e) { }
                _w.appendChild.apply(this, arguments);
            };
        }

        _w.jump = false;
        setInterval(function () {
            if (getQueryVariable('mooc2') == '1') {
                let tabs = _d.getElementsByClassName('posCatalog_select');
                for (let i = 0, l = tabs.length; i < l; i++) {
                    let tabId = tabs[i].getAttribute('id');
                    if (tabId.indexOf('cur') >= 0 && tabs[i].getAttribute('class') == 'posCatalog_select') {
                        tabs[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + tabId.replace('cur', '') + "');");
                    }
                }
            } else {
                let h4s = _d.getElementsByTagName('h4'),
                    h5s = _d.getElementsByTagName('h5');
                for (let i = 0, l = h4s.length; i < l; i++) {
                    if (h4s[i].getAttribute('id').indexOf('cur') >= 0) {
                        h4s[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + h4s[i].getAttribute('id').replace('cur', '') + "');");
                    }
                }
                for (let i = 0, l = h5s.length; i < l; i++) {
                    if (h5s[i].getAttribute('id').indexOf('cur') >= 0) {
                        h5s[i].setAttribute('onclick', "getTeacherAjax('" + courseId + "','" + classId +
                            "','" + h5s[i].getAttribute('id').replace('cur', '') + "');");
                    }
                }
            }
        }, 1000);
        setInterval(function () {
            let but = null;
            if (_w.jump) {
                _w.jump = false;
                _w.top.unrivalDoneWorkId = '';
                _w.jjump = (rd) => {
                    if (rd != _w.top.unrivalPageRd) {
                        return;
                    }
                    try {
                        setTimeout(function () {
                            if (jumpType == 1) {
                                if (getQueryVariable('mooc2') == '1') {
                                    but = _d.getElementsByClassName(
                                        'jb_btn jb_btn_92 fs14 prev_next next');
                                } else {
                                    but = _d.getElementsByClassName('orientationright');
                                }
                                try {
                                    setTimeout(function () {
                                        if (rd != _w.top.unrivalPageRd) {
                                            return;
                                        }
                                        but[0].click();
                                    }, 2000);
                                } catch (e) { }
                                return;
                            }
                            if (getQueryVariable('mooc2') == '1') {
                                let ul = _d.getElementsByClassName('prev_ul')[0],
                                    lis = ul.getElementsByTagName('li');
                                for (let i = 0, l = lis.length; i < l; i++) {
                                    if (lis[i].getAttribute('class') == 'active') {
                                        if (i + 1 >= l) {
                                            break;
                                        } else {
                                            try {
                                                lis[i + 1].click();
                                            } catch (e) { }
                                            return;
                                        }
                                    }
                                }
                                let tabs = _d.getElementsByClassName('posCatalog_select');
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].getAttribute('class') ==
                                        'posCatalog_select posCatalog_active') {
                                        while (i + 1 < tabs.length) {
                                            let nextTab = tabs[i + 1];
                                            if ((nextTab.innerHTML.includes(
                                                'icon_Completed prevTips') && _w.top
                                                    .unrivalReviewMode == '0') || nextTab
                                                        .innerHTML.includes(
                                                            'catalog_points_er prevTips')) {
                                                i++;
                                                continue;
                                            }
                                            if (nextTab.id.indexOf('cur') < 0) {
                                                i++;
                                                continue;
                                            }
                                            let clickF = setInterval(function () {
                                                if (rd != _w.top.unrivalPageRd) {
                                                    clearInterval(clickF);
                                                    return;
                                                }
                                                nextTab.click();
                                            }, 2000);
                                            break;
                                        }
                                        break;
                                    }
                                }
                            } else {
                                let div = _d.getElementsByClassName('tabtags')[0],
                                    spans = div.getElementsByTagName('span');
                                for (let i = 0, l = spans.length; i < l; i++) {
                                    if (spans[i].getAttribute('class').indexOf('currents') >=
                                        0) {
                                        if (i + 1 == l) {
                                            break;
                                        } else {
                                            try {
                                                spans[i + 1].click();
                                            } catch (e) { }
                                            return;
                                        }
                                    }
                                }
                                let tabs = _d.getElementsByTagName('span'),
                                    newTabs = [];
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].getAttribute('style') != null && tabs[i]
                                        .getAttribute('style').indexOf(
                                            'cursor:pointer;height:18px;') >= 0) {
                                        newTabs.push(tabs[i]);
                                    }
                                }
                                tabs = newTabs;
                                for (let i = 0, l = tabs.length; i < l; i++) {
                                    if (tabs[i].parentNode.getAttribute('class') ==
                                        'currents') {
                                        while (i + 1 < tabs.length) {
                                            let nextTab = tabs[i + 1].parentNode;
                                            if ((nextTab.innerHTML.includes(
                                                'roundpoint  blue') && _w.top
                                                    .unrivalReviewMode == '0') || nextTab
                                                        .innerHTML.includes('roundpointStudent  lock')
                                            ) {
                                                i++;
                                                continue;
                                            }
                                            if (nextTab.id.indexOf('cur') < 0) {
                                                i++;
                                                continue;
                                            }
                                            let clickF = setInterval(function () {
                                                if (rd != _w.top.unrivalPageRd) {
                                                    clearInterval(clickF);
                                                    return;
                                                }
                                                nextTab.click();
                                            }, 2000);
                                            break;
                                        }
                                        break;
                                    }
                                }
                            }
                        }, 2000);
                    } catch (e) { }
                }
                _w.onReadComplete1();
                setTimeout('jjump("' + _w.top.unrivalPageRd + '")', 2856);
            }
        }, 200);
    } else if (_l.href.indexOf("work/phone/doHomeWork") > 0) {
        var wIdE = _d.getElementById('workLibraryId') || _d.getElementById('oldWorkId'),
            wid = wIdE.value;
        _w.top.unrivalWorkDone = false;
        _w.aalert = _w.alert;
        _w.alert = (msg) => {
            if (msg == '保存成功') {
                _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                return;
            }
            aalert(msg);
        }
        if (_w.top.unrivalDoneWorkId == getQueryVariable('workId')) {
            _w.top.unrivalWorkDone = true;
            return;
        }
        _w.confirm = (msg) => {
            return true;
        }
        var questionList = [],
            questionsElement = _d.getElementsByClassName('Py-mian1'),
            questionNum = questionsElement.length,
            totalQuestionNum = questionNum;
        for (let i = 0; i < questionNum; i++) {
            let questionElement = questionsElement[i],
                idElements = questionElement.getElementsByTagName('input'),
                questionId = '0',
                question = questionElement.getElementsByClassName('Py-m1-title fs16')[0].innerHTML;
            question = handleImgs(question).replace(/(<([^>]+)>)/ig, '').replace(/[0-9]{1,3}.\[(.*?)\]/ig, '').replaceAll('\n',
                '').replace(/^\s+/ig, '').replace(/\s+$/ig, '');
            for (let z = 0, k = idElements.length; z < k; z++) {
                try {
                    if (idElements[z].getAttribute('name').indexOf('answer') >= 0) {
                        questionId = idElements[z].getAttribute('name').replace('type', '');
                        break;
                    }
                } catch (e) {
                    console.log(e);
                    continue;
                }
            }
            if (questionId == '0' || question == '') {
                continue;
            }
            typeE = questionElement.getElementsByTagName('input');
            if (typeE == null || typeE == []) {
                continue;
            }
            let typeN = 'fuckme';
            for (let g = 0, h = typeE.length; g < h; g++) {
                if (typeE[g].id == 'answertype' + questionId.replace('answer', '').replace('check', '')) {
                    typeN = typeE[g].value;
                    break;
                }
            }
            if (['0', '1', '3'].indexOf(typeN) < 0) {
                continue;
            }
            type = {
                '0': '单选题',
                '1': '多选题',
                '3': '判断题'
            }[typeN];
            let optionList = {
                length: 0
            };
            if (['单选题', '多选题'].indexOf(type) >= 0) {
                let answersElements = questionElement.getElementsByClassName('answerList')[0].getElementsByTagName(
                    'li');
                for (let x = 0, j = answersElements.length; x < j; x++) {
                    let optionE = answersElements[x],
                        optionTextE = trim(optionE.innerHTML.replace(/(^\s*)|(\s*$)/g, "")),
                        optionText = optionTextE.slice(1).replace(/(^\s*)|(\s*$)/g, ""),
                        optionValue = optionTextE.slice(0, 1),
                        optionId = optionE.getAttribute('id-param');
                    if (optionText == '') {
                        break;
                    }
                    optionList[optionText] = {
                        'id': optionId,
                        'value': optionValue
                    }
                    optionList.length++;
                }
                if (answersElements.length != optionList.length) {
                    continue;
                }
            }
            questionList.push({
                'question': question,
                'type': type,
                'questionid': questionId,
                'options': optionList
            });
        }
        var qu = null,
            nowTime = -4000,
            busyThread = questionList.length,
            ctOnload = function (res, quu) {
                busyThread -= 1;
                var ctResult = {
                    'code': -1,
                    'finalUrl': '',
                    'data': '未找到答案，建议使用AI作答(https://studyai0.com/'
                };
                if (res) {
                    try {
                        var responseText = res.responseText,
                            ctResult = JSON.parse(responseText);
                    } catch (e) {
                        console.log(e);
                        if (res.finalUrl.includes('getAnswer.php')) {
                            _w.top.unrivalWorkInfo = '查题错误，服务器连接失败（使用高峰期），等待一段时间';
                            return;
                        }
                    }
                }
                try {
                    let choiceEs = _d.getElementsByTagName('li');
                    if (ctResult['code'] == -1 ) {
                        try {
                            if (ctResult['msg'] !== undefined) {
                                _w.top.unrivalWorkInfo = ctResult['msg'] ;
                            }
                        } catch (e) { }
                        busyThread += 1;
                        GM_xmlhttpRequest({
                            method: "GET",
                            headers: {
                                'Authorization': token,
                            },
                            timeout: 6000,
                            url: host + 'chaoXing/v3/getAnswer.php?tm=' + encodeURIComponent(quu['question']
                                .replace(/(^\s*)|(\s*$)/g, '')) + '&type=' + {
                                    '单选题': '0',
                                    '多选题': '1',
                                    '判断题': '3'
                                }[quu['type']] + '&wid=' + wid + '&courseid=' + courseId,
                            onload: function (res) {
                                ctOnload(res, quu);
                            },
                            onerror: function (err) {
                                _w.top.unrivalWorkInfo = '查题错误，服务器连接失败（使用高峰期），等待一段时间';
                                console.log(err);
                                busyThread -= 1;
                            },
                            ontimeout: function (err) {
                                _w.top.unrivalWorkInfo = '查题错误，服务器连接失败（使用高峰期），等待一段时间';
                                console.log(err);
                                busyThread -= 1;
                            }
                        });
                        return;
                    }
                    try {
                        var result = ctResult['data'];
                    } catch (e) {
                        _w.top.unrivalWorkInfo = '答案解析失败';
                        return;
                    }
                    _w.top.unrivalWorkInfo = '题目：' + quu['question'] + '：' + result;
                    switch (quu['type']) {
                        case '判断题':
                            (function () {
                                let answer = 'abaabaaba';
                                if ('正确是对√Tri'.indexOf(result) >= 0) {
                                    answer = 'true';
                                } else if ('错误否错×Fwr'.indexOf(result) >= 0) {
                                    answer = 'false';
                                }
                                for (let u = 0, k = choiceEs.length; u < k; u++) {
                                    if (choiceEs[u].getAttribute('val-param') ==
                                        answer && choiceEs[u].getAttribute(
                                            'id-param') == quu['questionid'].replace(
                                                'answer', '')) {
                                        choiceEs[u].click();
                                        questionNum -= 1;
                                        return;
                                    }
                                }
                                if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动选【错】';
                                    for (let u = 0, k = choiceEs.length; u <
                                        k; u++) {
                                        if (choiceEs[u].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[u].getAttribute('val-param') ==
                                            'false' && choiceEs[u].getAttribute(
                                                'id-param') == quu['questionid']
                                                    .replace('answer', '')) {
                                            choiceEs[u].click();
                                            return;
                                        }
                                    }
                                }
                            })();
                            break;
                        case '单选题':
                            (function () {
                                let answerData = result;
                                for (let option in quu['options']) {
                                    if (trim(option).replace(/\s/ig, '') == trim(answerData).replace(/\s/ig, '') || trim(
                                        option).replace(/\s/ig, '').includes(trim(answerData).replace(/\s/ig, '')) ||
                                        trim(answerData).replace(/\s/ig, '').includes(trim(option).replace(/\s/ig, ''))) {
                                        for (let y = 0, j = choiceEs.length; y <
                                            j; y++) {
                                            if (choiceEs[y].getElementsByTagName(
                                                'em').length < 1) {
                                                continue;
                                            }
                                            if (choiceEs[y].getElementsByTagName(
                                                'em')[0].getAttribute(
                                                    'id-param') == quu['options'][
                                                    option
                                                    ]['value'] && choiceEs[y]
                                                        .getAttribute('id-param') == quu[
                                                            'questionid'].replace('answer',
                                                                '')) {
                                                if (!choiceEs[y].getAttribute(
                                                    'class').includes('cur')) {
                                                    choiceEs[y].click();
                                                }
                                                questionNum -= 1;
                                                return;
                                            }
                                        }
                                    }
                                }
                                if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动选【B】';
                                    for (let y = 0, j = choiceEs.length; y <
                                        j; y++) {
                                        if (choiceEs[y].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[y].getElementsByTagName('em')[
                                            0].getAttribute('id-param') ==
                                            'B' && choiceEs[y].getAttribute(
                                                'id-param') == quu['questionid']
                                                    .replace('answer', '')) {
                                            if (!choiceEs[y].getAttribute('class')
                                                .includes('cur')) {
                                                choiceEs[y].click();
                                            }
                                            return;
                                        }
                                    }
                                }
                            })();
                            break;
                        case '多选题':
                            (function () {
                                let answerData = trim(result).replace(/\s/ig, ''),
                                    hasAnswer = false;
                                for (let option in quu['options']) {
                                    if (answerData.includes(trim(option).replace(/\s/ig, ''))) {
                                        for (let y = 0, j = choiceEs.length; y <
                                            j; y++) {
                                            if (choiceEs[y].getElementsByTagName(
                                                'em').length < 1) {
                                                continue;
                                            }
                                            if (choiceEs[y].getElementsByTagName(
                                                'em')[0].getAttribute(
                                                    'id-param') == quu['options'][
                                                    option
                                                    ]['value'] && choiceEs[y]
                                                        .getAttribute('id-param') == quu[
                                                            'questionid'].replace('answer',
                                                                '')) {
                                                if (!choiceEs[y].getAttribute(
                                                    'class').includes('cur')) {
                                                    choiceEs[y].click();
                                                }
                                                hasAnswer = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (hasAnswer) {
                                    questionNum -= 1;
                                } else if (randomDo == 1 && accuracy < 100) {
                                    _w.top.unrivalWorkInfo = quu['question'] +
                                        '：未找到正确答案，自动全选';
                                    for (let y = 0, j = choiceEs.length; y <
                                        j; y++) {
                                        if (choiceEs[y].getElementsByTagName('em')
                                            .length < 1) {
                                            continue;
                                        }
                                        if (choiceEs[y].getAttribute('id-param') ==
                                            quu['questionid'].replace('answer', '')
                                        ) {
                                            if (!choiceEs[y].getAttribute('class')
                                                .includes('cur')) {
                                                choiceEs[y].click();
                                            }
                                        }
                                    }
                                }
                            })();
                            break;
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        for (let i = 0, l = questionList.length; i < l; i++) {
            nowTime += parseInt(Math.random() * 2000 + 2500, 10);
            setTimeout(function () {
                qu = questionList[i];
                let param = 'question=' + encodeURIComponent(
                    qu['question']);
                if (ctUrl.includes('icodef')) {
                    param += '&type=' + {
                        '单选题': '0',
                        '多选题': '1',
                        '判断题': '3'
                    }[qu['type']] + '&id=' + wid;
                }
                GM_xmlhttpRequest({
                    method: "POST",
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Authorization': token,
                    },
                    url: ctUrl,
                    timeout: 2000,
                    data: param,
                    onload: function (res) {
                        ctOnload(res, qu);
                    },
                    onerror: function () {
                        ctOnload(false, qu);
                    },
                    ontimeout: function () {
                        ctOnload(false, qu);
                    }
                });
            }, nowTime);
        }
        var workInterval = setInterval(function () {
            if (busyThread != 0) {
                return;
            }
            clearInterval(workInterval);
            if (Math.floor((totalQuestionNum - questionNum) / totalQuestionNum) * 100 >= accuracy && _w.top
                .unrivalAutoSubmit == '1') {
                _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                _w.top.unrivalWorkInfo = '正确率符合标准，已提交答案';
                setTimeout(function () {
                    submitCheckTimes();
                    escapeBlank()
                    submitAction()
                    //	setTimeout(function() {
                    //          document.querySelector(".cx_alert-blue").click()
                    //	}, parseInt(1000));
                }, parseInt(Math.random() * 2000 + 3000, 10));

            } else if (_w.top.unrivalAutoSave == 1) {
                _w.top.unrivalWorkInfo = '正确率不符合标准或未设置自动提交，已自动保存答案';
                if (Math.floor((totalQuestionNum - questionNum) / totalQuestionNum) >= 0) {
                    setTimeout(function () {
                        _w.top.unrivalDoneWorkId = getQueryVariable('workId');
                        _w.noSubmit();
                    }, 2000);
                }
            } else {
                _w.top.unrivalWorkInfo = '用户设置为不自动保存答案，请手动提交或保存作业';
            }
        }, 1000);
    } else if (_l.href.includes('work/phone/selectWorkQuestionYiPiYue')) {
        _w.top.unrivalWorkDone = true;
        _w.top.unrivalDoneWorkId = getQueryVariable('workId');
    } else if (_l.href.includes('stat2-ans.chaoxing.com/task/s/index')) {
        if (_w.top == _w) {
            return;
        }
        _d.getElementsByClassName('page-container studentStatistic')[0].setAttribute('class', 'studentStatistic');
        _d.getElementsByClassName('page-item item-task-list minHeight390')[0].remove();
        _d.getElementsByClassName('subNav clearfix')[0].remove();
        setInterval(function () {
            _l.reload();
        }, 90000);
    } else if (_l.href.includes('passport2.') && _l.href.includes('login?refer=http') && autoLogin == 1) {
        if (!(/^1[3456789]\d{9}$/.test(phoneNumber))) {
            alert('自动登录的手机号填写错误，无法登陆')
            return;
        }
        if (password == '') {
            alert('未填写登录密码，无法登陆')
            return;
        }
        GM_xmlhttpRequest({
            method: "get",
            url: 'https://passport2-api.chaoxing.com/v11/loginregister?cx_xxt_passport=json&uname=' +
                phoneNumber + '&code=' + encodeURIComponent(password),
            onload: function (res) {
                try {
                    let ispass = JSON.parse(res.responseText);
                    if (ispass['status']) {
                        _l.href = decodeURIComponent(getQueryVariable('refer'));
                    } else {
                        alert(ispass['mes']);
                    }
                } catch (err) {
                    console.log(res.responseText);
                    alert('登陆失败');
                }
            },
            onerror: function (err) {
                alert('登陆错误');
            }
        });
    } else if (_l.href.includes('unrivalxxtbackground')) {
        _d.getElementsByTagName("html")[0].innerHTML = `
    <!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>学习通挂机小助手</title>
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
        <link href="https://z.chaoxing.com/yanshi/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="row" style="margin: 10px;">
            <div class="col-md-6 col-md-offset-3">
                <div class="header clearfix">
                    <h3 class="text-muted" style="margin-top: 20px;margin-bottom: 0;float: left;">学习通挂机小助手&ensp;</h3>
                </div>
                <hr style="margin-top: 10px;margin-bottom: 20px;">
                <div class="panel panel-info">
                    <div class="panel-heading">任务列表</div>
                    <div class="panel-body" id='joblist'>
                    </div>
                </div>
                <div class="panel panel-info">
                    <div class="panel-heading">运行日志</div>
                    <div class="panel-body">
                        <div id="result" style="overflow:auto;line-height: 30px;">
                            <div id="log">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
    `;
        var logs = {
            "logArry": [],
            "addLog": function (str, color = "black") {
                if (this.logArry.length >= 50) {
                    this.logArry.splice(0, 1);
                }
                var nowTime = new Date(),
                    nowHour = (Array(2).join(0) + nowTime.getHours()).slice(-2),
                    nowMin = (Array(2).join(0) + nowTime.getMinutes()).slice(-2),
                    nowSec = (Array(2).join(0) + nowTime.getSeconds()).slice(-2),
                    logElement = _d.getElementById('log'),
                    logStr = "";
                this.logArry.push("<span style='color: " + color + "'>[" + nowHour + ":" + nowMin + ":" +
                    nowSec + "] " + str + "</span>");
                for (let logI = 0, logLen = this.logArry.length; logI < logLen; logI++) {
                    logStr += this.logArry[logI] + "<br>";
                }
                _d.getElementById('log').innerHTML = logStr;
                logElement.scrollTop = logElement.scrollHeight;
            }
        };
        logs.addLog('此页面不必保持在最前端，后台会自动进行任务', 'green');
        setInterval(function () {
            logs.addLog('此页面不必保持在最前端，后台会自动进行任务', 'green');
            logs.addLog('如想禁用后台刷视频功能，请关闭脚本并重启浏览器', 'blue');
        }, 120000)
        GM_addValueChangeListener('unrivalxxtbackgroundinfo', function (name, old_value, new_value, remote) {
            if (old_value != new_value) {
                logs.addLog(new_value);
            }
        });
        setInterval(function () {
            if (Math.round(new Date() / 1000) - parseInt(GM_getValue('unrivalBackgroundVideoEnable', '6')) >
                15) {
                logs.addLog('超星挂机小助手可能运行异常，如页面无反应，请尝试重启脚本或重启浏览器(脚本版本有此问题)');
            }
        }, 10000);
        var loopShow = () => {
            let jobList = GM_getValue('unrivalBackgroundList', '1');
            if (jobList == '1') {
                _d.getElementById('joblist').innerHTML = '请将“超星挂机小助手”升级到最新版并重启浏览器';
            } else {
                try {
                    let jobHtml = '';
                    for (let i = 0, l = jobList.length; i < l; i++) {
                        let status = '';
                        if (jobList[i]['done']) {
                            status = '已完成';
                        } else if (parseInt(jobList[i]['playTime']) > 0) {
                            status = '进行中';
                        } else {
                            status = '等待中';
                        }
                        if (jobList[i]['review']) {
                            status += '：复习模式';
                        }
                        jobHtml += `
                            <div class="panel panel-default">
                                <div class="panel-body">
                                    ` + '[' + status + ']' + jobList[i]['name'] + `
                                </div>
                            </div>`
                    }
                    _d.getElementById('joblist').innerHTML = jobHtml;
                } catch (e) {
                    _d.getElementById('joblist').innerHTML = '请将“超星挂机小助手”升级到最新版并重启浏览器！';
                }
            }
        }
        loopShow();
        setInterval(loopShow, 10000);
    }
})();
