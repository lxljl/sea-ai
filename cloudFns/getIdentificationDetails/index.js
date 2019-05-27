// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx'   // 你的环境id
})

// 云函数入口函数
/**
 * 记录详情
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
            if(!event.id) throw {code: 7500, data:[], info: 'id不能为空！'}
            // 获取数据
            let {
                data
            } = await db.collection('identification-record').where({
                _id: event.id
            }).field({
                _id: true,
                file_id: true,
                created_at: true,
                baike_result: true,
                baike_result_list: true,
                baike_result_index: true,
                type: true
            }).get()
            if(data.length == 0) throw {code: 7501, data:[], info: '找不到对应的记录！'}
            resolve({
                code: 0,
                data: data[0],
                info: '操作成功！'
            })
        } catch (error) {
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}