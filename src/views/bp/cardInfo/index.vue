<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">关键字：</label>
        <el-input v-model="query.keyword" clearable placeholder="持卡人名称或手机号" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="卡种">
            <el-select
              v-model="form.cardTypeId"
              filterable
              placeholder="请选择"
              class="filter-item"
              @keyup.enter.native="fetchCardTypes"
            >
              <el-option
                v-for="item in cardTypes"
                :key="item.id"
                :label="item.cardName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="持卡人" prop="userName">
            <el-select
              v-model="form.userId"
              filterable
              placeholder="请选择"
              class="filter-item"
              @keyup.enter.native="fetchUserInfos"
            >
              <el-option
                v-for="item in userInfos"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>

            <el-link type="primary" @click="showAddUserDialog = true">新增用户</el-link>

            <el-dialog :visible.sync="showAddUserDialog" title="新增用户" width="500px">
              <el-form ref="newUserForm" :model="newUserForm" :rules="newUserRules" size="small" label-width="80px">
                <el-form-item label="家长姓名" prop="name">
                  <el-input v-model="newUserForm.name" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="家长角色">
                  <el-select v-model="newUserForm.role" filterable placeholder="请选择">
                    <el-option
                      v-for="item in dict.parental_role"
                      :key="item.id"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="家长性别">
                  <el-select v-model="newUserForm.gender" filterable placeholder="请选择">
                    <el-option
                      v-for="item in dict.gender"
                      :key="item.id"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="家长手机号（唯一标识）" prop="phone">
                  <el-input v-model="newUserForm.phone" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="家庭地址">
                  <el-input v-model="newUserForm.address" style="width: 370px;" />
                </el-form-item>
                <el-form-item label="家长邮箱">
                  <el-input v-model="newUserForm.email" style="width: 370px;" />
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button size="mini" type="text" @click="cancelAddUser">取消</el-button>
                <el-button :loading="addingUser" type="primary" @click="confirmAddUser">确认</el-button>
              </div>
            </el-dialog>
          </el-form-item>

          <el-form-item label="剩余次数">
            <!-- 次数，默认取卡种类中的次数.宽度与上边的下拉框同宽 -->
            <el-input v-model="form.remainingCount" style="width: 200px;" />
          </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>

      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="cardTypeName" label="卡种名称" />
        <el-table-column prop="userName" label="持卡人姓名" />
        <el-table-column prop="userPhone" label="持卡人手机号" />
        <el-table-column prop="remainingCount" label="剩余次数" />
        <el-table-column prop="createTime" label="开卡时间" />
        <el-table-column prop="updateTime" label="消费时间" />
        <el-table-column
          v-if="checkPer(['admin','bpCardInfo:edit','bpCardInfo:del'])"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              slot="left"
              v-permission="permission.edit"
              type="success"
              size="mini"
              icon="el-icon-money"
              @click="consume(scope.row)"
            >消费
            </el-button>
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudBpCardInfo from '@/api/bp/bpCardInfo'
import { getCardTypeInfo } from '@/api/bp/bpCardTypeInfo'
import bpParentalInfo, { getUserInfos } from '@/api/bp/bpParentalInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, cardTypeId: null, userId: null, remainingCount: null, createTime: null, updateTime: null }
export default {
  name: 'BpCardInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['parental_role', 'gender'],
  data() {
    return {
      cardTypes: [], // to store the card types
      selectedCardTypeId: null, // to store the selected card type ID
      userInfos: [], // to store the user infos
      permission: {
        add: ['admin', 'bpCardInfo:add'],
        edit: ['admin', 'bpCardInfo:edit'],
        del: ['admin', 'bpCardInfo:del']
      },
      rules: {},
      showAddUserDialog: false, // 控制新增用户弹窗的显示与隐藏
      newUserForm: {}, // 新增用户的表单数据
      newUserRules: {
        name: [
          { required: true, message: '家长姓名不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '家长手机号（唯一标识）不能为空', trigger: 'blur' }
        ]
      }, // 新增用户的表单验证规则
      addingUser: false // 正在执行新增用户的操作
    }
  },
  watch: {
    'form.cardTypeId': function(newCardTypeId) {
      const selectedCardType = this.cardTypes.find(item => item.id === newCardTypeId)
      if (selectedCardType) {
        this.form.remainingCount = selectedCardType.initialCardCount
      }
    }
  },
  cruds() {
    return CRUD({
      title: '卡信息管理',
      url: 'api/bpCardInfo',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudBpCardInfo }
    })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }, // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      getCardTypeInfo().then(res => {
        this.cardTypes = res.content
      })
      getUserInfos().then(res => {
        this.userInfos = res.content
      })
    }, consume(row) {
      // Show confirmation dialog
      this.$confirm('确认要消费吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // Decrease remainingCount by 1
        if (row.remainingCount > 0) {
          row.remainingCount--
          // Set the form data
          this.form = {
            id: row.id,
            cardTypeId: row.cardTypeId,
            userId: row.userId,
            remainingCount: row.remainingCount
          }
          // Submit the form
          crudBpCardInfo.edit(this.form).then(() => {
            // Refresh the table
            this.crud.refresh()
          })
        }
      }).catch(() => {
        // Do nothing if canceled
      })
    }, addNewUser() {
      // 显示新增用户弹窗
      this.showAddUserDialog = true
    },
    cancelAddUser() {
      // 取消新增用户
      this.showAddUserDialog = false
    },
    confirmAddUser() {
      // 执行新增用户的操作
      bpParentalInfo.add(this.newUserForm).then(() => {
        // 刷新用户列表
        bpParentalInfo.getUserInfos().then(res => {
          this.userInfos = res.content
        })
        // 清空新增用户的表单数据
        this.newUserForm = {}
      })
      // 关闭新增用户弹窗
      this.showAddUserDialog = false
    }
  }
}
</script>

<style scoped>

</style>
