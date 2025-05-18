<template>
  <div class="container">
  <div class="tg-news-page">
    <div class="tg-user-panel">
      <div class="tg-user-info">
        {{ userName }}
      </div>
      <div class="tg-buttons-group">
        <button class="tg-primary-button" @click="goToProfile">
          <i class="fas fa-user"></i> Профиль
        </button>
        <button class="tg-primary-button" @click="goToAddNews">
          <i class="fas fa-plus"></i> Добавить новость
        </button>
        <button class="tg-danger-button" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Выйти
        </button>
      </div>
    </div>
    
    <div class="tg-news-container">
      <h2 class="tg-news-title">Новости</h2>
      
      <div class="tg-news-list">
        <div class="tg-news-item" v-for="(news, index) in filteredNews" :key="index">
          <div v-if="!news.isUserBanned">
            <div class="tg-news-header">
              <h3 class="tg-news-item-title">{{ news.title }}</h3>
              <span class="tg-news-item-date">{{ formatDate(news.created_at) }}</span>
            </div>
            
            <img 
              v-if="news.image_url" 
              :src="news.image_url" 
              class="tg-news-image" 
              alt="News image"
            >
            
            <p class="tg-news-item-content">{{ news.content }}</p>
            
            <div class="tg-news-footer">
              <span class="tg-news-item-author">{{ news.author }}</span>
              <button 
                v-if="isCurrentUserPost(news.user_id)"
                @click="deletePost(news.id)"
                class="tg-delete-button"
              >
                Удалить
              </button>
            </div>
          </div>
          <div v-else class="tg-banned-user-message">
            Аккаунт пользователя заблокирован
          </div>
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
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

</style>
