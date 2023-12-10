import request from '@/utils/request'

const api_name = '/admin/system/sysRole'
export default {
    // 角色列表--条件分页查询
    getPageList(current,limit,searchObj){
        return request({
            url: `${api_name}/${current}/${limit}`,
            method: 'get',
            // 如果是普通对象的参数写法，params：对象参数名称
            // 如果使用json格式传递，data：对象参数名称
            params:searchObj
        })
    }
} 