import express from 'express';
//import path from 'path';
import multer from 'multer';
const formData_Middlewares_multer = multer();//解析form data的中間件
import { avatarUpload } from '../Uploads/UploadService.js';

const User_Controller = (UserService) => {
  
  const appRouter  = express.Router();
  /**
   * @swagger
   * /tagGroupDetails:
   *   get:
   *     tags:
   *         - Users Api
   *     summary: tag群組表
   *     description: Returns tag群組表 data.
   *     responses:
   *       200:
   *         description: Successful response with tag群組表 data.
   */
  appRouter.get("/tagGroupDetails", async (req, res) => {
    const tableData = await UserService.getAssignViewTable("V_TagGroupDetail");
    try {
      res.json(tableData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /updateUserPassword:
   *   post:
   *     tags:
   *       - Users Api
   *     summary: 更新使用者密碼
   *     description:
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - password
   *             properties:
   *               userId:
   *                 type: string
   *                 description: 使用者ID
   *               password:
   *                 type: string
   *                 description: 使用者新密碼
   *     responses:
   *       200:
   *         description: 成功更新使用者密碼。
   */
  appRouter.post(
    "/updateUserPassword",
    formData_Middlewares_multer.none(),
    async (req, res) => {
      const { userId, password } = req.body;
      console.log("req.body=>>>", userId, password, req.body);
      try {
        const updatedUser = await UserService.updateUserPassword(
          userId,
          password
        );
        res.send(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     tags:
   *       - Users Api
   *     summary: 取得使用者資料
   *     description: 取得使用者資料。
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 使用者ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: 成功取得使用者資料。
   */
  appRouter.get("/users/:id", async (req, res) => {
    const userId = req.params.id;
    console.log("req.params.id=>>>", userId);
    try {
      const user = await UserService.getUserById(userId);
      res.send(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /users/{id}/password:
   *   put:
   *     tags:
   *       - Users Api
   *     summary: 更新使用者密碼
   *     description: 更新指定使用者的密碼。
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 使用者ID
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *             properties:
   *               password:
   *                 type: string
   *                 description: 使用者新密碼
   *     responses:
   *       200:
   *         description: 成功更新使用者密碼。
   */
  appRouter.put(
    "/users/:id/password",
    formData_Middlewares_multer.none(),
    async (req, res) => {
      const userId = req.params.id;
      const password = req.body.password; // Access password field from form-data
      console.log("req.body=>>>", userId, password, req.body);
      try {
        const updatedUser = await UserService.updateUserPassword(
          userId,
          password
        );
        res.send(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  /**
   * @swagger
   * /updateUserAvatar:
   *   post:
   *     tags:
   *       - Users Api
   *     summary: 更新使用者頭像
   *     description:
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - avatar
   *             properties:
   *               userId:
   *                 type: string
   *                 description: 用户ID
   *               avatar:
   *                 type: string
   *                 format: binary
   *                 description: 使用者頭像
   *     responses:
   *       200:
   *         description: 成功更新使用者頭像。
   *       500:
   *         description: 內部伺服器錯誤。
   */
  appRouter.post("/updateUserAvatar", (req, res, next) => {
    try {
      avatarUpload.single("avatar")(req, res, function (err) {
        const _userId = req.body.userId;
        console.log("updateUserAvatar", _userId);
        if (err) {
          return res.status(500).json({ error: err.message });
        } else {
          return res
            .status(200)
            .json({ message: "Avatar updated successfully." });
        }
        next();
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });



  return appRouter;
};

export default User_Controller ;
