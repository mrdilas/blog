<template>
    <div class="login-page">
      <div class="login-container">
        <div class="login-box">
            <h2 class="login-title">Авторизация</h2>

            <form autocomplete="off" @submit.prevent="handleLogin">

              <input
                autocomplete="username"
                name="username"
                type="text"
                style="display:none"
              >

              <div class="input-group">
                  <label for="login">Логин</label>
                  <input
                    id="login"
                    v-model="username"
                    type="text"
                    placeholder="Введите ваш логин"
                    class="login-input"
                    autocomplete="username"
                  />
              </div>

              <input
                autocomplete="new-password"
                name="password"
                type="password"
                style="display:none"
              >

              <div class="input-group">
                  <label for="password">Пароль</label>
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="Введите ваш пароль"
                    class="login-input"
                    autocomplete="password"
                  />
              </div>
              
              <button type="submit" class="login-button">Войти</button>
            </form>

            <button class="register-button" @click="handleRegister">Зарегистрироваться</button>
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
            console.log('Данные пользователя:', data); // Логирование
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('userRole', data.role)
            localStorage.setItem('firstName', data.first_name);
            localStorage.setItem('lastName', data.last_name);
            localStorage.setItem('userName', data.first_name + ' ' + data.last_name)
            this.$router.push(data.role === 'admin' ? '/admin' : '/user');

            console.log('Попытка перехода на страницу:', data.role === 'admin' ? '/admin' : '/user'); // Логирование
            const route = data.role === 'admin' ? '/admin' : '/user';
            console.log('Успешная авторизация. Переход на:', route);
            this.$router.push('/admin').catch(err => {
              console.error('Ошибка перехода:', err);
            });
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error('Ошибка при авторизации:', error);
          alert('Ошибка при подключении к серверу');
        }
      },
      handleRegister() {
        this.$router.push('/register')
        console.log(this.$router);
      }
    }
  }
  </script>
  
<style scoped>
  .login-page {
    background-image: url('~@/assets/window_dg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .login-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .login-box {
    width: 350px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    backdrop-filter: blur(5px);
  }
  
  .login-title {
    margin-bottom: 24px;
    color: #333;
    font-size: 24px;
  }
  
  .input-group {
    margin-bottom: 20px;
    text-align: left;
  }
  
  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  }
  
  .login-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
    transition: border-color 0.3s;
  }
  
  .login-input:focus {
    border-color: #646cff;
    outline: none;
  }
  
  .login-button {
    width: 100%;
    padding: 12px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-bottom: 10px;
  }
  
  .login-button:hover {
    background-color: #535bf2;
  }
  
  .register-button {
    width: 100%;
    padding: 10px;
    background-color: transparent;
    color: #646cff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .register-button:hover {
    color: #535bf2;
    text-decoration: underline;
  }
</style>