require('dotenv').config()
const express = require('express')
const app = express()
//Port config
const port = process.env.PORT || 3000
//GraphQL
const graphqlHTTP = require('express-graphql')
import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
//Body Parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//Multer/Cloudinary for Uploads
const multer = require('multer')
const cloudinary = require('cloudinary')
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
})
const cloudinaryStorage = require('multer-storage-cloudinary')
const storage = cloudinaryStorage({
  cloudinary,
  folder: 'demo',
  allowedFormats: ['jpg', 'png'],
  transformation: [{ width: 500, height: 500, crop: 'limit' }]
})
const parser = multer({ storage })
//Moment for Timestamps
const moment = require('moment')
//Mongoose for MongoDB queries
const mongoose = require('mongoose')
const schema = require('./server/schema.ts')
const root = require('./server/root.ts')
const { Seeder } = require('mongo-seeding')
//Path for static files
const path = require('path')
//formatError for custom graphql resolver errors
import { formatError } from 'apollo-errors'
//WebSocket
const server = require('ws').Server

// setting useFindAndModify to false resolves MongoDB Node.js deprecation warnings from using certain Mongoose methods
// setting useCreateIndex true to allow unique constraint in user email
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const db = mongoose.connection
db.once('open', () => console.log('Connected to DB'))

// const config = {
//   database: process.env.DB_URL,
//   dropDatabase: true
// }

// **DO NOT DELETE**
// NOTE: To avoid overages on our MongoDB/Cloudinary, please refrain from
// seeding, querying, and uploading too often!
// const seeder = new Seeder(config)
// const collections = seeder.readCollectionsFromPath(path.resolve('./data'))

// seeder
//   .import(collections)
//   .then(() => console.log('Successfully seeded database'))
//   .catch(err => console.log('Error seeding database', err))

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    formatError
  })
)

app.post('/upload', parser.single('image'), (req, res) => {
  interface UploadedImage {
    url: string
    id: string
  }
  const image = <UploadedImage>{
    url: req.file.url,
    id: req.fild.public_id
  }
  res.send(image)
})

//This is the websocket that wraps the server. A websocket is basically a live connection between server and client that are actively
//listening to each other.
// const WebSocket = require('ws')
// const wss = new WebSocket.Server({ port: 3001 })
const l0 = new RegExp(/l0/)
const m0 = new RegExp(/m0/)
// import User from './server/models/user'

interface clientList {
  email: WebSocket,
}

interface Clients {
  clientList: Object
}

interface Client {

}

class Clients {
  constructor() {
    this.clientList = {}
    this.saveClient = this.saveClient.bind(this)
  }
  saveClient(email: string, client: WebSocket) {
    this.clientList[email] = client
  }
}

const clients = new Clients()

// const server = createServer(app)
const wss = new server({ port: 3001 })

wss.on('connection', (ws) => {
  console.log("CONNECTED")
  ws.on('message', (msg) => {
    console.log(msg)
    const message = msg.split(' ')
    if (message[0] === 'l0') {
      clients.saveClient(message[1], ws)
      for (let client in clients.clientList) {
        clients.clientList[client].send('User Logged In')
      }
    }
    if (message[0] === 'm0') {
      for (let client in clients.clientList) {
        if (client === message[1]) {
          clients.clientList[client].send(`m0 ${message[2]}`)
        }
      }
    }
  })
})

// server.listen(port, () => console.log(`Listening on ${port}`))

app.listen(port, () => console.log(`Listening on ${port}`))

export = { db }
