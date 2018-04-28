const { writeFile, existsSync, mkdirSync } = require('fs')
const axios = require('axios')
const path = require('path')
const { kebabCase } = require('lodash')
const regions = require('./src/regions.js')

const imageFolder = 'static/images/'

const downloadImage = image =>
  new Promise((resolve, reject) => {
    if (!image) resolve(null)
    axios
      .get(`https://api.hackclub.com${image.file_path}`, {
        responseType: 'arraybuffer',
      })
      .then(res => {
        let extension = ''
        switch (res.headers['content-type']) {
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

const processEvent = async event => ({
  ...event,
  id: event.id.toString(),
  banner: await downloadImage(event.banner),
  logo: await downloadImage(event.logo),
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

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const component = path.resolve('src/templates/region.js')
    resolve(
      graphql(`
        {
          allEventsJson {
            edges {
              node {
                id
                startHumanized: start(formatString: "MMMM D")
                endHumanized: end(formatString: "D")
                start
                end
                startYear: start(formatString: "YYYY")
                parsed_city
                parsed_state
                parsed_state_code
                parsed_country
                parsed_country_code
                name
                website: website_redirect
                latitude
                longitude
                banner
                logo
                isAssociated: hack_club_associated
              }
            }
          }
        }
      `).then(result => {
        if (result.errors) {
          console.error(result.errors)
          reject(result.errors)
        }

        regions.map(region => {
          const events = result.data.allEventsJson.edges.filter(edge =>
            region.filter(edge.node)
          )
          createPage({
            path: kebabCase(region.name),
            component,
            context: {
              region,
              events,
            },
          })
        })
      })
    )
    locations.map(location => {
      createPage({
        path: location,
        component,
      })
    })
  })
}
