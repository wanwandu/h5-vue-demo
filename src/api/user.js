import request from '@/utils/request'
// 登录
export function login(data) {
  return request({
    // url: '/vue-admin-template/user/login',
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/user/index',
    method: 'get'
  })
}
// 退出登录
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
