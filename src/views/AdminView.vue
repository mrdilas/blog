<template>
  <div class="container">
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
  </div>
</template>

<script>
export default {
  name: 'AdminView',
  data() {
    return {
      users: [],
      baseUrl: '../server/uploads/'
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

</style>
