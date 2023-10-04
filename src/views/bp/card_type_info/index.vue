<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">卡种名称</label>
        <el-input v-model="query.cardName" clearable placeholder="卡种名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="卡种名称" prop="cardName">
            <el-input v-model="form.cardName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="次数" prop="initialCardCount">
            <el-input v-model="form.initialCardCount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="余额">
            <el-input v-model="form.initialCardBalance" style="width: 370px;" />
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
        <el-table-column prop="cardName" label="卡种名称" />
        <el-table-column prop="initialCardCount" label="次数" />
        <el-table-column prop="initialCardBalance" label="余额" />
        <el-table-column v-if="checkPer(['admin','bpCardTypeInfo:edit','bpCardTypeInfo:del'])" label="操作" width="150px" align="center">
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
import crudBpCardTypeInfo from '@/api/bp/bpCardTypeInfo'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, cardName: null, initialCardCount: null, initialCardBalance: null }
export default {
  name: 'BpCardTypeInfo',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '卡种信息', url: 'api/bpCardTypeInfo', idField: 'id', sort: 'id,desc', crudMethod: { ...crudBpCardTypeInfo }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'bpCardTypeInfo:add'],
        edit: ['admin', 'bpCardTypeInfo:edit'],
        del: ['admin', 'bpCardTypeInfo:del']
      },
      rules: {
        cardName: [
          { required: true, message: '卡种名称不能为空', trigger: 'blur' }
        ],
        initialCardCount: [
          { required: true, message: '初始卡的次数不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'cardName', display_name: '卡种名称' }
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
