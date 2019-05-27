// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx' // 你的环境id
})

// 云函数入口函数
/**
 * 获取记录列表
 */
exports.main = async(event, context) => {
    let {
        OPENID,
        APPID,
        UNIONID
    } = cloud.getWXContext()
    const db = cloud.database()
    const _ = db.command
    return new Promise(async(resolve, reject) => {
        try {
                // 当前条数
            let limit = event.limit || 15,
                // 当前页数
                page = event.page - 1|| 0,
                query = {}
            // 传入时间， 假如没有 默认全部
            if(event.date == 3) {
                query.created_at =  _.gte(db.serverDate({
                    offset: -(60 * 60 * 72000)
                }))
            }
            // 假如有openid
            if(OPENID) {
                query.openid = OPENID
            }
            // 假如传入类型, 那么查找对应的记录
            // 1 动物 2 植物 3 菜品 6 文字
            if(event.type) {
                query.type = event.type
            }
            // 获取数据
            let {
                data
            } = await db.collection('identification-record').where(query).orderBy('created_at', 'desc').limit(limit).skip(page * limit).field({
                _id: true,
                file_id: true,
                created_at: true,
                type: true,
                baike_result: true,
                baike_result_list: true,
                baike_result_index: true
            }).get()
            // 总数
            let {
                total
            } = await db.collection('identification-record').where(query).count()
            // 数据返回
            resolve({
                code: 0,
                data: {
                    list: data,
                    current_page: page + 1,
                    last_page: Math.ceil(total / limit),
                    limit,
                    total
                },
                info: '操作成功！'
            })
        } catch (error) {
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}