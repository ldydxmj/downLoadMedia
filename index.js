/*
 * @since: 2020-07-18 14:55:09
 * @lastTime: 2020-07-20 15:26:34
 * @message: 
 */
"use strict"
const fs = require("fs");
const path = require("path");
const request = require("request");
const colors = require("colors");
const cheerio = require("cheerio");


var inputData = fs.readFileSync('input.txt');
console.log("inputData", inputData.toString())
const opts = {
    baseUrl: inputData.toString(),
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

    getPageList(url) {
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
        }).catch((e)=>{
            console.log( e)
                
            })
    }
    getMediaUrl(page) {
        return new Promise(function (resolve, reject) {
            request(page.url, function (err, res, body) {

                if (!err && res.statusCode == 200) {
                    let $ = cheerio.load(body)
                    var fileId = $('.js_editor_audio').attr('voice_encode_fileid');
                    // console.log("Crawler -> getMediaUrl -> fileId", fileId)
                    var back = opts.medaiBaseUrl
                    if (fileId) {
                        back += fileId
                        resolve(back)
                    } else {
                        reject(`${page.title}出错了`.red)
                    }

                }
            })
        }).catch((e)=>{
        console.log( e)
            
        })
    }
    downloadMedia(media) {
        let date=new Date()

        request(media.url)
            .pipe(fs.createWriteStream(path.join(__dirname, `media`, media.title + ".mp3")))
            .on("error", function (err) {
                console.log(`${media.title}下载失败`.red);
            })
            .on("close", () => {
                console.log(`${media.title}下载成功`.green);

            })
    }

    async start() {
        this.checkImgPath("media");

        let pageArr = await this.getPageList(opts.baseUrl)

        for (let index = 0; index < pageArr.length; index++) {
            const page = pageArr[index];
            let url = await this.getMediaUrl(page)
            if(url){
                let obj = {
                    title: page.title,
                    url
                }
                this.downloadMedia(obj)
            }
           

        }

    }

}

const crawler = new Crawler();
crawler.start();

