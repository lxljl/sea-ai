// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'sea-ai'
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
            if(!event.mark && event.mark != 0) throw {code: 7501, data: [], info: '设置值不能为空！'}
            let mark = event.mark >= 1 ? 0: 1
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
                    delete: mark
                }
            })
            console.log(updated)
            if(updated == 0) throw {code: 7505, data: [], info: '设置记录失败！'}
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