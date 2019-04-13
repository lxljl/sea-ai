// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: 'xxxx'   // 你的环境id
})

// 格式化时间
function getTime(time, max_date) {
    let date = new Date(time),
        maxDate = max_date ? new Date(max_date): new Date(Number(date) + 86400000),
        y = date.getFullYear(),
        my = maxDate.getFullYear(),
        m = date.getMonth() + 1,
        mm = maxDate.getMonth() + 1,
        d = date.getDate(),
        md = maxDate.getDate()
    return {
        min_day: new Date(`${y}-${m}-${d}`),
        max_day: new Date(`${my}-${mm}-${md}`),
    }
}

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
                // 是否为删除的 。 默认查找没有删除的
                query = {
                    delete: 0
                },
                // 传入时间， 假如没有 默认当天
                date = event.date || new Date()
                max_date = event.max_date || null
            // 当天时间区间
            let {
                min_day,
                max_day
            } = getTime(date, max_date)

            // 假如传入类型, 那么查找对应的记录
            // 1 动物 2 植物 3 菜品
            if(event.type) {
                query.type = event.type
            }
            // 假如有openid
            if(event.my == 3394753) {
                query.openid = OPENID
            }
            // 获取数据
            let {
                data
            } = await db.collection('identification-record').where(query).orderBy('created_at', 'desc').limit(limit).skip(page * limit).field({
                _id: true,
                file_id: true,
                created_at: true,
                baike_result: true
            }).get()
            // 总数
            let {
                total
            } = await db.collection('identification-record').where(query).count()
            // 当天总数 包括已经删除的
            let day_total_obj = {
                created_at: _.gte(min_day).and(_.lt(max_day))
            }
            if(event.type) {
                day_total_obj.type = event.type
            }
            let {
                total: day_total
            } = await db.collection('identification-record').where(day_total_obj).count()
            // 数据返回
            resolve({
                code: 0,
                data: {
                    list: data,
                    current_page: page + 1,
                    last_page: Math.ceil(total / limit),
                    limit,
                    total,
                    day_total,
                },
                info: '操作成功！'
            })
        } catch (error) {
            if(!error.code) reject(error)
            resolve(error)
        }
    })
}