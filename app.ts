import * as express from 'express'
import * as locationRouter from "./app/routes/routes";
import bodyParser = require("body-parser")

class App {
  public express

  constructor () {
    this.express = express()
    this.express.use(bodyParser.urlencoded({ extended: false }))
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    router.get('/', (req, res) => {
        res.send('Coffee Shop Locations: <a target=\"_blank\" href=\'https://www.github.com/alexbudy/coffeeshoplocations\'>GitHub</a>')
    })
    this.express.use('/', locationRouter)
    this.express.use('/', router)
  }
}

export default new App().express
