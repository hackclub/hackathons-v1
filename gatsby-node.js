const { writeFile, existsSync, mkdirSync } = require('fs')
const axios = require('axios')
const path = require('path')
const readline = require('readline')
const regions = require('./src/regions.js')
const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100,
})

const axiosGet = limiter.wrap(axios.get)

const imageFolder = 'static/images/'

const downloadImage = (event, image, type = 'event') =>
  new Promise((resolve, reject) => {
    if (!image) resolve(null)
    console.log(`downloading ${image.file_path}`)
    axiosGet(`https://api.hackclub.com${image.file_path}`, {
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
        let updatedAt = Date.parse(image.updated_at)
        const fileName = `${type}_${image.type}_${event.id}.${updatedAt}${extension}`
        writeFile(imageFolder + fileName, res.data, 'binary', err => {
          if (err) throw err
          resolve(`images/${fileName}`)
        })
      })
      .catch(err => {
        console.log(`failure while downloading ${image.file_path}`)
        console.error(err)
        reject(err)
      })
  })

const processEvent = async event => ({
  ...event,
  id: event.id.toString(),
  banner: await downloadImage(event, event.banner),
  logo: await downloadImage(event, event.logo)
})

const processGroup = async group => ({
  ...group,
  id: group.id.toString(),
  banner: await downloadImage(group, group.banner, 'group'),
  logo: await downloadImage(group, group.logo, 'group')
})

exports.onPreBootstrap = () => {
  let startTime = Date.now()
  const logMessage = (msg) => {
    readline.clearLine(process.stdout)
    readline.cursorTo(process.stdout, 0)
    const elapsedTime = ((Date.now() - startTime).toFixed(2) / 1000)
    console.log(`    ${msg} – ${elapsedTime} s`)
    startTime = Date.now()
  }

  // Download & process events
  return axiosGet('https://api.hackclub.com/v1/events')
    .then(eventsRes => {
      logMessage('Fetched events data')
      return axiosGet('https://api.hackclub.com/v1/events/groups').then(groupsRes => {
        logMessage('Fetched groups data')

        if (!existsSync(imageFolder)) {
          mkdirSync(imageFolder)
          logMessage('Created image folder')
        }
        const groupsPromiseArray = groupsRes.data.map(group => processGroup(group))
        logMessage(`starting to get groupsePromiseArray ${groupsPromiseArray.length}`)
        return Promise.all(groupsPromiseArray).then(groupsData => {
          const eventsPromiseArray = eventsRes.data.map(event => processEvent(event))
          logMessage('starting to get eventsPromiseArray')
          return Promise.all(eventsPromiseArray)
            .then(eventsData => {
              logMessage('Mapped through event data')
              const writeGroups = new Promise((resolve, reject) => {
                writeFile('data/groups.json', JSON.stringify(groupsData), err => {
                  if (err) return reject(err)

                  logMessage('Group data written to file')
                  resolve()
                })
              })

              const writeEvents = new Promise((resolve, reject) => {
                writeFile('data/events.json', JSON.stringify(eventsData), err => {
                  if (err) return reject(err)

                  logMessage('Event data written to file')
                  resolve()
                })
              })
              return Promise.all([writeEvents, writeGroups])
            })
        })
      })
    })
    // Download & process event stats
    .then(() => (
      axiosGet('https://api.hackclub.com/v1/event_email_subscribers/stats')
    ))
    .then(res => (
      new Promise((resolve, reject) => {
        writeFile('data/stats.json', JSON.stringify(res.data), err => {
          if (err) return reject(err)

          logMessage('Event stats written to file')
          resolve()
        })
      })
    ))
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

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
                mlh: mlh_associated
              }
            }
          }
          dataJson {
            cities
            countries
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
          const emailStats = result.data.dataJson
          if (events.length > 3) {
            createPage({
              path: region.path,
              component,
              context: {
                region,
                events,
                emailStats
              },
            })
          }
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
