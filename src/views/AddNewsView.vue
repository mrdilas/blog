<template>
  <div class="add-news-page">
    <div class="add-news-container">
      <div class="add-news-box">
        <h2 class="add-news-title">Добавить новость</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="input-group">
            <label for="title">Заголовок</label>
            <input 
              id="title" 
              v-model="form.title" 
              type="text" 
              placeholder="Введите заголовок"
              required
            >
          </div>
          
          <div class="input-group">
            <label for="content">Содержание</label>
            <textarea 
              id="content" 
              v-model="form.content" 
              placeholder="Введите содержание новости"
              rows="5"
              required
            ></textarea>
          </div>
          
          <div class="input-group">
            <label for="image">Изображение</label>
            <input 
              id="image" 
              type="file" 
              accept="image/*"
              @change="handleImageUpload"
            >
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Предпросмотр">
            </div>
          </div>
          
          <div class="button-group">
            <button type="submit" class="submit-button">Опубликовать</button>
            <button type="button" class="cancel-button" @click="goBack">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddNewsView',
  data() {
    return {
      form: {
        title: '',
        content: '',
        image: null
      },
      imagePreview: null
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.image = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    async handleSubmit() {
      try {
        const formData = new FormData();
        formData.append('title', this.form.title);
        formData.append('content', this.form.content);
        if (this.form.image) {
          formData.append('image', this.form.image);
        }

        const response = await fetch('http://localhost:3000/api/posts', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          alert('Новость успешно добавлена!');
          this.$router.push('/news');
        } else {
          const error = await response.json();
          alert(error.error || 'Ошибка при добавлении новости');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при подключении к серверу');
      }
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.add-news-page {
  background-image: url('~@/assets/window_dg.jpg');
  background-size: cover;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-news-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-news-box {
  width: 500px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-news-title {
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.input-group textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
}

.submit-button {
  flex: 1;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}

.cancel-button {
  flex: 1;
  padding: 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

.image-preview {
  margin-top: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}
</style>