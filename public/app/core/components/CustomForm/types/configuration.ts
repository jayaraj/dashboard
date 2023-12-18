import { FormElement } from './form-element';
import { LayoutSection } from './layout-section';

export interface Configuration {
  sections: LayoutSection[];
  elements: FormElement[];
}
