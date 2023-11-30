import "dotenv/config"
import { join } from "node:path"
import { mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { customAlphabet } from "nanoid"

const { PORT = 3000, NODE_ENV } = process.env
const STORAGE_PATH = join(process.cwd(), "storage")
const DB_PATH = join(process.cwd(), "db.json")
const HTML_PATH = join(process.cwd(), "src", "views", "index.html")
const PUBLIC_PATH = join(process.cwd(), "src", "public")
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
)

if (!existsSync(STORAGE_PATH)) {
  await mkdir(STORAGE_PATH)
}

export { PORT, STORAGE_PATH, DB_PATH, HTML_PATH, nanoid, PUBLIC_PATH, NODE_ENV }
