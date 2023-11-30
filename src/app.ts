import express from "express"
import fileUpload, { type UploadedFile } from "express-fileupload"
import { PORT, HTML_PATH, PUBLIC_PATH, NODE_ENV } from "./config.js"
import { fileDB } from "./models/lowdb.js"

const isProd = NODE_ENV === "prod"
const app = express()
export const server = app.listen(PORT)

app.use(express.json())
app.use(express.static(PUBLIC_PATH))
app.use(fileUpload())

app.get("/", (req, res) => {
  res.sendFile(HTML_PATH)
})
app.get("/files", async (req, res) => {
  const { ok, data } = await fileDB.getAll()
  return ok
    ? res.json({
        files: data.map(({ id, name, size, createdAt }) => ({
          id,
          name,
          size,
          createdAt,
          link: `${req.protocol}://${req.hostname}${
            isProd ? "" : `:${PORT}`
          }/file/${id}`
        }))
      })
    : res.sendStatus(400)
})
app.get("/file/:id", async (req, res) => {
  const { id } = req.params
  const { ok, data } = await fileDB.get(id)
  return ok ? res.sendFile(data.filePath) : res.sendStatus(404)
})
app.post("/upload", async (req, res) => {
  if (req.files == null) return res.sendStatus(400)
  const { media } = req.files as { media: UploadedFile }
  const { ok, data } = await fileDB.upload(media)
  return ok
    ? res.status(201).json({
        id: data.id,
        name: data.name,
        size: data.size,
        createdAt: data.createdAt,
        link: `${req.protocol}://${req.hostname}${
          isProd ? "" : `:${PORT}`
        }/file/${data.id}`
      })
    : res.sendStatus(302)
})
app.delete("/file/:id", async (req, res) => {
  const { id } = req.params
  const { ok } = await fileDB.delete(id)
  return ok ? res.sendStatus(204) : res.sendStatus(404)
})
