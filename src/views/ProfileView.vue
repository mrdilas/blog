<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-box">
        <h2 class="profile-title">Профиль</h2>
        
        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">Логин:</span>
            <span class="info-value">peter123</span>
          </div>
          <div class="info-row">
            <span class="info-label">Имя:</span>
            <span class="info-value">Петр</span>
          </div>
          <div class="info-row">
            <span class="info-label">Фамилия:</span>
            <span class="info-value">Петров</span>
          </div>
          <div class="info-row">
            <span class="info-label">Роль:</span>
            <span class="info-value">Пользователь</span>
          </div>
        </div>
        
        <button class="edit-button" @click="editProfile">Редактировать</button>
        <button class="back-button" @click="goBack">Назад</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  methods: {
    editProfile() {
      alert('Редактирование профиля');
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.profile-page {
  background-image: url('~@/assets/window_dg.jpg');
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-box {
  width: 350px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.profile-title {
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

.profile-info {
  margin-bottom: 20px;
  text-align: left;
}

.info-row {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-label {
  font-weight: 500;
  color: #555;
}

.info-value {
  color: #333;
}

.edit-button {
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

.edit-button:hover {
  background-color: #535bf2;
}

.back-button {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  color: #646cff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  transition: color 0.3s;
}

.back-button:hover {
  color: #535bf2;
  text-decoration: underline;
}
</style>