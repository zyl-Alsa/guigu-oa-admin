<template>
  <div class="app-container">
    <!--查询表单-->
    <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="角色名称">
              <el-input style="width: 100%" v-model="searchObj.roleName" placeholder="角色名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="display: flex">
          <el-button 
          type="primary" 
          icon="el-icon-search" 
          size="mini" 
          :loading="loading"
            @click="fetchData()">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetData">重置</el-button>
        </el-row>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table v-loading="listLoading" :data="list" stripe border style="width: 100%; margin-top: 10px"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" />

      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="scope">
          {{ (page - 1) * limit + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="roleName" label="角色名称" />
      <el-table-column prop="roleCode" label="角色编码" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)" title="修改" />
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeDataById(scope.row.id)" title="删除" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination :current-page="page" :total="total" :page-size="limit" style="padding: 30px 0; text-align: center"
      layout="total, prev, pager, next, jumper" @current-change="fetchData" />
  </div>
</template>

<script>
// 第一步：引入定义接口js文件
import api from "@/api/system/sysRole";

export default {
  // 第二步：vue代码结构
  // 初始值
  data() {
    return {
      list: [], // 角色列表
      page: 1, // 当前页
      limit: 1, // 每页显示记录数
      total: 0, // 总记录数
      searchObj: {}, // 条件对象
    };
  },
  // 渲染之前之行
  created() {
    // 要在页面渲染之前执行fetchData方法
    this.fetchData();
  },
  // 操作方法
  methods: {
    // 条件分页查询方法
    fetchData(current = 1) {
      this.page = current;
      api
        .getPageList(this.page, this.limit, this.searchObj)
        .then((response) => {
          this.list = response.data.records;
          this.total = response.data.total;
        });
    },
  },
};
</script>