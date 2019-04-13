// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx'   // 你的环境id
})

// 云函数入口函数
/**
 * 设置用户信息
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
            let data = {
                updated_at: db.serverDate()
            }
            if(event.avatar) data.avatar = event.avatar
            if(event.city) data.city = event.city
            if(event.is_enabled) data.is_enabled = event.is_enabled
            if(event.mobile) data.mobile = event.mobile
            if(event.nickname) data.nickname = event.nickname
            if(event.password) data.password = event.password
            if(event.province) data.province = event.province
            if(event.country) data.country = event.country
            if(event.session_key) data.session_key = event.session_key
            if(event.sex) data.sex = event.sex
            if(event.status) data.status = event.status
            if(event.username) data.username = event.username
            if(event.wx_avatar) data.wx_avatar = event.wx_avatar
            if(event.wx_openid) data.wx_openid = event.wx_openid
            // 更新数据数据
            let result = await db.collection('user').where({
                openid: event.openid || OPENID
            }).update({
                data: data
            })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}