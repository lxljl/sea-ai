// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'sea-ai'
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
    const secret = 'xxxx'  // 你的微信小程序secret
    console.log('appId:' + APPID)
    const url_get_token = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${secret}`
    return new Promise(async(resolve, reject) => {
        await rq({
            method: 'GET',
            uri: url_get_token
        }).then( async(str_res) => {
            const res = JSON.parse(str_res)
            if (!res.errcode) {
                cur_token = {
                    access_token: res.access_token,
                    expires_in: db.serverDate({
                        offset: res.expires_in
                    })
                }
                await db.collection('token').doc('token').set({
                    data: cur_token
                })
                console.log('请求新的access_token成功')
                resolve(cur_token)
            } else {
                console.log('请求新的access_token出错:' + res)
                reject(res)
            }
        }).catch(err => {
            console.log('请求新的access_token出错:' + err)
            reject(err)
        })
    })
}