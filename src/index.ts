import { server } from "./app.js"
import { PORT } from "./config.js"

const serverInfo = server.address()

console.log(`Server listening on http://localhost:${PORT}`)
