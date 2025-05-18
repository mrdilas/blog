<template>
  <div class="container">
  <div class="tg-add-news-page">
    <div class="tg-add-news-container">
      <div class="tg-add-news-box">
        <h2 class="tg-add-news-title">Добавить новость</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="tg-input-group">
            <input 
              id="title" 
              v-model="form.title" 
              type="text" 
              placeholder="Заголовок"
              class="tg-input"
              required
            >
          </div>
          
          <div class="tg-input-group">
            <textarea 
              id="content" 
              v-model="form.content" 
              placeholder="Содержание новости"
              class="tg-textarea"
              rows="8"
              required
            ></textarea>
          </div>
          
          <div class="tg-input-group">
            <label class="tg-file-label">
              <input 
                type="file" 
                accept="image/*"
                @change="handleImageUpload"
                class="tg-file-input"
              >
              <span class="tg-file-button">Выбрать изображение</span>
              <span v-if="form.image" class="tg-file-name">{{ form.image.name }}</span>
            </label>
            <div v-if="imagePreview" class="tg-image-preview">
              <img :src="imagePreview" alt="Предпросмотр">
            </div>
          </div>
          
          <div class="tg-button-group">
            <button type="submit" class="tg-primary-button">Опубликовать</button>
            <button type="button" class="tg-secondary-button" @click="goBack">Отмена</button>
          </div>
        </form>
      </div>
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
      imagePreview: null,
      baseUrl: '../server/uploads/'
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
        formData.append('userId', localStorage.getItem('userId'));
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
/* Добавьте в стили AddNewsView */
.tg-image-preview {
  max-width: 300px;
  max-height: 200px;
  margin: 1rem 0;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tg-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>
