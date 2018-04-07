const { writeFile, existsSync, mkdirSync } = require('fs')
const axios = require('axios')

const imageFolder = 'static/images/'

const downloadImage = image => (
  new Promise((resolve, reject) => {
    if (!image) resolve(null)
    axios
      .get(`https://api.hackclub.com${image.file_path}`, { responseType: 'arraybuffer' })
      .then(res => {
        let extension = ''
        switch(res.headers['content-type']) {
          case 'image/jpeg':
            extension = '.jpg'
            break
          case 'image/png':
            extension = '.png'
            break
          default:
            throw `Invalid content-type: ${res.headers['content-type']}`
        }
        const fileName = image.type + '_' + image.id + extension
        writeFile(imageFolder + fileName, res.data, 'binary', err => {
          if (err) throw err
          resolve(`images/${fileName}`)
        })
      })
      .catch(err => reject(err))
  })
)

const processEvent = async event => ({
  ...event,
  id: event.id.toString(),
  banner: await downloadImage(event.banner),
  logo: await downloadImage(event.logo)
})

exports.onPreBootstrap = () => (
  new Promise((resolve, reject) => {
    axios
    .get('https://api.hackclub.com/v1/events')
    .then(res => {
      console.log('Creating image folder')
      if (!existsSync(imageFolder)){
        mkdirSync(imageFolder)
      }
      console.log('Mapping through event data')
      const promiseArray = res.data.map(event => processEvent(event))
      return new Promise.all(promiseArray).then(data => {
        console.log('Writing event data to file')
        writeFile('data/events.json', JSON.stringify(data), err => {
          if (err) reject(err)
          console.log('Event data written to file')
          resolve()
        })
      })
      .catch(err => { throw err })
    })
    .catch(reject)
  })
)
