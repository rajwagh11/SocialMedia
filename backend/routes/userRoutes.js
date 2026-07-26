import express from 'express'
import { isAuth  } from '../middlewares/isAuth.js';
import { 
    followandUnfollowUser,
    getAllUsers,
    myProfile, 
    updatePassword, 
    updateProfile, 
    userfollowerandFollowingData, 
    userProfile 
} from '../controllers/userControllers.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router()

router.get("/me", isAuth, myProfile);
router.get("/:id", isAuth, userProfile);
router.put("/:id",isAuth,uploadFile,updateProfile);
router.post("/:id",isAuth, updatePassword);
router.post("/follow/:id", isAuth, followandUnfollowUser);
router.get("/followdata/:id",isAuth,userfollowerandFollowingData);
router.get("/all",isAuth, getAllUsers);

export default router;
