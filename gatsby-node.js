const { writeFile, mkdir } = require('fs').promises
const { existsSync } = require('fs')
const axios = require('axios')
const path = require('path')
const readline = require('readline')
const Bottleneck = require('bottleneck')

const regions = require('./src/regions.js')

const ratelimitConfig = {}
if (!process.env.NO_RATELIMIT) {
  ratelimitConfig.maxConcurrent = process.env.MAX_CONCURRENT || 20,
  ratelimitConfig.minTime = process.env.MIN_TIME || 100
}

const limiter = new Bottleneck(ratelimitConfig)

const axiosGet = limiter.wrap(axios.get)

let startTime = Date.now()
const logMessage = (...args) => {
  readline.clearLine(process.stdout)
  readline.cursorTo(process.stdout, 0)
  const elapsedTime = ((Date.now() - startTime).toFixed(2) / 1000)
  console.log('    ', ...args, `– ${elapsedTime} s`)
  startTime = Date.now()
}

const imageFolder = 'static/images/'
const dataFolder = 'data/'

const downloadImage = async (event, image, type = 'event') => {
  if (!image) {return null}
  const res = await axiosGet(`https://api.hackclub.com${image.file_path}`, {
    responseType: 'arraybuffer'
  })

  let extension
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
  const updatedAt = Date.parse(image.updated_at)
  const filename = `${imageFolder}${type}_${image.type}_${event.id}.${updatedAt}${extension}`
  await writeFile(filename, res.data, 'binary')
  return filename
}

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

const getSubscriberInfo = async () => {
  const statsJson = await axiosGet('https://api.hackclub.com/v1/event_email_subscribers/stats')
  logMessage('Fetched subscriber stats')

  await writeFile(dataFolder + 'stats.json', JSON.stringify(statsJson.data))
  logMessage('Subscriber stats written to file')
}

const getEventInfo = async () => {
  const eventsJson = await axiosGet('https://api.hackclub.com/v1/events')
  logMessage('Fetched events json')

  const eventsData = await Promise.all(eventsJson.data.map(processEvent))
  logMessage('Fetched event images')

  await writeFile(dataFolder + 'events.json', JSON.stringify(eventsData))
  logMessage('Event data written to file')
}

const getGroupInfo = async () => {
  const groupsJson = await axiosGet('https://api.hackclub.com/v1/events/groups')
  logMessage('Fetched groups json')

  const groupsData = await Promise.all(groupsJson.data.map(processGroup))
  logMessage('Fetched group images')

  await writeFile(dataFolder + 'groups.json', JSON.stringify(groupsData))
  logMessage('Group data written to file')
}

const ensureFolderExists = async foldername => {
  if (!existsSync(foldername)) {
    await mkdir(foldername)
    logMessage('Created folder at', foldername)
  }
}

exports.onPreBootstrap = async () => {
  await Promise.all([
    ensureFolderExists(dataFolder),
    ensureFolderExists(imageFolder)
  ])

  await Promise.all([
    getSubscriberInfo(),
    getEventInfo(),
    getGroupInfo(),
  ])
}

exports.createPages = async ({ graphql, actions }) => {
  logMessage('Creating pages')
  const { createPage } = actions

  const component = path.resolve('src/templates/region.js')
  const query = await graphql(`
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
    `)
  logMessage('Ran graphql query')
  if (query.errors) {
    console.error(query.errors)
    throw query.errors
  }

  await Promise.all(regions.map(async region => {
    const events = query.data.allEventsJson.edges.filter(edge =>
      region.filter(edge.node)
    )
    const emailStats = query.data.dataJson
    if (events.length > 3) {
      await createPage({
        path: region.path,
        component,
        context: {
          region,
          events,
          emailStats
        },
      })
    }
  }))
}
