<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-box">
        <h2 class="profile-title">Профиль</h2>
        
        <div v-if="!isEditing" class="profile-info">
          <div class="avatar-container">
            <img v-if="user.avatar_url" :src="user.avatar_url + '?' + new Date().getTime()" class="avatar" alt="Аватар">
            <div v-else class="avatar-placeholder">
              {{ avatarInitials }}
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">Логин:</span>
            <span class="info-value">{{ user.login_entry }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Имя:</span>
            <span class="info-value">{{ user.first_name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Фамилия:</span>
            <span class="info-value">{{ user.last_name }}</span>
          </div>
          
          <div v-if="user.bio" class="info-row bio-row">
            <span class="info-label">О себе:</span>
            <span class="info-value">{{ user.bio }}</span>
          </div>
        </div>
        
        <form v-else @submit.prevent="saveProfile" class="edit-form" enctype="multipart/form-data">
          <div class="avatar-container">
            <img v-if="editForm.avatar_url" :src="editForm.avatar_url" class="avatar" alt="Аватар">
            <div v-else class="avatar-placeholder">
              {{ avatarInitials }}
            </div>
            <input 
              type="file" 
              accept="image/*"
              @change="handleAvatarUpload"
              class="avatar-input"
            >
          </div>
          <div class="form-group">
            <label for="first_name">Имя</label>
            <input id="first_name" v-model="editForm.first_name" type="text" required>
          </div>
          <div class="form-group">
            <label for="last_name">Фамилия</label>
            <input id="last_name" v-model="editForm.last_name" type="text" required>
          </div>
          <div class="form-group">
            <label for="bio">О себе</label>
            <textarea id="bio" v-model="editForm.bio" rows="3"></textarea>
          </div>
          <div class="button-group">
            <button type="submit" class="save-button">Сохранить</button>
            <button type="button" class="cancel-button" @click="cancelEdit">Отмена</button>
          </div>
        </form>
        
        <button v-if="!isEditing" class="edit-button" @click="startEditing">Редактировать</button>
        <button class="back-button" @click="goBack">Назад</button>
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
        avatar_url: ''
      }
    }
  },
  computed: {
    avatarInitials() {
      return (this.user.first_name.charAt(0) + this.user.last_name.charAt(0)).toUpperCase();
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
        const data = await response.json();
        this.user = data;
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      }
    },
    startEditing() {
      this.editForm = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        bio: this.user.bio || '',
        avatar_url: this.user.avatar_url || ''
      };
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },

    async saveProfile() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('ID пользователя не найден');
        }

        // 1. Создаем FormData для отправки файла и данных формы
        const formData = new FormData();
        formData.append('first_name', this.editForm.first_name);
        formData.append('last_name', this.editForm.last_name);
        formData.append('bio', this.editForm.bio || '');

        // 2. Добавляем файл аватара, если он был выбран
        if (this.editForm.avatar) {
          formData.append('avatar', this.editForm.avatar);
        }

        // 3. Отправляем запрос на сервер
        const response = await fetch(`http://localhost:3000/api/profile/${userId}`, {
          method: 'PUT',
          body: formData
          // Не устанавливаем Content-Type вручную - браузер сделает это автоматически
        });

        // 4. Обрабатываем ответ сервера
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Ошибка при обновлении профиля');
        }

        const updatedUser = await response.json();
        console.log('Обновленные данные пользователя:', updatedUser);

        // 5. Обновляем данные пользователя в компоненте
        this.user = {
          ...this.user,
          ...updatedUser
        };

        // 6. Принудительно обновляем URL аватара для избежания кэширования
        if (updatedUser.avatar_url) {
          this.user.avatar_url = `${updatedUser.avatar_url}?t=${Date.now()}`;
        }

        // 7. Обновляем имя пользователя в localStorage
        localStorage.setItem('userName', `${updatedUser.first_name} ${updatedUser.last_name}`);

        // 8. Выходим из режима редактирования
        this.isEditing = false;
        
        // 9. Уведомляем пользователя об успехе
        alert('Профиль успешно обновлен!');

      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        
        // 10. Показываем пользователю понятное сообщение об ошибке
        let errorMessage = 'Ошибка при обновлении профиля';
        if (error.message.includes('File too large')) {
          errorMessage = 'Размер файла слишком большой';
        } else if (error.message.includes('invalid file type')) {
          errorMessage = 'Недопустимый тип файла';
        }
        
        alert(errorMessage);
      }
    },
    
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editForm.avatar = file;
        this.editForm.avatar_url = URL.createObjectURL(file);
      }
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

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #646cff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.avatar-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.bio-row {
  align-items: flex-start;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.save-button {
  flex: 1;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}

.cancel-button {
  flex: 1;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #d32f2f;
}
</style>