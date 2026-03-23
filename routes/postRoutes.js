const express = require("express");
const router = express.Router();
const verifytoken = require('../middleware/jwtmiddleware');
const allowRoles = require('../middleware/allowRoles');
const upload = require('../middleware/upload');
const postController = require("../controllers/postcontroller");

router.post("/add", verifytoken, allowRoles("admin", "manager"), upload.single("image"), postController.addPost);
router.get("/", postController.getPosts);
router.put("/:id", verifytoken, allowRoles("admin", "manager"), upload.single("image"), postController.updatePost);
router.delete("/:id", verifytoken, allowRoles("admin", "manager"), postController.deletePost);

module.exports = router;
