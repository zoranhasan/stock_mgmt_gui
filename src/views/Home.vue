<template>
  <div class="home container">
    <img alt="Vue logo" src="../assets/logo.png">
    <div class="form-group">
      <label for="userInput" class="h2">填写密钥</label>
      <input 
        type="text" 
        class="form-control" 
        id="userInput" 
        v-model="inputText" 
        placeholder="输入密钥" 
      />
    </div>
  </div>
</template>

<script>

export default {
  name: 'HomeView',
  components: {
    
  },
  data() {
    return {
      inputText: localStorage.getItem('ApiKey') || '', // Get from localStorage if available
    };
  },
  watch: {
    inputText(newValue) {
      // Save the input value to localStorage whenever it changes
      localStorage.setItem('ApiKey', newValue);
    }
  }
}
</script>
