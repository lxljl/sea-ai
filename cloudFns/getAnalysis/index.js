// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'xxxx'  // 你的环境id
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
    car: {
        url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/car',
        type: 4,
        name: '车型'
    },
    // ingredient: {
    //     url: 'https://aip.baidubce.com/rest/2.0/image-classify/v1/classify/ingredient',
    //     type: 5,
    //     name: '果蔬'
    // },
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

            // 参数
            let type = event.type || 'plant',
                image = event.image,
                top_num = event.top_num || 5
                baike_num = event.baike_num || 5
            
            // 色情内容审核
            let {
                conclusionType,
                data
            } = await rq({
                method: 'POST',
                uri: `https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=${access_token}`,
                form: {
                    image
                },
                json: true
            })
            if(conclusionType != 1) throw {code: 7323, data: [],info: data[0].msg}

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
            let obj = {
                file_id: fileID,
                openid: OPENID,
                created_at: db.serverDate(),
                type: classify[type].type,
                baike_result: result[0],
                baike_result_list: result,
                baike_result_index: 0,
                delete: 0
            }
            if(classify[type].type == 6) {
                delete obj.baike_result_list
                delete obj.baike_result_index
            } 
            // 新增数据
            let {
                _id
            } = await db.collection('identification-record').add({
                data: obj
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
