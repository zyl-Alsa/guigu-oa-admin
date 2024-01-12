/**
 * 前端路由守卫
 * 用于权限控制和动态路由添加
 */

import router from './router'
import store from './store'
import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // 水平进度条提示: 在跳转路由时使用
import 'nprogress/nprogress.css' // 水平进度条样式
import getPageTitle from '@/utils/get-page-title' // 获取应用头部标题的函数
import Layout from '@/layout'
import ParentView from '@/components/ParentView'
const _import = require('./router/_import_'+process.env.NODE_ENV) // 获取组件的方法


// 1、首先从本地存储中获取用户的登录标记（token），判断用户是否已登录。
NProgress.configure({ showSpinner: false }) // NProgress配置
const whiteList = ['/login'] // 没有重定向白名单
router.beforeEach(async(to, from, next) => {
  NProgress.start()
// 设置页面标题
  document.title = getPageTitle(to.meta.title)
// 判断用户是否已登录
  const hasToken = getToken()
  /**
   * 2、如果用户已登录，且当前页面为登录页，则重定向到主页；
   * 若不是登录页，则获取用户信息并根据用户权限动态添加路由，并将路由数据传递给全局变量，最后跳转到用户想要访问的页面。
   */
  if (hasToken) {
    if (to.path === '/login') {
      // 如果已登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          // 获取用户信息
          await store.dispatch('user/getInfo')// 请求获取用户信息
          if (store.getters.menus.length < 1) {
            global.antRouter = []
            next()
          }
          const menus = filterAsyncRouter(store.getters.menus)// 1.过滤路由
          console.log(menus)
          router.addRoutes(menus) // 2.动态添加路由
          let lastRou = [{ path: '*', redirect: '/404', hidden: true }]
          router.addRoutes(lastRou)
          global.antRouter = menus // 3.将路由数据传递给全局变量，做侧边栏菜单渲染工作
          next({
            ...to,
            replace: true
          })
          //next()
        } catch (error) {
          // 删除令牌（通行证）并转到登录页面重新登录
          console.log(error)
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else { /* 没有标记*/
  // 3、 如果用户未登录，并且当前页面不在免登陆白名单中，则重定向到登录页面。
    if (whiteList.indexOf(to.path) !== -1) {
      //在免费登录白名单中，直接进入
      next()
    } else {
      // 其他没有访问权限的页面被重定向到登录页面。
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

// 4、 在路由跳转前和跳转后会使用 NProgress 库显示页面加载进度条。
router.afterEach(() => { // 完成进度条
  NProgress.done()
}) // // 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else {
        try {
          route.component = _import(route.component)// 导入组件
        } catch (error) {
          debugger
          console.log(error)
          route.component = _import('dashboard/index')// 导入组件
        }
      }
    }
    if (route.children && route.children.length > 0) {
      route.children = filterAsyncRouter(route.children)
    } else {
      delete route.children
    }
    return true
  })
  return accessedRouters
}