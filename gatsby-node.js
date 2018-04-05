const writeFile = require('fs').writeFile
const axios = require('axios')

const downloadImage = (url, tag) => (
  new Promise((resolve, reject) => {
    const extensionRegex = /(?:\.([^.]+))?$/
    const extension = extensionRegex.exec(url)[0].toLowerCase()
    axios
      .get(`https://api.hackclub.com${url}`, { responseType: 'arraybuffer' })
      .then(res => {
          writeFile(`data/images/${tag + extension}`, res.data, 'binary', err => {
            if (err) throw err
            resolve()
          })
        }
      )
      .catch(err => {
        reject(err)
      })
  })
)

const downloadImagesFromEvents = events => (
  new Promise(async (resolve, reject) => {
    try {
      const imagePromises = []
      events.forEach(event => {
        const { banner, logo, id } = event
        if (logo) {
          imagePromises.push(downloadImage(logo.file_path, `logo_${id}`))
        }
        if (banner) {
          imagePromises.push(downloadImage(banner.file_path, `banner_${id}`))
        }
      })
      Promise.all(imagePromises)
        .then(resolve)
        .catch(err => {
          throw err
        })
    } catch(err) {
      reject(err)
    }
  })
)

exports.onPreBootstrap = async () => {
  await new Promise((resolve, reject) => (
    axios
      .get('https://api.hackclub.com/v1/events')
      .then(res => {
        const data = JSON.stringify(
          res.data.map(event => ({ ...event, id: event.id.toString() }))
        )
        writeFile('data/events.json', data, err => {
          if (err) throw err
          downloadImagesFromEvents(res.data)
            .then(resolve)
            .catch(err => {
              throw err
            })
        })
      })
      .catch(err => reject(err))
  ))
}
