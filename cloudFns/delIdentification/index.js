// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx' // 你的环境id
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
            if(!event.id) throw {code: 7500, data: [], info: 'id不能为空！'}
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
                    delete: 1
                }
            })
            console.log(updated)
            if(updated == 0) throw {code: 7505, data: [], info: '删除记录失败！'}
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