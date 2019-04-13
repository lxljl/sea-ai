// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx' //  你的环境id
})

// 云函数入口函数
/**
 * 拉取微信access_token
 */
exports.main = async(event, context) => {
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext()
    const db = cloud.database()
    let {
        data
    } = await db.collection('token').doc('token').get()
    return data
}