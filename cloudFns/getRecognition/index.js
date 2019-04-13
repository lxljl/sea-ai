// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'xxxx'   // 你的环境id
})
const classify = {
    animal: {
        url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/animal',
        type: 1,
        name: '动物'
    },
    plant: {
        url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/plant',
        type: 2,
        name: '植物'
    },
    dish: {
        url: 'https://aip.baidubce.com/rest/2.0/image-classify/v2/dish',
        type: 3,
        name: '菜品'
    },
    // flower: {
    //     url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/flower',
    //     type: 4,
    //     name: '花卉'
    // },
    // ingredient: {
    //     url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/classify/ingredient',
    //     type: 5,
    //     name: '果蔬'
    // },
    // 检测用户上传的图片，输出图片的识别结果名称及对应的概率打分。 注意：在正式使用之前，
    // 请前往细粒度图像识别页面提交合作咨询，或者申请加入百度图像识别官方QQ群（群号:659268104），
    // 提供公司名称、appid、应用场景、所需要入库的图片量，工作人员将协助开通调用求权限。注意，工作人员协助开通权限后该接口方可使用。
}
// 云函数入口函数
/**
 * 动植物识别
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
            // 获取数据
            let {
                data:{
                    access_token
                }
            } = await db.collection('baidu-token').doc('token').get()
            if(!event.image) throw {code: 7322, data: [],info: '图片不能为空'}
            let type = event.type || 'plant',
                image = event.image,
                top_num = event.top_num || 1
                baike_num = event.baike_num || 1

            // 假如是文字识别 
            let ocrArr = ['ocr', 'handwriting', 'idcard', 'bankcard', 'license_plate']
            if(ocrArr.includes(type)) {
                // 获取用户信息
                let {
                    result: {
                        id
                    }
                } = await cloud.callFunction({
                    // 要调用的云函数名称
                    name: 'getOcr',
                    // 传递给云函数的参数
                    data: {
                        type,
                        image,
                        openid: OPENID
                    }
                })
                resolve({
                    id,
                    code: 0,
                    info: '操作成功！'
                })
                return false
            }
            // 数据请求识别
            let {
                result,
                error_msg
            } = await rq({
                method: 'POST',
                uri: `${classify[type].url}?access_token=${access_token}`,
                form: {
                    image,
                    top_num,
                    baike_num
                },
                json: true
            })
            
            // 错误判断
            if(!result) throw {code: 7480, data:[],info: error_msg}
            if(result[0].score == 0) throw {code: 7481, data:[],info: result[0].name} 
            if(result[0].name == '非动物') throw {code: 7482, data:[],info: result[0].name} 
            if(result[0].name == '非菜') throw {code: 7483, data:[],info: result[0].name} 
            // 格式化列表
            for (let i = 0; i < result.length; i++) {
                let item = result[i]
                if(item.baike_info) {
                    if(item.baike_info.image_url) {
                        item.baike_info.image_url = item.baike_info.image_url.replace(/http:\/\//g, 'https://')
                    }
                }
            }
            // 正确后图片上传云端 
            let {
                fileID
            } = await cloud.uploadFile({
                cloudPath: `identification-record/${OPENID}-${Number(new Date())}.jpg`,
                fileContent: new Buffer(image, 'base64'),
            })
            // 新增数据
            let {
                _id
            } = await db.collection('identification-record').add({
                data:{
                    file_id: fileID,
                    openid: OPENID,
                    created_at: db.serverDate(),
                    type: classify[type].type,
                    baike_result: result[0],
                    delete: 0
                }
            })
            resolve({
                id: _id,
                code: 0,
                info: '操作成功！'
            })
        } catch (error) {
            console.log(error)
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}
