/*
 * @since: 2020-07-15 11:40:59
 * @lastTime: 2020-07-18 14:54:10
 * @message: 
 */


var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')
var movies = []
var requstMovie = function (url) {



    request('https://mp.weixin.qq.com/s/dmDSWxvZoU4iytcppH8cyA', function (error, response, body) {
        //res.statusCode 为200则表示链接成功
        if (error === null && response.statusCode === 200) {
            console.log('链接成功')
            //使用cheerio来解析body（网页内容），提取我们想要的信息
            var $ = cheerio.load(body)

            //通过分析网页结构，我们发现豆瓣每部电影都通过item属性隔开
            var as = $('a')
            //   var asArr=Array.from(as)
            let linkArr = []
            //获取linkArr
            for (const key in as) {
                if (as.hasOwnProperty(key)) {
                    const element = as[key];
                    let href = $(element).attr('href')
                    let reg = /http/

                    if (reg.test(href)) {
                        // console.log("requstMovie -> href", href)
                        linkArr.push()
                    }
                }
            }
            linkArr = ['https://mp.weixin.qq.com/s/dUVFQprmvGNNJJ1_hwOSeg']
            linkArr.forEach(function (link) {

                request(link, function (error, response, body) {
                    var mh = cheerio.load(body);
                    // console.log( mh('.js_editor_audio').attr('voice_encode_fileid'))

                    var fileId = mh('.js_editor_audio').attr('voice_encode_fileid');
                    // https://res.wx.qq.com/voice/getvoice?mediaid=MzAxNDcxMjM5NF8yMjQ3NTE4NDg3

                    request("https://res.wx.qq.com/voice/getvoice?mediaid=MzAxNDcxMjM5NF8yMjQ3NTE4NDg3")
                    .pipe(fs.createWriteStream("123.mp3"))
                    .on("error",function(err){
                    console.log("requstMovie -> error")
                      
                    })
                    .on("close",() => {
                    console.log("requstMovie -> close")
                       
                    })
                  

                })

            })
        }
    })

}
requstMovie()


var handleAlink = function (a) {
    console.log(a);
}