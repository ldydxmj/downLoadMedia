/*
 * @since: 2020-07-18 14:55:09
 * @lastTime: 2020-07-18 16:18:02
 * @message: 
 */
"use strict"
const fs = require("fs");
const path = require("path");
// const async = require("async");
const request = require("request");
const colors = require("colors");
const cheerio = require("cheerio");

const opts = {
    baseUrl: "https://mp.weixin.qq.com/s/dmDSWxvZoU4iytcppH8cyA",
    medaiBaseUrl: "https://res.wx.qq.com/voice/getvoice?mediaid="
}

class Crawler {
    constructor() {

    }
    checkImgPath(p) {
        try {
            fs.accessSync(path.join(__dirname, p), fs.F_OK);
        } catch (e) {
            fs.mkdirSync(path.join(__dirname, p))
        }
    }

    getSongList(url) {
        const self = this;
        return new Promise(function (resolve, reject) {
            request(url, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    let $ = cheerio.load(body)
                    var as = $('a')
                    let pageArr = []
                    //获取pageArr
                    for (const key in as) {
                        if (as.hasOwnProperty(key)) {
                            const element = as[key];
                            let url = $(element).attr('href')
                            let title = $(element).children("span").text()
                            let reg = /http/

                            if (reg.test(url)) {
                                pageArr.push({ url, title })
                            }
                        }
                    }
                    resolve(pageArr)
                }
            })
        })
    }
    getSongUrl(page) {
        return new Promise(function (resolve, reject) {
            request(page.url, function (err, res, body) {

                if (!err && res.statusCode == 200) {
                    let $ = cheerio.load(body)
                    var fileId = $('.js_editor_audio').attr('voice_encode_fileid');
                    var back = opts.medaiBaseUrl
                    if (fileId) {
                        back += fileId
                        resolve(back)
                    } else {
                        reject(`${page.title}出错了`)
                    }

                }
            })
        })
    }
    downloadSong(media) {
        request(media.url)
            .pipe(fs.createWriteStream(path.join(__dirname, "media", media.title + ".mp3")))
            .on("error", function (err) {
                console.log(`${media.title}下载失败`);
            })
            .on("close", () => {
                console.log(`${media.title}下载成功`);

            })
    }

    async start() {
        this.checkImgPath("media");

        let pageArr = await this.getSongList(opts.baseUrl)

        pageArr.forEach((page) => {

            this.getSongUrl(page).then((url) => {
                let obj = {
                    title: page.title,
                    url
                }
                this.downloadSong(obj)

            }, function (e) {
                console.log(e)

            })
        })
    }

}

const crawler = new Crawler();
crawler.start();