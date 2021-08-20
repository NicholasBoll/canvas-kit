import React from 'react';

import {Modal} from '@workday/canvas-kit-react/modal';

interface MyTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const MyTarget = React.forwardRef<HTMLButtonElement, MyTargetProps>(({label, ...props}, ref) => {
  return (
    <button {...props} ref={ref}>
      {label}
    </button>
  );
});

export const CustomTarget = () => {
  return (
    <Modal>
      <Modal.Target as={MyTarget} label="Open" />
      <Modal.Overlay>
        <Modal.Card>
          <Modal.CloseIcon aria-label="Close" />
          <Modal.Heading>Modal</Modal.Heading>
          <Modal.Body>Contents</Modal.Body>
        </Modal.Card>
      </Modal.Overlay>
    </Modal>
  );
};
