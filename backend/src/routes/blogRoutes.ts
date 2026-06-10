import { Router } from 'express';
import { getBlogs, getBlogBySlug, addBlogComment } from '../controllers/blogController';

const router = Router();

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/:slug/comments', addBlogComment);

export default router;
