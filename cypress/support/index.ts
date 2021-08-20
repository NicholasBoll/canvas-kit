import 'cypress-pipe';
import './cypress-plugin-tab';
import 'cypress-axe';
import 'cypress-storybook/cypress';
import 'cypress-keyboard-plugin';
import '@testing-library/cypress/add-commands';

import {extendJQuery} from 'testing-library-jquery';

extendJQuery(cy.$$);

import './commands';
