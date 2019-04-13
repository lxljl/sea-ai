// 云函数入口文件
const cloud = require('wx-server-sdk')
const rq = require('request-promise')

cloud.init({
    env: 'xxxx'    // 你的环境id
})

// 云函数入口函数
/**
 * 微信登录
 */
exports.main = async(event, context) => {
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext()
    const db = cloud.database()
    const secret = 'xxxxx'   // 你的小程序secret
    const url_get_token = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${secret}&js_code=${event.code}&grant_type=authorization_code`
    return new Promise(async(resolve, reject) => {
        if(!event.code) throw {code: 7400, data:[], info: 'code不能为空！'}
        try {
            let {
                openid,
                session_key
            } = await rq({
                method: 'GET',
                uri: url_get_token,
                json: true
            })
            // 获取用户信息
            let {
                result: {
                    data: user
                }
            } = await cloud.callFunction({
                // 要调用的云函数名称
                name: 'getUserInfo',
                // 传递给云函数的参数
                data: {
                    openid: openid || OPENID
                }
            })
            // 有数据则返回
            if(user.length > 0){
                // 写入用户session_key
                await cloud.callFunction({
                    // 要调用的云函数名称
                    name: 'setUserInfo',
                    // 传递给云函数的参数
                    data: {
                        openid: openid || OPENID,
                        session_key
                    }
                })
                resolve({
                    code: 0,
                    data: user[0],
                    info: '操作成功！'
                })
                return false
            }
            // 无数据新增用户
            // openid:ssoycj80LFkCOyH-mW3Yz4J338qc0g
            await db.collection('user').add({
                data:{
                    avatar: '',
                    city: '',
                    created_at: db.serverDate(),
                    is_enabled: 1,
                    mobile: '',
                    nickname: '',
                    openid: openid || OPENID,
                    password: null,
                    province: '',
                    session_key,
                    sex: '2',
                    status: 1,
                    updated_at: db.serverDate(),
                    username: '',
                    wx_avatar: '',
                    wx_openid: '',
                }
            })
            let {
                result: {
                    data
                }
            } = await cloud.callFunction({
                // 要调用的云函数名称
                name: 'getUserInfo',
                // 传递给云函数的参数
                data: {
                    openid: openid || OPENID
                }
            })
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


// let {
//     code
// } = await wepy.login()
// let data = await cloudFn('login', {
//     code
// })