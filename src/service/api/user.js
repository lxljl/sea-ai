/*
 * @Author: lx (前端开发工程师) 
 * @Date: 2018-09-25 13:46:23 
 * @Desc: 关于用户的一些常用操作 
 * @Last Modified by: lx (前端开发工程师)
 * @Last Modified time: 2019-04-04 14:09:51
 */

import wepy from 'wepy'
import {
    cloudFn
} from '@/utils'

/**
 * 登录
 */
export function login() {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                code
            } = await wepy.login()
            let {
                data
            } = await cloudFn('login',{
                code
            })
            wepy.setStorageSync('user', data)
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
    return new Promise(async (resolve, reject) => {
        try {
            let {
                result
            } = await cloudFn('getUserInfo')
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * 更新用户信息
 */
export function setUserInfo({
    gender: sex,
    nickName: nickname,
    avatarUrl: avatar,
    country,
    province,
    city
}) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await cloudFn('setUserInfo', {
                nickname,
                avatar,
                sex,
                city,
                province,
                country
            })
            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}