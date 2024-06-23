import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import healthcheckRouter from "./routes/healthcheck.routes.js"
import superadminRouter from './routes/superadmin.routes.js'
// import adminRouter from './routes/admin.routes.js'
// import clientRouter from './routes/client.routes.js'
// import technicianRouter from './routes/technician.routes.js'

// Routes declaration
// http://localhost:8000/api/v1/healthcheck
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/superadmin", superadminRouter)
// app.use("/api/v1/admin", adminRouter)
// app.use("/api/v1/client", clientRouter)
// app.use("/api/v1/technician", technicianRouter)

export { app }
