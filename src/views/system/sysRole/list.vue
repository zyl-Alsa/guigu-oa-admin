<template>
  <div class="app-container">
    <!--查询表单-->
    <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="角色名称">
              <!-- 调整宽度以腾出空间放置搜索按钮 -->
              <el-input
                style="width: calc(100% - 80px); height: 32px"
                v-model="searchObj.roleName"
                placeholder="角色名称"
                @input="handleInputChange"
                @keyup.enter="handleEnterSearch"
                autocomplete="off"
              ></el-input>
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                :loading="loading"
                @click="fetchData()"
                style="height: 32px"
                >搜索</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="display: flex">
          <!-- 将搜索按钮从这里移除 -->
          <el-button type="success" icon="el-icon-plus" size="mini" @click="add"
            >添加</el-button
          >
          <!-- 工具条 -->
          <!-- <div class="tools-div">
      </div> -->
          <el-button icon="el-icon-refresh" size="mini" @click="resetData"
            >重置</el-button
          >
          <el-button class="btn-add" size="mini" @click="batchRemove()"
            >批量删除</el-button
          >
        </el-row>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      stripe
      border
      style="width: 100%; margin-top: 10px"
      @selection-change="handleSelectionChange"
    >
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
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="edit(scope.row.id)"
            title="修改"
          />
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeDataById(scope.row.id)"
            title="删除"
          />
          <el-button type="warning" icon="el-icon-baseball" size="mini" @click="showAssignAuth(scope.row)" title="分配权限"/>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      style="padding: 30px 0; text-align: center"
      layout="total, prev, pager, next, jumper"
      @current-change="fetchData"
    />

    <!-- “添加”按钮弹出框 -->
    <el-dialog title="添加/修改" :visible.sync="dialogVisible" width="40%">
      <!-- dialogVisible为true时弹出框，为false则不会弹出 -->
      <el-form
        ref="dataForm"
        :model="sysRole"
        label-width="150px"
        size="small"
        style="padding-right: 40px"
      >
        <el-form-item label="角色名称">
          <el-input v-model="sysRole.roleName" />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="sysRole.roleCode" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- @click="dialogVisible = false" ：点击“取消”就会关闭弹出框 -->
        <el-button
          @click="dialogVisible = false"
          size="small"
          icon="el-icon-refresh-right"
          >取 消</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="saveOrUpdate()"
          size="small"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 第一步：引入定义接口js文件
import api from "@/api/system/sysRole";

export default {
  // 第二步：vue代码结构
  // 初始值，定义数据模型
  data() {
    return {
      list: [], // 角色列表
      page: 1, // 当前页
      limit: 5, // 每页显示记录数
      total: 0, // 总记录数
      searchObj: {}, // 条件对象
      selection: [], // 多个复选框的值
      sysRole: {}, // 封装表单角色数据
      dialogVisible: false, // 是否弹框。
    };
  },
  // 渲染之前之行
  created() {
    // 要在页面渲染之前执行fetchData方法
    this.fetchData();
  },
  // 操作方法 
  methods: {
    // 跳转到分配菜单的页面
    showAssignAuth(row) {
      this.$router.push('/system/assignAuth?id='+row.id+'&roleName='+row.roleName);
    },
    // 当多选选项发生变化的时候调用,
    // 选择复选框，把复选框所在行内容传递
    handleSelectionChange(selection) {
      this.selection = selection;
      console.log(this.selection);
    },
    // 批量删除
    batchRemove() {
      // 判断：
      // 1、当用户没有勾选复选框时(selection数组为空时)
      if (this.selection.length === 0) {
        this.$message.warning("请选择要删除的记录！");
        return;
      }
      // 弹出“确认删除”框
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 点击删除，远程调用ajax
          // 遍历selection，将id取出放入id列表
          var idList = [];
          // 遍历this.selection数组，其中 item 代表数组中的当前元素，然后将该元素的 id 属性添加到 idList 数组中
          this.selection.forEach(item => {
            idList.push(item.id);
          });
          // 调用api
          return api.batchRemove(idList);
        })
        .then((response) => {
          // 提示信息
          this.$message.success(response.message);
          // 刷新页面
          this.fetchData();
        });
    },
    // 点击修改，弹出框，根据id查询数据显示
    edit(id) {
      // 弹出框
      this.dialogVisible = true;
      // 根据id查询
      this.fetchDataById(id);
    },
    // 根据id查询方法
    fetchDataById(id) {
      // 调用接口中的getById方法
      api.getById(id).then((response) => {
        this.sysRole = response.data;
      });
    },
    // 点击“添加”弹出框
    add() {
      this.dialogVisible = true;
    },
    // 添加或者修改
    saveOrUpdate() {
      // 根据id来判断是添加还是修改
      // 1、没有id，就是添加
      if (!this.sysRole.id) {
        this.save();
      } else {
        // 2、有id，就是修改
        this.update();
      }
    },
    // 添加方法
    save() {
      // 调用saveRole接口，传入参数
      api
        .saveRole(this.sysRole)
        // 添加之后
        .then((response) => {
          // 提示操作成功
          this.$message.success(response.message || "操作成功");
          // 关闭弹窗
          this.dialogVisible = false;
          // 刷新页面
          this.fetchData(this.page);
        });
    },
    // 修改方法
    update() {
      api.updateById(this.sysRole).then((response) => {
        // 提示操作成功
        this.$message.success(response.message || "操作成功");
        // 关闭弹窗
        this.dialogVisible = false;
        // 刷新页面
        this.fetchData(this.page);
      });
    },
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
    // 删除
    removeDataById(id) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        // 当点击"确定"时，执行then方法，当点击“取消”，执行catch方法，因为“取消”什么都不用做，所以就不写catch了
      })
        .then(() => {
          // 点击“确定”后调用removeById方法
          return api.removeById(id);
        })
        .then((response) => {
          // 删除成功后刷新页面
          this.fetchData();
          // 提示信息
          this.$message.success(response.message || "删除成功");
        });
    },
    // 输入框内容变化时更新搜索条件
    handleInputChange() {
      this.fetchData(); // 在输入框输入内容时实时更新搜索条件
    },

    // 回车键搜索
    handleEnterSearch() {
      this.fetchData();
    },
  },
};
</script>