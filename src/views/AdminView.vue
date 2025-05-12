<template>
  <div class="admin-page">
    <div class="admin-container">
      <h1 class="admin-title">Панель администратора</h1>
      <button class="logout-button" @click="handleLogout">Выйти</button>

      <div class="users-list">
        <div v-for="user in users" :key="user.id" class="user-card">
          <div class="user-header">
            <div class="user-avatar">
              <img v-if="user.avatar_url" :src="fullImageUrl(user.avatar_url)" class="avatar" alt="Аватар">
              <div v-else class="avatar-placeholder">
                {{ getInitials(user.first_name, user.last_name) }}
              </div>
            </div>
            <div class="user-info">
              <h3>{{ user.first_name }} {{ user.last_name }}</h3>
              <span class="user-login">@{{ user.login_entry }}</span>
              <span :class="['user-status', user.is_active ? 'active' : 'banned']">
                {{ user.is_active ? 'Активен' : 'Заблокирован' }}
              </span>
            </div>
            <button 
              @click="toggleUserStatus(user.id, !user.is_active)"
              :class="['status-button', user.is_active ? 'ban' : 'unban']"
            >
              {{ user.is_active ? 'Заблокировать' : 'Разблокировать' }}
            </button>
          </div>

          <div class="user-posts">
            <h4>Новости пользователя ({{ user.posts.length }})</h4>
            
            <div v-if="user.posts.length === 0" class="no-posts">
              Пользователь еще не создал новостей
            </div>

            <div v-for="post in user.posts" :key="post.id" class="post-item">
              <div class="post-header">
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
                <button 
                  @click="deletePost(post.id)"
                  class="delete-post-button"
                >
                  Удалить новость
                </button>
              </div>
              <h5 class="post-title">{{ post.title }}</h5>
              <img v-if="post.image_url" :src="fullImageUrl(post.image_url)" class="post-image" alt="Post image">
              <p class="post-content">{{ post.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminView',
  data() {
    return {
      users: [],
      baseUrl: '../server' // Добавляем baseUrl
    }
  },
  computed: {
    getInitials() {
      return (firstName, lastName) => (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    },
    fullImageUrl() {
      return (filename) => filename ? `${this.baseUrl}${filename}` : '';
    }
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    getInitials(firstName, lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    async fetchUsers() {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        // Фильтруем только обычных пользователей (не админов)
        this.users = data.filter(user => user.role === 'user');
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    },
    async toggleUserStatus(userId, newStatus) {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: newStatus })
        });
        
        if (response.ok) {
          await this.fetchUsers();
          alert(`Пользователь успешно ${newStatus ? 'разблокирован' : 'заблокирован'}`);
        } else {
          alert('Ошибка при изменении статуса пользователя');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    async deletePost(postId) {
      if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await this.fetchUsers();
          alert('Новость успешно удалена');
        } else {
          alert('Ошибка при удалении новости');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    handleLogout() {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.admin-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-title {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.user-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.user-login {
  color: #666;
  font-style: italic;
}

.user-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.user-status.active {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.user-status.banned {
  background-color: #ffebee;
  color: #c62828;
}

.status-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: auto;
}

.status-button.ban {
  background-color: #ffebee;
  color: #c62828;
}

.status-button.unban {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.status-button:hover {
  opacity: 0.8;
}

.user-posts {
  margin-top: 15px;
}

.no-posts {
  color: #666;
  font-style: italic;
  padding: 10px;
}

.post-item {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-date {
  color: #666;
  font-size: 14px;
}

.delete-post-button {
  padding: 5px 10px;
  background-color: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-post-button:hover {
  opacity: 0.8;
}

.post-title {
  margin: 0 0 10px 0;
  color: #333;
}

.post-content {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.user-avatar {
  margin-right: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #646cff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-header {
  display: flex;
  align-items: center;
}

.user-info {
  flex-grow: 1;
}

.post-image {
  max-width: 100%;
  border-radius: 4px;
  margin: 10px 0;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logout-button {
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #d32f2f;
}
</style>