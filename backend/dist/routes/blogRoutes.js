"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const router = (0, express_1.Router)();
router.get('/', blogController_1.getBlogs);
router.get('/:slug', blogController_1.getBlogBySlug);
router.post('/:slug/comments', blogController_1.addBlogComment);
exports.default = router;
