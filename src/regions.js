'use strict'

const distance = (lat1, lon1, lat2, lon2) => {
  // https://www.geodatasource.com/developers/javascript
  const radlat1 = Math.PI * lat1 / 180
  const radlat2 = Math.PI * lat2 / 180
  const theta = lon1 - lon2
  const radtheta = Math.PI * theta / 180
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515
  return {
    miles: dist,
    kilometers: dist * 1.609344,
  }
}

module.exports = [
  {
    name: 'Los Angeles',
    filter: event => event.parsed_city === 'Los Angeles',
  },
  {
    name: 'Chicago',
    filter: event => {
      const position = [41.969649, -87.720643]
      return (
        distance(position[0], position[1], event.latitude, event.longitude)
          .miles < 42
      )
    },
  },
  {
    name: 'New York',
    filter: event => event.parsed_state_code === 'NY',
  },
  {
    name: 'the USA',
    filter: event => event.parsed_country_code === 'US',
    address: '',
  },
  {
    name: 'the San Francisco Bay',
    filter: event => {
      const position = [37.641045, -122.228916]
      return (
        distance(position[0], position[1], event.latitude, event.longitude)
          .miles < 39
      )
    },
  },
]
