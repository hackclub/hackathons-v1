// import { writeFile } from 'fs'
const writeFile = require('fs').writeFile
const axios = require('axios')

exports.onPreBuild = () => {
  axios.get('https://api.hackclub.com/v1/events')
    .then(res => {
      const data = JSON.stringify(res.data.map(event => (
        {...event, id: event.id.toString()}
      )))
      writeFile('./data/events.json', data, err => {
        if (err) throw err
      })
    })
    .catch(e => {
      console.error(e)
    })
}
