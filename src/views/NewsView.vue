<template>
  <div class="news-page">
    <div class="user-panel">
      <div class="user-info">
        {{ userName }}
      </div>
      <button class="profile-button" @click="goToProfile">Профиль</button>
      <button class="add-news-button" @click="goToAddNews">Добавить новость</button>
      <button class="logout-button" @click="handleLogout">Выйти</button>
    </div>
    
    <div class="news-container">
      <div class="news-box">
        <h2 class="news-title">Новости</h2>
        
        <div class="news-item" v-for="(news, index) in filteredNews" :key="index">
          <div v-if="!news.isUserBanned">
            <h3 class="news-item-title">{{ news.title }}</h3>
            <img v-if="news.image_url" :src="news.image_url" class="news-image" alt="News image">
            <p class="news-item-content">{{ news.content }}</p>
            <div class="news-item-footer">
              <span class="news-item-author">{{ news.author }}</span>
              <span class="news-item-date">{{ formatDate(news.created_at) }}</span>
              <button 
                v-if="isCurrentUserPost(news.user_id)"
                @click="deletePost(news.id)"
                class="delete-button"
              >
                Удалить
              </button>
            </div>
          </div>
          <div v-else class="banned-user-message">
            Аккаунт пользователя заблокирован
          </div>
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
      newsList: [],
      userName: localStorage.getItem('userName') || 'Пользователь',
      userId: localStorage.getItem('userId') || null,
      baseUrl: '../server/uploads/'
    }
  },
  computed: {
    filteredNews() {
      return this.newsList.map(news => {
        return {
          ...news,
          isUserBanned: !news.is_active,
          image_url: news.image_url ? `${this.baseUrl}${news.image_url}` : null
        };
      });
    }
  },
  async created() {
    await this.fetchNews();
  },
  methods: {
    isCurrentUserPost(postUserId) {
      return postUserId && this.userId && 
            postUserId.toString() === this.userId.toString();
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    goToProfile() {
      this.$router.push('/profile');
    },
    goToAddNews() {
      this.$router.push('/add-news');
    },
    async fetchNews() {
      try {
        const response = await fetch('http://localhost:3000/api/posts');
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Ожидался массив новостей');
        }

        this.newsList = data.map(post => ({
          ...post,
          author: post.author || 'Неизвестный автор',
          is_active: post.is_active !== undefined ? post.is_active : true,
          user_id: post.user_id || null
        }));
        
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        alert('Не удалось загрузить новости. Пожалуйста, попробуйте позже.');
      }
    },
    handleLogout() {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      this.$router.push('/');
    },
    async deletePost(postId) {
      if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          await this.fetchNews();
          alert('Новость успешно удалена');
        } else {
          alert('Ошибка при удалении новости');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при подключении к серверу');
      }
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
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.news-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.news-item-author {
  color: #666;
  font-size: 14px;
}

.news-item-date {
  color: #888;
  font-size: 12px;
}

.add-news-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.add-news-button:hover {
  background-color: #45a049;
}

.news-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 4px;
  margin: 10px 0;
}

.banned-user-message {
  color: #ff4d4f;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.delete-button {
  padding: 4px 8px;
  background-color: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-button:hover {
  background-color: #ffcdd2;
}

.logout-button {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>