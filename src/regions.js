module.exports = [
  {
    name: 'Los Angeles',
    filter: event => event.parsed_city === 'Los Angeles',
  },
  {
    name: 'New York',
    filter: event => event.parsed_state_code === 'NY',
  },
]
