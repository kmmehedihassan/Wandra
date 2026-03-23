import { sub } from 'date-fns'
import React from 'react'
import './description.css'

const Descsubs = ({subtitle, detls}) => {
  return (
    <div className='subs'>
      <h6 className='point'>{subtitle}</h6>
      <p className='detail-tour-desc'>{detls}</p>
    </div>
  )
}

export default Descsubs;
