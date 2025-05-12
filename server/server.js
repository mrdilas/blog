// server.js
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const saltRounds = 10;

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Создаем приложение Express
const app = express();

// Middleware для парсинга JSON
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Инициализация Sequelize
const sequelize = new Sequelize('blog', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log,
  define: {
    timestamps: false
  }
});

// Определение моделей
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  login_entry: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true
  },
  password_entry: {
    type: DataTypes.STRING(256),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'users',
});

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'posts',
});

const UserAction = sequelize.define('UserAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action_type: {
    type: DataTypes.ENUM(
      'create_post', 
      'edit_post', 
      'delete_post', 
      'edit_profile', 
      'delete_account',
      'login',
      'register',
      'ban_user',
      'unban_user'
    ),
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  action_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  performed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_actions',
});

// Связи между таблицами
User.hasMany(Post, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  as: 'posts'
});
Post.belongsTo(User, { 
  foreignKey: 'user_id',
  as: 'User'
});

User.hasMany(UserAction, { 
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});
UserAction.belongsTo(User, { 
  foreignKey: 'user_id'
});

// Хуки для логирования действий
User.afterUpdate(async (user, options) => {
  await UserAction.create({
    user_id: user.id,
    action_type: 'edit_profile',
    action_details: JSON.stringify(user.changed()),
    ip_address: options.ip
  });
});

Post.afterCreate(async (post, options) => {
  await UserAction.create({
    user_id: post.user_id,
    action_type: 'create_post',
    target_id: post.id,
    ip_address: options.ip
  });
});

Post.afterUpdate(async (post, options) => {
  await UserAction.create({
    user_id: post.user_id,
    action_type: 'edit_post',
    target_id: post.id,
    action_details: JSON.stringify(post.changed()),
    ip_address: options.ip
  });
});

