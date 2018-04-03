const writeFile = require('fs').writeFile
const axios = require('axios')

const downloadImage = (url, path) => (
  axios
    .get(`https://api.hackclub.com${url}`, { responseType: 'arraybuffer' })
    .then(res =>
      writeFile(path, res.data, 'binary', err => {
        if (err) throw err
      })
    )
)

exports.onPreBootstrap = async () => {
  return axios
    .get('https://api.hackclub.com/v1/events')
    .then(res => {
      const data = JSON.stringify(
        res.data.map(event => ({ ...event, id: event.id.toString() }))
      )
      writeFile('./data/events.json', data, err => {
        if (err) throw err
      })

      // Download each of the banners and logos
      const imagePromises = []
      res.data.forEach(event => {
        const { banner, logo, id } = event
        if (banner) {
          imagePromises.push(downloadImage(banner.file_path, `./data/banner_${id}.jpg`))
        }
        if (logo) {
          imagePromises.push(downloadImage(logo.file_path, `./data/logo_${id}.jpg`))
        }
      })
      // Make sure the build waits for downloading to finish
      return Promise.all(imagePromises)
    })
    .catch(e => {
      console.error(e)
    })
}
