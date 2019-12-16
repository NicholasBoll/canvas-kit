import * as h from '../helpers';

function getColorInputComponent(id: string) {
  return cy.get(`#${id}`).parent();
}

function getColorBox($component: JQuery): JQuery {
  return $component.find('div').first();
}

describe('ColorInput', () => {
  before(() => {
    cy.viewport(300, 100);
    h.stories.visit();
  });

  context('given ColorInput is rendered', () => {
    beforeEach(() => {
      h.stories.load('Form Field/Color Picker/Color Input/Top Label', 'Default');
    });

    it('should match input id and label for attributes', () => {
      cy.get('label').should($el => {
        const id = $el.attr('for');
        const $input = Cypress.$(`#${id}`);
        expect($input).to.have.attr('id', id);
      });
    });

    context('when the color is changed to "#e6e6e6"', () => {
      beforeEach(() => {
        getColorInputComponent('input-plain')
          .find('input')
          .type('e6e6e6');
      });

      it.only('should change the color of the color box to "#e6e6e6', () => {
        getColorInputComponent('input-plain')
          .pipe(getColorBox)
          .should('have.css', 'background-color', 'rgb(230, 230, 230)');
      });
    });
  });
});
