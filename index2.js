/*
 * @since: 2020-07-18 14:55:09
 * @lastTime: 2020-07-18 15:56:54
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
    baseUrl: "https://mp.weixin.qq.com/s/dmDSWxvZoU4iytcppH8cyA"

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
                    //   var asArr=Array.from(as)
                    let linkArr = []
                    //获取linkArr
                    for (const key in as) {
                        if (as.hasOwnProperty(key)) {
                            const element = as[key];
                            let href = $(element).attr('href')
                            let title = $(element).children("span").text()
                            let reg = /http/

                            if (reg.test(href)) {
                                linkArr.push({ href, title })
                            }
                        }
                    }
                    resolve(linkArr)
                }
            })
        })
    }
    getSongUrl(bookUrl) {
        return new Promise(function (resolve, reject) {
            request(bookUrl, function (err, res, body) {

                if (!err && res.statusCode == 200) {
                    let $ = cheerio.load(body)
                    var fileId = $('.js_editor_audio').attr('voice_encode_fileid');
                    var back = " https://res.wx.qq.com/voice/getvoice?mediaid="
                    if (fileId) {
                        back += fileId
                        resolve(back)
                    } else {
                        reject("出错了")
                    }

                }
            })
        })
    }
    downloadSong(song) {


        request(song.href)
            .pipe(fs.createWriteStream(path.join(__dirname, "media", song.title + ".mp3")))
            .on("error", function (err) {
                console.log(`${song.title}下载失败`);
            })
            .on("close", () => {
                console.log(`${song.title}下载成功`);

            })
    }

    async start() {
        this.checkImgPath("media");

        let linkArr = await this.getSongList(opts.baseUrl)
        // console.log("Crawler -> start -> linkArr", linkArr)

        linkArr.forEach((page) => {
            // console.log("Crawler -> start -> page", page)
            this.getSongUrl(page.href).then( (url)=> {
                let obj={
                    title:page.title,
                    href:url
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