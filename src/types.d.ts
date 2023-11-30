declare global {
  interface Array<T> {
    toSpliced: (start: number, deleteCount?: number, ...items: T[]) => T[]
  }
}

export interface File {
  id: string
  name: string
  filePath: string
  mimetype: string
  size: number
  createdAt: string
}

export type FileJSON = Omit<File, "filePath" | "mimetype">

export interface User {
  id: string
  username: string
  token: string
  createdAt: string
  updatedAt: string
}

export interface IDB {
  files: File[]
  users: User[]
}