Post.afterDestroy(async (post, options) => {
  await UserAction.create({
    user_id: post.user_id,
    action_type: 'delete_post',
    target_id: post.id,
    ip_address: options.ip
  });
});

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = await User.findByPk(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// Синхронизация с базой данных
sequelize.sync({ alter: true })
  .then(() => console.log('Таблицы синхронизированы'))
  .catch(err => console.error('Ошибка при синхронизации таблиц:', err));

// Middleware для получения IP-адреса
app.use((req, res, next) => {
  req.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

// Настройка статической папки для загрузок
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, path) => {
    const ext = path.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Генерация хэша для админа
async function generateAdminHash() {
  const adminPassword = 'admin';
  try {
    const hash = await bcrypt.hash(adminPassword, saltRounds);
    console.log('Хэш пароля "admin":', hash);
    return hash;
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

generateAdminHash();

//...............Авторизация пользователя.......................
app.post('/api/login', async (req, res) => {
  const { login_entry, password_entry } = req.body;

  try {
    const user = await User.findOne({ where: { login_entry } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }

    const isMatch = await bcrypt.compare(password_entry, user.password_entry);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }

    await UserAction.create({
      user_id: user.id,
      action_type: 'login',
      ip_address: req.ipAddress
    });

    res.json({ 
      success: true, 
      id: user.id,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      message: 'Авторизация успешна'
    });
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//...............Регистрация пользователя.......................
app.post('/api/register', async (req, res) => {
  const { login_entry, password_entry, first_name, last_name, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { login_entry } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password_entry, saltRounds);
    
    const newUser = await User.create({
      login_entry,
      password_entry: hashedPassword,
      first_name,
      last_name,
      role: role || 'user'
    });

    await UserAction.create({
      user_id: newUser.id,
      action_type: 'register',
      ip_address: req.ipAddress
    });

    res.status(201).json({ 
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: newUser.id,
        login_entry: newUser.login_entry,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
  }
});

//...............Получение данных о пользователях.......................
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { 
          model: Post, 
          as: 'posts'
        }
      ],
      order: [
        ['id', 'ASC'],
        [{ model: Post, as: 'posts' }, 'created_at', 'DESC']
      ]
    });
    res.json(users);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).json({ error: 'Ошибка при получении данных.' });
  }
});

//...............Управление пользователями (админ).......................
app.put('/api/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.is_active = is_active;
    await user.save();

    await UserAction.create({
      user_id: id,
      action_type: is_active ? 'unban_user' : 'ban_user',
      ip_address: req.ipAddress
    });

    res.json({ message: `Пользователь успешно ${is_active ? 'разблокирован' : 'заблокирован'}` });
  } catch (err) {
    console.error('Ошибка при изменении статуса пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//...............Управление постами.......................
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'first_name', 'last_name', 'is_active']
      }],
      order: [['created_at', 'DESC']]
    });

    const response = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      author: post.User ? `${post.User.first_name} ${post.User.last_name}` : 'Неизвестный автор',
      is_active: post.User ? post.User.is_active : true
    }));

    res.json(response);
  } catch (err) {
    console.error('Ошибка при получении постов:', err);
    res.status(500).json({ 
      error: 'Ошибка при получении данных',
      details: err.message 
    });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const post = await Post.create({
      title,
      content,
      image_url,
      user_id: req.user?.id || 1 // Используем ID авторизованного пользователя или 1 по умолчанию
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('Ошибка при создании поста:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, image_url } = req.body;

  try {
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.image_url = image_url || post.image_url;
    await post.save({ ip: req.ipAddress });

    res.json(post);
  } catch (err) {
    console.error('Ошибка при обновлении поста:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/posts/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    if (post.user_id !== user_id) {
      return res.status(403).json({ error: 'Недостаточно прав для удаления этого поста' });
    }

    // Удаляем связанный файл изображения, если он есть
    if (post.image_url) {
      const imagePath = path.join(__dirname, post.image_url.replace('/uploads/', 'uploads/'));
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Ошибка при удалении файла изображения:', err);
      }
    }

    await post.destroy();
    res.json({ message: 'Пост успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении поста:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//...............Управление профилем.......................
app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_entry'] },
      include: [
        { 
          model: Post,
          as: 'posts',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (err) {
    console.error('Ошибка при получении профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/api/profile/:id', upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    // Обновляем данные
    if (req.body.first_name) user.first_name = req.body.first_name;
    if (req.body.last_name) user.last_name = req.body.last_name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    // Обработка аватара
    if (req.file) {
      // Формируем корректный URL
      const avatarUrl = `/uploads/${req.file.filename}`;
      
      // Удаляем старый файл если он существует
      if (user.avatar_url) {
        const oldPath = path.join(__dirname, '..', 'uploads', path.basename(user.avatar_url));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      user.avatar_url = avatarUrl;
    }

    await user.save();
    
    res.json({
      ...user.toJSON(),
      avatar_url: user.avatar_url // Возвращаем полный URL
    });

  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/api/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Удаляем аватар пользователя, если он существует
    if (user.avatar_url) {
      const avatarPath = path.join(__dirname, user.avatar_url.replace('/uploads/', 'uploads/'));
      try {
        fs.unlinkSync(avatarPath);
      } catch (err) {
        console.error('Ошибка при удалении аватара:', err);
      }
    }

    await UserAction.create({
      user_id: id,
      action_type: 'delete_account',
      ip_address: req.ipAddress
    });

    await user.destroy();
    res.json({ message: 'Пользователь успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

//...............Управление действиями пользователей.......................
app.get('/api/user-actions', async (req, res) => {
  try {
    const { user_id, action_type, limit = 50 } = req.query;
    const where = {};
    
    if (user_id) where.user_id = user_id;
    if (action_type) where.action_type = action_type;

    const actions = await UserAction.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'login_entry']
      }],
      order: [['performed_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(actions);
  } catch (err) {
    console.error('Ошибка при получении действий:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Статические файлы доступны по адресу: http://localhost:${PORT}/uploads/`);
});