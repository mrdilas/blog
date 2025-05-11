<template>
  <div class="news-page">
    <div class="user-panel">
      <div class="user-info">
        Петр Петров
      </div>
      <button class="profile-button" @click="goToProfile">Профиль</button>
    </div>
    
    <div class="news-container">
      <div class="news-box">
        <h2 class="news-title">Новости</h2>
        
        <div class="news-item" v-for="(news, index) in newsList" :key="index">
          <h3 class="news-item-title">{{ news.title }}</h3>
          <p class="news-item-content">{{ news.content }}</p>
          <div class="news-item-date">{{ news.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsView',
  data() {
    return {
      newsList: [
        {
          title: 'Обновление системы',
          content: 'Запланировано техническое обслуживание системы 15.05.2023 с 00:00 до 03:00.',
          date: '10.05.2023'
        },
        {
          title: 'Новые возможности',
          content: 'Добавлена возможность редактирования профиля. Теперь вы можете изменить свои данные в любое время.',
          date: '05.05.2023'
        },
        {
          title: 'Добро пожаловать!',
          content: 'Мы рады приветствовать вас в нашей системе. Надеемся, вам здесь понравится!',
          date: '01.05.2023'
        }
      ]
    }
  },
  methods: {
    goToProfile() {
      this.$router.push('/profile');
    }
  }
}
</script>

<style scoped>
.news-page {
  background-image: url('~@/assets/window_dg.jpg');
  background-size: cover;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.user-panel {
  width: 350px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  font-weight: 500;
  color: #333;
}

.profile-button {
  padding: 8px 16px;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.profile-button:hover {
  background-color: #535bf2;
}

.news-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.news-box {
  width: 350px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.news-title {
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
  text-align: center;
}

.news-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.news-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.news-item-title {
  color: #333;
  font-size: 18px;
  margin-bottom: 8px;
}

.news-item-content {
  color: #555;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.news-item-date {
  color: #888;
  font-size: 12px;
  text-align: right;
}
</style>