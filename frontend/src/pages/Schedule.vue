<template>
  <div class="schedule-page">
    <el-form :inline="true" @submit.native.prevent="addSchedule">
      <el-form-item label="日期">
        <el-date-picker v-model="newItem.date" type="date" placeholder="选择日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="目标字数">
        <el-input-number v-model="newItem.target" :min="1"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addSchedule">新增</el-button>
      </el-form-item>
    </el-form>
    <el-calendar :cell-class-name="dateClass" style="margin-top:20px" />
    <el-table :data="items" style="width: 100%; margin-top:20px">
      <el-table-column prop="id" label="ID" width="50"/>
      <el-table-column prop="date" label="日期"/>
      <el-table-column prop="target" label="目标字数"/>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="mini" @click="prepareEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteSchedule(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="编辑计划" :visible.sync="editDialog">
      <el-form>
        <el-form-item label="日期">
          <el-date-picker v-model="editItem.date" type="date"></el-date-picker>
        </el-form-item>
        <el-form-item label="目标字数">
          <el-input-number v-model="editItem.target" :min="1"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialog=false">取消</el-button>
        <el-button type="primary" @click="updateSchedule">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const items = ref([]);
const newItem = ref({ date: '', target: 0 });
const editDialog = ref(false);
const editItem = ref({ id: null, date: '', target: 0 });

async function fetchSchedule() {
  const res = await axios.get('http://localhost:3000/api/schedule');
  items.value = res.data;
}

function dateClass({ date, data }) {
  const formatted = date.toISOString().split('T')[0];
  const idx = items.value.find(i => i.date === formatted);
  if (idx) return 'has-schedule';
  return '';
}

function addSchedule() {
  axios.post('http://localhost:3000/api/schedule', newItem.value)
    .then(() => { newItem.value = { date: '', target: 0 }; fetchSchedule(); });
}

function prepareEdit(row) {
  editItem.value = { ...row };
  editDialog.value = true;
}

function updateSchedule() {
  axios.put(`http://localhost:3000/api/schedule/${editItem.value.id}`, {
    date: editItem.value.date, target: editItem.value.target
  }).then(() => { editDialog.value = false; fetchSchedule(); });
}

function deleteSchedule(id) {
  axios.delete(`http://localhost:3000/api/schedule/${id}`)
    .then(() => fetchSchedule());
}

onMounted(fetchSchedule);
</script>

<style scoped>
.has-schedule .el-calendar-day__number {
  background-color: #f90 !important;
  color: #fff;
  border-radius: 50%;
}
</style>
