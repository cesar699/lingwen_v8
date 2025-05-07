<template>
  <div class="chapter-page">
    <el-space>
      <el-button type="primary" @click="exportTxt">导出小说 (TXT)</el-button>
      <el-button type="primary" @click="exportEpub">导出小说 (EPUB)</el-button>
      <el-button type="primary" @click="exportDocx">导出小说 (Word)</el-button>
    </el-space>
    <el-table :data="chapters" style="width: 100%; margin-top:20px">
      <el-table-column prop="id" label="ID" width="50"/>
      <el-table-column prop="title" label="标题"/>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="mini" @click="viewChapter(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="selected.content" style="margin-top:20px">
      <h3>{{ selected.title }}</h3>
      <p>{{ selected.content }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const chapters = ref([]);
const selected = ref({});

async function fetchChapters() {
  const res = await axios.get('http://localhost:3000/api/chapter');
  chapters.value = res.data;
}

function viewChapter(row) {
  selected.value = row;
}

async function exportTxt() {
  const res = await axios.post('http://localhost:3000/api/export');
  window.open('http://localhost:3000' + res.data.link, '_blank');
}
async function exportEpub() {
  const res = await axios.post('http://localhost:3000/api/export/epub');
  window.open('http://localhost:3000' + res.data.link, '_blank');
}
async function exportDocx() {
  const res = await axios.post('http://localhost:3000/api/export/docx');
  window.open('http://localhost:3000' + res.data.link, '_blank');
}

onMounted(fetchChapters);
</script>
