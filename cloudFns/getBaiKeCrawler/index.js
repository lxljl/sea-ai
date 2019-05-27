// 云函数入口文件
const rq = require('request-promise')
const cheerio = require('cheerio')

// 云函数入口函数
/**
 * 百度百科爬虫
 */
exports.main = async(event, context) => {
    return new Promise(async(resolve, reject) => {
        try {
            if(!event.query)  throw {code: 7410, data: [],info: '关键字不能为空！'}
            const url = `https://baike.baidu.com/item/${encodeURIComponent(event.query)}`
            let data = await rq({
                method: 'GET',
                uri: url
            })
            let $ = cheerio.load(data),
                $title = $('.main-content dl.lemmaWgt-lemmaTitle.lemmaWgt-lemmaTitle- .lemmaWgt-lemmaTitle-title'),
                py = $title.find('.lemma-pinyin .text').text(),
                h1 = $title.find('h1').text(),
                h2 = $title.find('h2').text(),
                // 内容概括
                summary = [],
                // 基本信息
                basicInfo = [],
                // 主要价值
                chiefValue = []
                
                // 内容概括开始
                $('.main-content .lemma-summary .para').each((i, item)=>{
                    summary.push($(item).text())
                })
                // 内容概括结束

                // 基本信息开始
                $('.main-content .basic-info .basicInfo-block .basicInfo-item.name').each((i, item)=>{
                    // 去除空格
                    basicInfo.push({
                        name: $(item).text().replace(/\s/g,"")
                    })
                })
                $('.main-content .basic-info .basicInfo-block .basicInfo-item.value').each((i, item)=>{
                    // 去除回车
                    basicInfo[i].value = $(item).text().replace(/[\r\n]/g,"")
                })
                // 基本信息结束

                // 主要价值开始
                $('.main-content .para-title.level-2').each((i, item)=>{
                    if($(item).find('.title-text').text().indexOf('主要价值') != -1){
                        var text = $(item).next()
                        while(text.hasClass('para')) {
                            chiefValue.push(text.text())
                            text = text.next()
                        }
                    }
                })
                // 主要价值结束

            // 数据返回
            resolve({
                code: 0,
                data: {
                    py,
                    h1,
                    h2,
                    summary,
                    basicInfo,
                    chiefValue
                },
                info: '操作成功！'
            })
        } catch (error) {
            console.log(error)
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}