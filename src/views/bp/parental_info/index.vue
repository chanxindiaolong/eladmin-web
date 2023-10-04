<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <!--        家长姓名搜索-->

        <!--家长角色使用字典下拉框-->
        <label class="el-form-item-label">家长角色</label>
        <el-select v-model="query.role" filterable placeholder="请选择" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option
            v-for="item in dict.parental_role"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">家长手机号（唯一标识）</label>
        <el-input v-model="query.phone" clearable placeholder="家长手机号（唯一标识）" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">家庭地址</label>
        <el-input v-model="query.address" clearable placeholder="家庭地址" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">家长邮箱</label>
        <el-input v-model="query.email" clearable placeholder="家长邮箱" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="家长姓名" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="家长角色">
            <el-select v-model="form.role" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.parental_role"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="家长性别">
            <el-select v-model="form.gender" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.gender"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="家长手机号（唯一标识）" prop="phone">
            <el-input v-model="form.phone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="家庭地址">
            <el-input v-model="form.address" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="家长邮箱">
            <el-input v-model="form.email" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="家长姓名" />
        <el-table-column prop="role" label="家长角色">
          <template slot-scope="scope">
            {{ dict.label.parental_role[scope.row.role] }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="家长性别">
          <template slot-scope="scope">
            {{ dict.label.gender[scope.row.gender] }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="家长手机号（唯一标识）" />
        <el-table-column prop="address" label="家庭地址" />
        <el-table-column prop="email" label="家长邮箱" />
        <el-table-column v-if="checkPer(['admin','bpParentalInfo:edit','bpParentalInfo:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
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
import crudBpParentalInfo from '@/api/bp/bpParentalInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation.vue'
import crudOperation from '@crud/CRUD.operation.vue'
import udOperation from '@crud/UD.operation.vue'
import pagination from '@crud/Pagination.vue'

const defaultForm = { id: null, name: null, role: null, gender: null, phone: null, address: null, email: null }
export default {
  name: 'BpParentalInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['parental_role', 'gender'],
  cruds() {
    return CRUD({ title: '家长信息管理', url: 'api/bpParentalInfo', idField: 'id', sort: 'id,desc', crudMethod: { ...crudBpParentalInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'bpParentalInfo:add'],
        edit: ['admin', 'bpParentalInfo:edit'],
        del: ['admin', 'bpParentalInfo:del']
      },
      rules: {
        name: [
          { required: true, message: '家长姓名不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '家长手机号（唯一标识）不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'gender', display_name: '家长性别' },
        { key: 'phone', display_name: '家长手机号（唯一标识）' },
        { key: 'address', display_name: '家庭地址' },
        { key: 'email', display_name: '家长邮箱' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
