import React from "react"
import ContentLoader from "react-content-loader"

const ImgLoader = () => (
  <ContentLoader
    speed={3}
    width={640}
    height={640}
    viewBox="0 0 640 640"
    backgroundColor="#424242"
    foregroundColor="#ffffff"
  >
    <rect x="-33" y="-36" rx="0" ry="0" width="683" height="696" />
  </ContentLoader>
)

export default ImgLoader