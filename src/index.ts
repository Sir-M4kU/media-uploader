import { server } from "./app.js"
import type { AddressInfo } from "node:net"

const { port } = server.address() as AddressInfo

console.log(`Server listening on http://localhost:${port}`)
