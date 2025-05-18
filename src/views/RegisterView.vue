<template>
  <div class="container">
  <div class="register-page">
    <div class="register-container">
      <form autocomplete="off">
        <div class="register-box">
          <h2 class="register-title">Регистрация</h2>
          <div class="input-group">
            <label for="login">Логин</label>
            <input 
              id="login" 
              v-model="form.login_entry" 
              type="text" 
              class="register-input"
              placeholder="Введите логин"
              autocomplete="new-username"
            >
            <span class="error-message" v-if="errors.login_entry">{{ errors.login_entry }}</span>
          </div>
          <div class="input-group">
            <label for="password">Пароль</label>
            <input 
              id="password" 
              v-model="form.password_entry" 
              type="password" 
              class="register-input"
              placeholder="Введите пароль"
              autocomplete="new-password"
            >
            <span class="error-message" v-if="errors.password_entry">{{ errors.password_entry }}</span>
          </div>
          <div class="input-group">
            <label for="first_name">Имя</label>
            <input 
              id="first_name" 
              v-model="form.first_name" 
              type="text" 
              class="register-input"
              placeholder="Введите имя"
            >
            <span class="error-message" v-if="errors.first_name">{{ errors.first_name }}</span>
          </div>
          <div class="input-group">
            <label for="last_name">Фамилия</label>
            <input 
              id="last_name" 
              v-model="form.last_name" 
              type="text" 
              class="register-input"
              placeholder="Введите фамилию"
            >
            <span class="error-message" v-if="errors.last_name">{{ errors.last_name }}</span>
          </div>
          
          <button class="register-button" @click="handleRegister">Зарегистрироваться</button>
          <button class="exit-button" @click="handleExit">Назад</button>
        </div>
      </form>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        login_entry: '',
        password_entry: '',
        first_name: '',
        last_name: '',
        role: 'user'
      },
      isAdmin: localStorage.getItem('userRole') === 'admin',
      errors: {}
    }
  },
  methods: {
    validateForm() {
      this.errors = {};
      let isValid = true;
      
      if (!this.form.login_entry.trim()) {
        this.errors.login_entry = 'Логин обязателен';
        isValid = false;
      }
      
      if (!this.form.password_entry.trim()) {
        this.errors.password_entry = 'Пароль обязателен';
        isValid = false;
      }
      
      if (!this.form.first_name.trim()) {
        this.errors.first_name = 'Имя обязательно';
        isValid = false;
      }
      
      if (!this.form.last_name.trim()) {
        this.errors.last_name = 'Фамилия обязательна';
        isValid = false;
      }
      
      return isValid;
    },
    async handleRegister() {
      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form)
        });
         
        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          this.$router.push(this.isAdmin ? '/admin' : '/');
        } else {
          alert(data.error || 'Ошибка при регистрации');
        }
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    handleExit() {
      this.$router.push('/')
      console.log(this.$router);
    }
  }
}
</script>
<style scoped>

</style>
