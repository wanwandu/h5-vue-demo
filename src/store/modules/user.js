import { login, logout, userServices, getInfo } from '@/api/user'
import { getToken, removeToken, getUserServices, setUserServices, removeUserServices } from '@/utils/auth'
import { resetRouter } from '@/router'
import _ from 'lodash'
import config from '../../config'
// import store from '../index'

const getDefaultState = () => {
  return {
    token: getToken(),
    // name: (JSON.parse(localStorage.getItem('login')).username) || '',
    name: '',
    avatar: '',
    services: getUserServices(),
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_SERVICES: (state, data) => {
    state.services = data
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  //   getServices
  getServices({ commit, state }) {
    return new Promise((resolve, reject) => {
      userServices().then(response => {
        const data = response.data

        if (data && data.length < 1) {
          // reject('无法获取用户可选服务类型')
          return
        }
        commit('SET_SERVICES', data)
        setUserServices(data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        // const { data } = response
        // commit('SET_TOKEN', data.token)
        // setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        const data = response.data
        if (!data) {
          reject('请重新登录！')
        }
        let roles = []
        if (data.username === 'admin') {
          roles = ['admin']
        } else {
          if (!data.role) {
            reject('没有权限，请联系管理员！')
          }
          if (data.display_help === 1) {
            roles = roles.concat('help')
          }
          roles = roles.concat(_.find(config.roleList, { id: data.role }).value)
        }
        commit('SET_NAME', data.name)
        commit('SET_ROLES', roles)
        if (data && data.length < 1) {
          // reject('无法获取用户可选服务类型')
          return
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // set token
  setToken({ commit }, state) {
    return new Promise(resolve => {
      commit('SET_TOKEN', state)
      resolve()
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_NAME', '')
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_SERVICES', [])
      removeToken() // must remove  token  first
      removeUserServices()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

