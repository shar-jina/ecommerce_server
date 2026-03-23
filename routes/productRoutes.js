const express = require("express");
const router = express.Router();
const verifytoken=require('../middleware/jwtmiddleware')
const allowRoles=require('../middleware/allowRoles')
const upload=require('../middleware/upload')

const productController = require("../controllers/productcontroller");

router.post("/add",verifytoken,allowRoles("admin","manager"), upload.array("images", 5), productController.addProduct);
router.put("/:id",verifytoken,allowRoles("admin","manager"), upload.array("images", 5), productController.updateProduct);
router.delete("/:id",verifytoken,allowRoles("admin","manager"), productController.deleteProduct);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);



module.exports = router;