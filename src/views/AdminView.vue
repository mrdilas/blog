<template>
  <div class="admin-page">
    <div class="admin-container">
      <h1 class="admin-title">Панель администратора</h1>
      
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Поиск пользователей..."
          class="search-input"
        >
      </div>

      <div class="users-list">
        <div v-for="user in filteredUsers" :key="user.id" class="user-card">
          <div class="user-header">
            <h3>{{ user.first_name }} {{ user.last_name }}</h3>
            <span class="user-login">@{{ user.login_entry }}</span>
            <span :class="['user-status', user.is_active ? 'active' : 'banned']">
              {{ user.is_active ? 'Активен' : 'Заблокирован' }}
            </span>
            <button 
              @click="toggleUserStatus(user.id, !user.is_active)"
              :class="['status-button', user.is_active ? 'ban' : 'unban']"
            >
              {{ user.is_active ? 'Заблокировать' : 'Разблокировать' }}
            </button>
          </div>

          <div class="user-posts">
            <h4>Посты пользователя ({{ user.posts.length }})</h4>
            
            <div v-if="user.posts.length === 0" class="no-posts">
              Пользователь еще не создал постов
            </div>

            <div v-for="post in user.posts" :key="post.id" class="post-item">
              <div class="post-header">
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
                <button 
                  @click="deletePost(post.id)"
                  class="delete-post-button"
                >
                  Удалить пост
                </button>
              </div>
              <h5 class="post-title">{{ post.title }}</h5>
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
      searchQuery: '',
      users: [
        {
          id: 1,
          login_entry: 'ivanov',
          first_name: 'Иван',
          last_name: 'Иванов',
          is_active: true,
          posts: [
            {
              id: 1,
              title: 'Мой первый пост',
              content: 'Это содержание моего первого поста в этом блоге.',
              created_at: '2023-05-15T10:30:00Z'
            },
            {
              id: 2,
              title: 'Второй пост',
              content: 'Продолжаю вести блог, вот мой второй пост.',
              created_at: '2023-05-16T14:45:00Z'
            }
          ]
        },
        {
          id: 2,
          login_entry: 'petrov',
          first_name: 'Петр',
          last_name: 'Петров',
          is_active: false,
          posts: [
            {
              id: 3,
              title: 'Привет всем',
              content: 'Я новый пользователь этого блога!',
              created_at: '2023-05-10T09:15:00Z'
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user => 
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.login_entry.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    async toggleUserStatus(userId, newStatus) {
      try {
        // Здесь будет запрос к API для изменения статуса пользователя
        const response = await fetch(`/api/users/${userId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: newStatus })
        });
        
        if (response.ok) {
          const userIndex = this.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            this.users[userIndex].is_active = newStatus;
          }
        } else {
          alert('Ошибка при изменении статуса пользователя');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    async deletePost(postId) {
      if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
      
      try {
        // Здесь будет запрос к API для удаления поста
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          this.users.forEach(user => {
            user.posts = user.posts.filter(post => post.id !== postId);
          });
        } else {
          alert('Ошибка при удалении поста');
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

.search-section {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
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
</style>