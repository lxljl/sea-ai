// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'xxxx'   // 你的环境id
})

// 云函数入口函数
/**
 * 拉取百度access_token
 */
exports.main = async(event, context) => {
    const db = cloud.database()
    const client_id = 'xxxxx'  // 你的百度appid
    const client_secret = 'xxxxx'  // 你的百度secret
    const url_get_token = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`
    return new Promise(async(resolve, reject) => {
        try {
            let data = await rq({
                method: 'GET',
                uri: url_get_token,
                json: true
            })
            if(data.error) {
                reject(data)
                return false
            }
            await db.collection('baidu-token').doc('token').set({
                data
            })
            resolve(data.access_token)
        } catch (error) {
            reject(error)
        }
    })
}