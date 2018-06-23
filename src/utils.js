export const distance = (lat1, lon1, lat2, lon2) => {
  // https://www.geodatasource.com/developers/javascript
  const radlat1 = (Math.PI * lat1) / 180
  const radlat2 = (Math.PI * lat2) / 180
  const theta = lon1 - lon2
  const radtheta = (Math.PI * theta) / 180
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515
  return {
    miles: dist,
    kilometers: dist * 1.609344,
  }
}

export const trackClick = props => e => {
  e.preventDefault()
  try {
    window.analytics.track(props.analyticsEventName || 'Clicked Link', {
      href: props.href,
      ...(props.analyticsProperties || {}),
    })
  } catch (err) {
    console.error(err)
  }
  props.onClick
    ? props.onClick(e)
    : props.noNewTab
      ? (location.href = props.href)
      : window.open(props.href, '_blank')
}
