// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx'   // 你的环境id
})

// 云函数入口函数
/**
 * 获取用户信息
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
                data
            } = await db.collection('user').where({
                openid: event.openid || OPENID
            }).get()
            if(data.length == 0) throw {code: 7402, data: [], info: '用户不存在！'} 
            resolve({
                code: 0,
                data,
                info: '操作成功！'
            })
        } catch (error) {
            console.log(error)
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}