// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'xxxx'  //  你的环境id
})
const classify = {
    ocr: {
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
        type: 6,
        name: '文字识别'
    },
    handwriting: {
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting',
        type: 7,
        name: '手写文字'
    },
    idcard: {
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard',
        type: 8,
        name: '身份证'
    },
    bankcard: {
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/bankcard',
        type: 9,
        name: '银行卡'
    },
    license_plate: {
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/license_plate',
        type: 10,
        name: '车牌'
    },
}

// 云函数入口函数
/**
 * 文字识别
 */
exports.main = async(event, context) => {
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext()
    const db = cloud.database()
    return new Promise(async(resolve, reject) => {
        try {
            let data = null
            // 获取数据
            let {
                data:{
                    access_token
                }
            } = await db.collection('baidu-token').doc('token').get()
            if(!event.image) throw {code: 7322, data: [],info: '图片不能为空'}
            // 文字识别
            if(event.type == 'ocr') {
                data  = {
                    type: event.type,
                    openid: event.openid || OPENID,
                    image: event.image,
                    /* 识别语言类型，默认为CHN_ENG。可选值包括：
                    - CHN_ENG：中英文混合；
                    - ENG：英文；
                    - POR：葡萄牙语；
                    - FRE：法语；
                    - GER：德语；
                    - ITA：意大利语；
                    - SPA：西班牙语；
                    - RUS：俄语；
                    - JAP：日语；
                    - KOR：韩语 */
                    language_type: event.language_type || false, 
                    /* 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:
                    - true：检测朝向；
                    - false：不检测朝向。 */
                    detect_direction: event.detect_direction || false,
                    // 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
                    detect_language: event.detect_language || false,
                    // 是否返回识别结果中每一行的置信度
                    probability: event.probability || false
                }
            // 手写文字识别
            } else if(event.type == 'handwriting') {
                data  = {
                    type: event.type,
                    openid: event.openid || OPENID,
                    image: event.image,
                    // 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
                    recognize_granularity: event.recognize_granularity || false	, 
                    // words_type=number:手写数字识别；无此参数或传其它值 默认手写通用识别（目前支持汉字和英文）
                    words_type: event.words_type || false,
                }
            // 手写文字识别
            } else if(event.type == 'idcard') {
                data  = {
                    type: event.type,
                    openid: event.openid || OPENID,
                    image: event.image,
                    // front：身份证含照片的一面；back：身份证带国徽的一面 
                    id_card_side: event.id_card_side || 'front'	, 
                    // 是否检测图像旋转角度，默认检测，即：true。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:
                    // - true：检测旋转角度并矫正识别；
                    // - false：不检测旋转角度，针对摆放情况不可控制的情况建议本参数置为true。
                    detect_direction: event.detect_direction || false,
                    // 是否开启身份证风险类型(身份证复印件、临时身份证、身份证翻拍、修改过的身份证)功能，默认不开启，即：false。可选值:true-开启；false-不开启
                    detect_risk: event.detect_risk || false,
                }
            // 银行卡识别
            } else if(event.type == 'bankcard') {
                data  = {
                    type: event.type,
                    openid: event.openid || OPENID,
                    image: event.image,
                }
            // 车牌识别
            } else if(event.type == 'license_plate') {
                data  = {
                    type: event.type,
                    openid: event.openid || OPENID,
                    image: event.image,
                    // 是否检测多张车牌，默认为false，当置为true的时候可以对一张图片内的多张车牌进行识别
                    multi_detect: event.multi_detect || false 
                }
            // 类型错误
            } else {
                if(!event.type) throw {code: 7329, data: [],info: '类型错误！'}
            }

            // 请求结果
            let result = await rq({
                method: 'POST',
                uri: `${classify[data.type].url}?access_token=${access_token}`,
                form: data,
                json: true
            })
            console.log(result)
            // 错误判断
            if(result.error_msg) throw {code: 7320, data: [],info: result.error_msg}
            // 删除不需要的属性
            delete result.log_id

            // 正确后图片上传云端 
            let {
                fileID
            } = await cloud.uploadFile({
                cloudPath: `identification-record/${data.openid}-${Number(new Date())}.jpg`,
                fileContent: new Buffer(data.image, 'base64'),
            })
            // 新增数据
            let {
                _id
            } = await db.collection('identification-record').add({
                data: {
                    file_id: fileID,
                    openid: data.openid,
                    created_at: db.serverDate(),
                    type: classify[data.type].type,
                    // 解析结果
                    baike_result: result,
                    // 默认不删除
                    delete: 0
                }
            })
            resolve({
                code: 0,
                id: _id,
                info: '操作成功！'
            })
        } catch (error) {
            console.log(error)
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}
