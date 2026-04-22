const pool = require("../config/db");

exports.addPost = async (req, res) => {
    try {
        const { title, content, category, product_id, discount_label, target_category } = req.body;
        const image = req.file ? req.file.path : null;

        const newPost = await pool.query(
            `INSERT INTO posts(title, content, category, image, product_id, discount_label, target_category)
             VALUES($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [title, content, category, image, product_id || null, discount_label || null, target_category || null]
        );

        res.status(201).json({
            message: "Post added successfully",
            post: newPost.rows[0]
        });
    } catch (error) {
        console.error("ADD POST ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await pool.query("SELECT * FROM posts ORDER BY id DESC");
        res.status(200).json(posts.rows);
    } catch (error) {
        console.error("GET POSTS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, product_id, discount_label, target_category } = req.body;
        const image = req.file ? req.file.path : req.body.image;

        const updatedPost = await pool.query(
            `UPDATE posts 
             SET title=$1, content=$2, category=$3, image=$4, product_id=$5, discount_label=$6, target_category=$7
             WHERE id=$8
             RETURNING *`,
            [title, content, category, image, product_id || null, discount_label || null, target_category || null, id]
        );

        if (updatedPost.rows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost.rows[0]
        });
    } catch (error) {
        console.error("UPDATE POST ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await pool.query("DELETE FROM posts WHERE id=$1 RETURNING *", [id]);

        if (deletedPost.rows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("DELETE POST ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};
