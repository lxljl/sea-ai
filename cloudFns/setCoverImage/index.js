// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx'  // 你的环境id
})

// 云函数入口函数
/**
 * 设置封面图片
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
            if(typeof event.index != 'number' && event.index > 5 && event.index < 0) throw {code: 7501, data:[], info: '索引错误！'}
            // 获取数据
            let {
                stats: {
                    updated
                }
            } = await db.collection('identification-record').where({
                openid: OPENID,
                _id: event.id
            }).update({
                data: {
                    baike_result_index: Number(event.index)
                }
            })
            if(updated == 0) throw {code: 7505, data: [], info: '设置封面图失败！'}
            resolve({
                code: 0,
                data: [],
                info: '操作成功！'
            })
        } catch (error) {
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}