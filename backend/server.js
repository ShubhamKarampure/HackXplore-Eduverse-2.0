import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import 'colors'
import { dbConnect } from './database/dbConnect.js'
import { userRouter } from './routes/userRoutes.js'
import { CourseRouter } from './routes/courseRoutes.js'
import { ModuleRouter } from './routes/moduleRoutes.js'
import { quizRouter } from './routes/quizRoutes.js'
import projectRouter from './routes/projectRoutes.js'
import fileUpload from 'express-fileupload'
import { assignmentRouter } from './routes/assignmentRoutes.js'

dotenv.config();

dbConnect();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  parseNested: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
}));

app.use('/api/v1/user', userRouter)
app.use('/api/v1/user/course', CourseRouter)
app.use('/api/v1/user/modules', ModuleRouter)
app.use('/api/v1/user/quiz', quizRouter)
app.use('/api/v1/user/assignments', assignmentRouter)
app.use('/api/v1/user/projects', projectRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`.bgBlue.bold);
});