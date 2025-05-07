<template>
  <div class="create-page">
    <el-form :model="form">
      <el-form-item label="前文内容">
        <el-input type="textarea" v-model="form.prevText" rows="4"/>
      </el-form-item>
      <el-form-item label="创作提示">
        <el-input v-model="form.prompt" placeholder="请输入创作关键词或提示"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="generate">生成章节</el-button>
      </el-form-item>
    </el-form>
    <div v-if="result.content">
      <h3>{{ result.title }}</h3>
      <p>{{ result.content }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';

const form = reactive({
  prevText: '',
  prompt: ''
});
const result = reactive({
  title: '',
  content: ''
});

async function generate() {
  try {
    const res = await axios.post('http://localhost:3000/api/create', form);
    result.title = res.data.title;
    result.content = res.data.content;
  } catch (e) {
    console.error(e);
    this.$message.error('生成失败');
  }
}
</script>
