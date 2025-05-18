<template>
  <div class="container">
  <div class="tg-profile-page">
    <div class="tg-profile-container">
      <div class="tg-profile-box">
        <h2 class="tg-profile-title">Профиль</h2>
        
        <div v-if="!isEditing" class="tg-profile-info">
          <div class="tg-avatar-container">
            <img v-if="fullAvatarUrl" :src="fullAvatarUrl" class="tg-avatar" alt="Аватар">
            <div v-else class="tg-avatar-placeholder">
              {{ avatarInitials }}
            </div>
          </div>

          <div class="tg-profile-details">
            <div class="tg-detail-item">
              <span class="tg-detail-label">Логин:</span>
              <span class="tg-detail-value">{{ user.login_entry }}</span>
            </div>
            <div class="tg-detail-item">
              <span class="tg-detail-label">Имя:</span>
              <span class="tg-detail-value">{{ user.first_name }}</span>
            </div>
            <div class="tg-detail-item">
              <span class="tg-detail-label">Фамилия:</span>
              <span class="tg-detail-value">{{ user.last_name }}</span>
            </div>
            
            <div v-if="user.bio" class="tg-detail-item tg-bio">
              <span class="tg-detail-label">О себе:</span>
              <p class="tg-detail-value">{{ user.bio }}</p>
            </div>
          </div>

          <div class="tg-profile-actions">
            <button class="btn btn-primary" @click="startEditing">Редактировать</button>
            <button class="btn btn-secondary" @click="goBack">Назад</button>
          </div>
        </div>
        
        <form v-else @submit.prevent="saveProfile" class="tg-edit-form" enctype="multipart/form-data">
          <div class="tg-avatar-container">
            <img v-if="editForm.avatarPreview" :src="editForm.avatarPreview" class="tg-avatar" alt="Аватар">
            <div v-else class="tg-avatar-placeholder">
              {{ avatarInitials }}
            </div>
            <input 
              type="file" 
              accept="image/*"
              @change="handleAvatarUpload"
              class="tg-avatar-input"
            >
          </div>
          <div class="tg-form-group">
            <label for="first_name">Имя</label>
            <input id="first_name" v-model="editForm.first_name" type="text" required>
          </div>
          <div class="tg-form-group">
            <label for="last_name">Фамилия</label>
            <input id="last_name" v-model="editForm.last_name" type="text" required>
          </div>
          <div class="tg-form-group">
            <label for="bio">О себе</label>
            <textarea id="bio" v-model="editForm.bio" rows="3"></textarea>
          </div>
          <div class="tg-button-group">
            <button type="submit" class="tg-save-button">Сохранить</button>
            <button type="button" class="tg-cancel-button" @click="cancelEdit">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      user: {
        login_entry: '',
        first_name: '',
        last_name: '',
        role: '',
        bio: '',
        avatar_url: '' 
      },
      isEditing: false,
      editForm: {
        first_name: '',
        last_name: '',
        bio: '',
        avatar: null,
        avatarPreview: ''
      },
      baseUrl: '../server/uploads/'
    }
  },
  computed: {
    avatarInitials() {
      return (this.user.first_name.charAt(0) + this.user.last_name.charAt(0)).toUpperCase();
    },
    fullAvatarUrl() {
      return this.user.avatar_url ? `${this.baseUrl}${this.user.avatar_url}` : '';
    }
  },
  async created() {
    await this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      const userId = localStorage.getItem('userId');
      
      try {
        const response = await fetch(`http://localhost:3000/api/profile/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.user = data;
        
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        alert('Не удалось загрузить данные профиля');
      }
    },
    
    startEditing() {
      this.editForm = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        bio: this.user.bio || '',
        avatar: null,
        avatarPreview: this.fullAvatarUrl
      };
      this.isEditing = true;
    },
    
    async saveProfile() {
      const userId = localStorage.getItem('userId');
      
      try {
        const formData = new FormData();
        formData.append('first_name', this.editForm.first_name);
        formData.append('last_name', this.editForm.last_name);
        formData.append('bio', this.editForm.bio || '');

        if (this.editForm.avatar) {
          formData.append('avatar', this.editForm.avatar);
        }

        const response = await fetch(`http://localhost:3000/api/profile/${userId}`, {
          method: 'PUT',
          body: formData
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Ошибка при обновлении профиля');
        }

        const updatedUser = await response.json();
        this.user = updatedUser;
        this.isEditing = false;
        
        localStorage.setItem('userName', `${this.user.first_name} ${this.user.last_name}`);
        
        alert('Профиль успешно обновлен!');
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        alert(error.message || 'Ошибка при обновлении профиля');
      }
    },
    
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editForm.avatar = file;
        this.editForm.avatarPreview = URL.createObjectURL(file);
      }
    },
    
    cancelEdit() {
      this.isEditing = false;
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.tg-profile-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tg-avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.tg-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #4f46e5;
}

.tg-avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.tg-profile-details {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tg-detail-item {
  margin-bottom: 1rem;
}

.tg-detail-label {
  font-weight: 600;
  color: #4f46e5;
  display: block;
  margin-bottom: 0.3rem;
}

.tg-detail-value {
  font-size: 1rem;
  color: #374151;
}

.tg-bio .tg-detail-value {
  white-space: pre-line;
  line-height: 1.6;
}

.tg-profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
