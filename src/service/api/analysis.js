/*
 * @Author: lx (前端开发工程师) 
 * @Date: 2018-09-25 13:46:23 
 * @Desc: 关于识别的一些常用操作 
 * @Last Modified by: lx (前端开发工程师)
 * @Last Modified time: 2019-05-20 16:15:48
 */

import {
    cloudFn,
    parseTime,
    localEncoding
} from '@/utils'

/**
 * 识别图片
 * @param {string} tempFilePath 路径
 * @param {string} type 类型  默认 plant    、 animal 、 plant 、 dish 、 ocr
 */
export function getAnalysis(tempFilePath, type = 'plant') {
    return new Promise(async (resolve, reject) => {
        try {
            let image = await localEncoding(tempFilePath)
            let {
                id
            } = await cloudFn('getAnalysis', {
                image,
                type
            })
            resolve(id)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 识别记录列表
 * @param {string} type 类型 
 * @param {string} page 页数
 * @param {string} limit 条数
 * @param {string} my 自己的 3394753
 */
export function getAnalysisList(type, page, limit, date) {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                data
            } = await cloudFn('getAnalysisList', {
                type: type,
                page,
                limit,
                date
            })
            data.list.map((item)=>{
                item.created_at = parseTime(item.created_at, '{m}/{d} {h}:{i}')
                return item
            })
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 识别记录详情
 * @param {string} id 记录id
 */
export function getIdentificationDetails(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                data
            } = await cloudFn('getIdentificationDetails', {
                id
            })
            data.created_at = parseTime(data.created_at, '{y}-{m}-{d} {h}:{i}')
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 设置封面图
 * @param {string} id 记录id
 * @param {number} index 索引
 */
export function setCoverImage(id, index = 0) {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                data
            } = await cloudFn('setCoverImage', {
                id,
                index: index
            })
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 设置广场展示记录
 * @param {string} id 记录id
 */
export function setPlaza(id, mark = 0) {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                data
            } = await cloudFn('setPlaza', {
                id,
                mark: mark
            })
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 删除记录
 * @param {string} id 记录id
 */
export function delIdentification(id) {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                data
            } = await cloudFn('delIdentification', {
                id
            })
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}