import app from './App'

const port = 8000

app.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }

  return console.log(`server is running on ${port}`)
})
