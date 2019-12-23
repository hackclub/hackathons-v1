import React, { Component } from 'react'
import VanillaTilt from 'vanilla-tilt'

class Tilt extends Component {
  componentDidMount() {
    VanillaTilt.init(this.rootNode, {
      max: 7.5,
      scale: 1.05,
      speed: 400,
      glare: false,
      gyroscope: false,
      ...this.props.tiltOptions,
    })
  }

  render() {
    // Fix react warning: Don't set flexDirection as a prop on <div>
    const { flexDirection, ...rest } = this.props
    return (
      <div
        ref={node => (this.rootNode = node)}
        className="tilt-root"
        {...rest}
      />
    )
  }
}

export default Tilt
