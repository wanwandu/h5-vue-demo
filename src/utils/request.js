import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import defaultConfig from '../config'
import _ from 'lodash'
import qs from 'qs'

// create an axios instance
const service = axios.create({
  baseURL: defaultConfig.api, // url = base url + request url
  timeout: 10000 // request timeout
})

const pending = []
const CancelToken = axios.CancelToken
const removePending = (config) => {
  for (const p in pending) {
    if (pending[p].u === config.url + '&' + config.method) { // 当当前请求在数组中存在时执行函数体
      pending[p].f() // 执行取消操作
      pending.splice(p, 1) // 把这条记录从数组中移除
    }
  }
}

// request interceptor     request.getResponseHeader("tokenId")
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['authorization'] = 'Bearer ' + getToken() // 让每个请求携带登录token
    }
    if (config.isFrom) { // 设置data为formData格式
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      config.data = qs.stringify(config.data)
    }
    if (config.setTimeout) { // 重新设置 timeout
      config.timeout = 50000
    }
    removePending(config) // 在一个ajax发送前执行一下取消操作
    config.cancelToken = new CancelToken((c) => {
      // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
      pending.push({ u: config.url + '&' + config.method, f: c })
    })
    return config
  },
  error => {
    // do something with request error
    console.log(error, '<----error') // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    removePending(response.config) // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    const res = response.data
    const token = response.headers['access_token']
    setToken(token)
    store.dispatch('user/setToken', token)
    if (res.code !== 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      if (res.code >= 30000 && res.code < 40000) {
        if (res.errors[0].message !== 'validation') {
          const errorMessage = res.errors[0].message
          MessageBox.confirm(errorMessage, '哎呦', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            showCancelButton: false,
            type: 'warning'
          }).then(() => {
          }, () => {
            // location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        } else {
          const errorMessage = _.concat(Object.values(res.errors[0].validation)).join(';')
          MessageBox.confirm(errorMessage, '哎呦', {
            confirmButtonText: '确定',
            cancelButtonText: '刷新',
            type: 'warning'
          }).then(() => {
          }, () => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        }
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
