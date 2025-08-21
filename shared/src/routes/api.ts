import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import { getMessages, getRecentMessages, getMessageStats } from '../controllers/messageController';
import { getUsers, getOnlineUsers, getUserStats, getUserById, getUserByUsername } from '../controllers/userController';
import { getSystemStats, getServerInfo } from '../controllers/systemController';
import { validate, schemas } from '../middleware/validation';
import { apiRateLimit } from '../middleware/security';

const router = Router();

// 应用API频率限制
router.use(apiRateLimit);

// 健康检查接口
router.get('/health', getHealth);

// 消息相关接口
router.get('/messages', validate(schemas.pagination, 'query'), getMessages);
router.get('/messages/recent', validate(schemas.pagination, 'query'), getRecentMessages);
router.get('/messages/stats', getMessageStats);

// 用户相关接口
router.get('/users', getUsers);
router.get('/users/online', getOnlineUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.get('/users/username/:username', getUserByUsername);

// 系统相关接口
router.get('/system/stats', getSystemStats);
router.get('/system/info', getServerInfo);

// TODO: 文件上传和下载接口（后续实现）
// router.post('/upload', upload.single('file'), uploadFile);
// router.get('/files/:filename', downloadFile);

export default router;