<template>
  <div class="setting-page">
    <el-form :inline="true" @submit.native.prevent="addSetting">
      <el-form-item label="类型">
        <el-input v-model="newSetting.type" placeholder="如 '角色'"/>
      </el-form-item>
      <el-form-item label="内容(JSON)">
        <el-input v-model="newSetting.dataStr" placeholder='如 {"name":"主角"}'/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addSetting">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="settings" style="width: 100%; margin-top:20px">
      <el-table-column prop="id" label="ID" width="50"/>
      <el-table-column prop="type" label="类型" width="100"/>
      <el-table-column label="内容">
        <template #default="scope">
          {{ JSON.parse(scope.row.data).name }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="mini" @click="editSetting(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteSetting(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 编辑 Dialog -->
    <el-dialog title="编辑设定" :visible.sync="editDialog">
      <el-form>
        <el-form-item label="类型">
          <el-input v-model="editForm.type"/>
        </el-form-item>
        <el-form-item label="内容(JSON)">
          <el-input v-model="editForm.dataStr"/>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialog=false">取消</el-button>
        <el-button type="primary" @click="updateSetting">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const settings = ref([]);
const newSetting = ref({ type: '', dataStr: '' });
const editDialog = ref(false);
const editForm = ref({ id: null, type: '', dataStr: '' });

async function fetchSettings() {
  const res = await axios.get('http://localhost:3000/api/setting');
  settings.value = res.data;
}

function addSetting() {
  try {
    const data = JSON.parse(newSetting.value.dataStr);
    axios.post('http://localhost:3000/api/setting', { type: newSetting.value.type, data })
      .then(() => {
        newSetting.value = { type: '', dataStr: '' };
        fetchSettings();
      });
  } catch {
    alert('JSON格式错误');
  }
}

function editSetting(row) {
  editForm.value = { id: row.id, type: row.type, dataStr: row.data };
  editDialog.value = true;
}

function updateSetting() {
  try {
    const data = JSON.parse(editForm.value.dataStr);
    axios.put(`http://localhost:3000/api/setting/${editForm.value.id}`, { type: editForm.value.type, data })
      .then(() => {
        editDialog.value = false;
        fetchSettings();
      });
  } catch {
    alert('JSON格式错误');
  }
}

function deleteSetting(id) {
  axios.delete(`http://localhost:3000/api/setting/${id}`)
    .then(() => fetchSettings());
}

onMounted(fetchSettings);
</script>
