<template>
  <div class="container">
  <div class="tg-login-page">
    <div class="tg-login-container">
      <div class="tg-login-box">
        <h2 class="tg-login-title">Авторизация</h2>

        <form autocomplete="off" @submit.prevent="handleLogin">
          <div class="tg-input-group">
            <input
              id="login"
              v-model="username"
              type="text"
              placeholder="Логин"
              class="tg-input"
              autocomplete="username"
            />
          </div>

          <div class="tg-input-group">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Пароль"
              class="tg-input"
              autocomplete="current-password"
            />
          </div>
          
          <button type="submit" class="tg-primary-button">Войти</button>
        </form>

        <button class="tg-secondary-button" @click="handleRegister">Зарегистрироваться</button>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  
  created() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  },

  methods: {
    async handleLogin() {
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            login_entry: this.username,
            password_entry: this.password,
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('userId', data.id);
          localStorage.setItem('userName', `${data.first_name} ${data.last_name}`);
          
          if (data.role === 'admin') {
            this.$router.push('/admin');
          } else {
            this.$router.push('/news');
          }
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Ошибка при авторизации:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    handleRegister() {
      this.$router.push('/register');
    }
  }
}
</script>
<style scoped>

</style>
