import React from 'react'

export interface Props {
  buttonType: 'primary' | 'secondary'
}

export const SimpleButton: React.SFC<Props> = ({ buttonType, children}) => {
  return (
    <button className={buttonType}>{children}</button>
  )
}
