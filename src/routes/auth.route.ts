import { Router } from "express";
import { changeUserRole, forgotPassword, getLoggedInUserInfo, getLoginUsers, getMe, loginUser, logoutUser,  refreshToken, registerUser, resendVerificationEmail, resetPassword, updateProfile, verifyEmail } from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { authorizeRole } from "../middlewares/authorizeRole";
import { checkVerifiedUser } from "../middlewares/checkVerifiedUser";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.get("/logout-users", authenticateJWT, checkVerifiedUser, authorizeRole("admin"), logoutUser); // optional — only if tracking
router.get("/login-users", authenticateJWT, checkVerifiedUser, getLoginUsers);
router.get("/me", authenticateJWT , checkVerifiedUser, getLoggedInUserInfo);
router.post("/refresh-token", refreshToken);
router.patch(
  "/change-role/:id",
  authenticateJWT,
  checkVerifiedUser,
  authorizeRole("admin"),
  changeUserRole
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.patch("/update-profile", authenticateJWT, updateProfile);
router.post("/logout", authenticateJWT, logoutUser);



export default router;
