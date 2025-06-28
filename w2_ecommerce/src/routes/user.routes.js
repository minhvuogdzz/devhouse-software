const express = require('express');
const {getMe,getUserById,updateUserInfo} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authenticate');
const router =  express.Router();
const validateUserProfile = require('../middlewares/validateUserProfile')


// Route register
router.get("/me",getMe);


//Endpoint tìm kiếm user theo số điện thoại
// router.get('admin/searchPhone', searchUsersByPhone);

// Route.login 

router.get("/:id",getUserById);

router.post('/profile',authMiddleware,validateUserProfile,updateUserInfo);




module.exports = router;

