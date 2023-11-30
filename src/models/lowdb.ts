import { existsSync } from "node:fs"
import { rm, chmod, constants } from "node:fs/promises"
import { join } from "node:path"
import { JSONPreset } from "lowdb/node"
import type { UploadedFile } from "express-fileupload"
import { DB_PATH, STORAGE_PATH, FILE_EXPIRATION } from "../config.js"
import type { File, FileJSON, IDB } from "../types.js"
import { nanoid } from "../config.js"

const PERMISSIONS = constants.S_IRUSR | constants.S_IWUSR
const DEFAULT_DATA: IDB = {
  files: [],
  users: []
}
const db = await JSONPreset(DB_PATH, DEFAULT_DATA)

class FileDB {
  async upload(
    file: UploadedFile
  ): Promise<
    { ok: false; data: { error: string } } | { ok: true; data: FileJSON }
  > {
    const { name, mimetype, mv, size } = file
    const filePath = join(STORAGE_PATH, name)
    if (existsSync(filePath))
      return { ok: false, data: { error: "File already exists" } }
    const newFile: File = {
      id: nanoid(),
      name,
      mimetype,
      size,
      filePath,
      createdAt: new Date().toJSON()
    }
    db.data.files.push(newFile)
    await db.write()
    await mv(filePath)
    // Schedule a delete after x time
    setTimeout(async () => {
      await this.delete(newFile.id)
    }, FILE_EXPIRATION)
    await chmod(filePath, PERMISSIONS)
    return {
      ok: true,
      data: {
        id: newFile.id,
        name: newFile.name,
        createdAt: newFile.createdAt,
        size: newFile.size
      }
    }
  }

  async get(
    fileId: string
  ): Promise<
    { ok: false; data: { error: string } } | { ok: true; data: File }
  > {
    const {
      data: { files }
    } = db
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1)
      return { ok: false, data: { error: "File not found" } }
    return { ok: true, data: files[fileIndex] }
  }

  async getAll(): Promise<
    { ok: false; data: { error: string } } | { ok: true; data: File[] }
  > {
    const {
      data: { files }
    } = db
    return { ok: true, data: files }
  }

  async delete(fileId: string) {
    const {
      data: { files }
    } = db
    const fileIndex = files.findIndex((file) => file.id === fileId)
    if (fileIndex === -1)
      return { ok: false, data: { error: "File not found" } }
    const [fileDeleted] = db.data.files.splice(fileIndex, 1)
    await db.write()
    await rm(fileDeleted.filePath)
    return { ok: true }
  }
}

export const fileDB = new FileDB()
