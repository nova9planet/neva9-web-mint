import Image from 'next/image'
import React from 'react'

const TextPage = () => {
  return (
    <>
      <h1>My Image</h1>
      <Image src="/nova/1.png" width="300" height="300" />
      <Image src="/nova/2.png" width="300" height="300" />
    </>
  )
}

export default TextPage
