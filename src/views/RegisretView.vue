<template>
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
.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.register-page {
  background-image: url('~@/assets/window_dg.jpg');
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-box {
  width: 350px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.register-title {
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

.register-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.register-button:hover {
    background-color: #535bf2;
  }

.exit-button {
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
  
  .exit-button:hover {
    color: #535bf2;
    text-decoration: underline;
  }
</style>