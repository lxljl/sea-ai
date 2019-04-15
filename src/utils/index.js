/*
 * @Author: lx (前端开发工程师) 
 * @Date: 2018-09-25 13:46:23 
 * @Desc: 常用的工具类函数
 * @Last Modified by: lx (前端开发工程师)
 * @Last Modified time: 2019-04-13 10:54:48
 */
import wepy from 'wepy'

/**
 * 
 * @param {object} obj 
 *  {
 *      title: '提示的内容',
 *      icon: 图标，有效值 'success', 'loading', 'error', 'none',
 *      duration: 提示的延迟时间，单位毫秒，默认：1500,
 *      mask: 是否显示透明蒙层，防止触摸穿透，默认：true
 *  }
 *  返回Promise
 */ 
export function showToast (obj) {
    const iconList = ['success', 'loading', 'error', 'none']
    const sourceMap = {
        success: '/images/success.png',
        loading: '/images/loading.gif',
        error: '/images/icon_error.png',
        none: ''
    }
    let {
        title = '', 
        icon = 'success', 
        image, 
        duration = 1500, 
        mask = true
    } = obj || {}
    let source  = {
        title,
        icon,
        image,
        duration,
        mask
    }
    if (image) {
        source = image
    } else if (iconList.indexOf(icon) > -1) {
        sourceMap[icon] === 'none'? delete source.image : source.image = sourceMap[icon]
    }
    return wepy.showToast(source)
}

/**
 * 
 * @param {object} obj 
 *  {
 *      title: 提示的标题,
 *      content: 提示的内容,
 *      showCancel: 是否显示取消按钮，默认为 true,
 *      cancelText: 取消按钮的文字，默认为"取消"，最多 4 个字符,
 *      cancelColor: 取消按钮的文字颜色，默认为"#000000",
 *      confirmText: 确定按钮的文字，默认为"确定"，最多 4 个字符,
 *      confirmColor: 确定按钮的文字颜色，默认为"#0F9183",
 *  }
 *  返回Promise
 */ 
export function showModal (obj) {
    let {
        title = '',
        content = '', 
        showCancel = true, 
        cancelText = '取消', 
        cancelColor = '#000000', 
        confirmText = '确定', 
        confirmColor = '#0F9183'
    } = obj || {}
    return wepy.showModal({
        title,
        content,
        showCancel,
        cancelText,
        cancelColor,
        confirmText,
        confirmColor
    })
}

/**
 * 格式化时间
 * @param {date} time 时间
 * @param {string} cFormat {y}-{m}-{d} {h}:{i}:{s} {a} 
 */
export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        
    } else {
        if (('' + time).length === 10) time = parseInt(time) * 1000
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        if(value === 0 && key === 'a') return '日'
        if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}

/** 
 * 读取本地文件内容
 * @param {number} filePath 要读取的文件的路径
 * @param {string} encoding 指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容 ascii / base64 / binary / hex / (ucs2/ucs-2/utf16le/utf-16le) / utf-8/utf8 / latin1
 */
export function localEncoding(filePath, encoding = 'base64') {
    return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
            filePath,
            encoding,
            success: ({data})=> resolve(data),
            fail: reject
        })
    })
}

/**
 * 云函数调用
 * @param {string} name 云函数名字
 * @param {string} data 传输的数据
 */
export function cloudFn(name, data) {
    return new Promise(async (resolve, reject) => {
        try {
            wepy.showLoading({
                title: 'Loading...', //提示的内容,
                mask: true, //显示透明蒙层，防止触摸穿透,
            })
            let {
                result
            } = await wx.cloud.callFunction({
                name,
                data
            })
            if(result.code > 0) throw result
            resolve(result)
        } catch (error) {
            console.log(error)
            reject(error)
        } finally {
            wepy.hideLoading()
        }
    })
}
