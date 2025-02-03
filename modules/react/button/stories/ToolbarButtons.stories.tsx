import {Meta} from '@storybook/react';
import * as React from 'react';

import {ToolbarDropdownButton, ToolbarIconButton} from '@workday/canvas-kit-react/button';
import {Menu} from '@workday/canvas-kit-react/menu';
import {Tooltip} from '@workday/canvas-kit-react/tooltip';
import {activityStreamIcon, zoominIcon} from '@workday/canvas-system-icons-web';

export default {
  title: 'Components/Buttons/Toolbar',
} satisfies Meta;

export const ToolbarIconButtonStory = () => {
  const [toggled, setToggled] = React.useState<boolean | undefined>();
  const handleToggle = () => {
    setToggled(!toggled);
  };

  return (
    <div className="story">
      <h3>Toolbar Icon Button</h3>
      <ToolbarIconButton aria-label="Activity Stream" icon={activityStreamIcon} />
      <ToolbarIconButton aria-label="Activity Stream" icon={activityStreamIcon} disabled={true} />
      <h3>Toggleable Toolbar Icon Button</h3>
      <ToolbarIconButton
        aria-label="Activity Stream"
        icon={activityStreamIcon}
        toggled={toggled}
        onClick={handleToggle}
      />
    </div>
  );
};

export const ToolbarDropdownButtonStory = () => (
  <div className="story">
    <h3>Toolbar Dropdown Button with Menu</h3>
    <Menu>
      <Tooltip title="Expand">
        <Menu.Target
          as={ToolbarDropdownButton}
          icon={zoominIcon}
          onClick={() => {
            console.log('Expand icon clicked');
          }}
        ></Menu.Target>
      </Tooltip>
      <Menu.Popper>
        <Menu.Card>
          <Menu.List>
            <Menu.Item
              onClick={() => {
                console.log('Expand All clicked');
              }}
            >
              Expand All
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                console.log('Expand to Leaf Level clicked');
              }}
            >
              Expand to Leaf Level
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                console.log('Expand to nth Level clicked');
              }}
            >
              Expand to nth Level
            </Menu.Item>
          </Menu.List>
        </Menu.Card>
      </Menu.Popper>
    </Menu>
  </div>
);
