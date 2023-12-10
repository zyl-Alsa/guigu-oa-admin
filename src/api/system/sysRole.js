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
    },

    // 角色删除
    removeById(id){
        return request({
            url: `${api_name}/remove/${id}`,
            method: 'delete'
        })
    },

    // 角色添加
    saveRole(role) {
        return request({
            url: `${api_name}/save`,
            method: 'post',
            data:role
        })
    }
} 