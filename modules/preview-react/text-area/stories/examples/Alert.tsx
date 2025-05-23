import React from 'react';
import {TextArea} from '@workday/canvas-kit-preview-react/text-area';
import {useThemedRing} from '@workday/canvas-kit-react/common';
import {space, colors} from '@workday/canvas-kit-react/tokens';
import {Text} from '@workday/canvas-kit-react/text';

export const Alert = () => {
  const [value, setValue] = React.useState('Hello');

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value.slice(0, 10));
  };

  const alertStyles = useThemedRing(
    value.length < 3 ? 'success' : value.length < 7 ? 'alert' : 'error'
  );

  const hintColor =
    value.length < 3
      ? colors.greenApple600
      : value.length < 7
      ? colors.blackPepper300
      : colors.cinnamon500;

  return (
    <TextArea orientation="vertical">
      <TextArea.Label>Add a comment</TextArea.Label>
      <TextArea.Field cs={alertStyles} onChange={handleChange} value={value} />
      <TextArea.Hint paddingTop={space.xxs}>
        <strong>Character Limit: </strong>
        <Text color={hintColor}>{10 - value.length} Left</Text>
      </TextArea.Hint>
    </TextArea>
  );
};
