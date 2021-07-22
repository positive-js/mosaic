## Overview

Design tokens are special variables used to maintain a scalable
visual system for UI development and brand consistency.
Mosaic design tokens store the visual design attributes that define the foundation
of Positive Technologies visual language, including color, typography, and spacing.


Design tokens are key-value pairs. For example:
```
Key: value;
$card-dark-color-scheme-success-background: #276211;
```
- The key name defines the usage or how to apply the value to a specific context, such as using text on a light background
- The key stores visual design attributes
- The key replaces hard-coded values, such as hex values for color or pixel values for spacing

### Contract of Intent
- Tokens are versioned and maintained by the UX team
- Consumers are required to stay within one major version of the current release

### Benefits

#### Improved UI Development
- Promotes greater visual consistency and maintainability (when there are changes to brand elements)
- Aligns with brand standards
- Consumers can stay in sync with any changes to the visual language with minimal impact to the code

#### Ease of Maintainability
Design Tokens can streamline redesign processes when:
- The Mosaic team updates a **value** (such as with a new typeface or color hex value),
  the **tokens** do not need to be changed in code by consumers
- Teams can consume these changes from SEMVER releases to our supported packages

#### Brand Consistency on Any Platform
- Extends the distribution of the Positive Technologies visual language across platforms
- Ensures brand consistency across all digital channels

#### Extensibility
- Designers and developers have access to design tokens when creating custom components
  for their applications (within brand standards)

### Use When
Design Tokens can be used by teams:
- To supplement components when designing page layouts
- To create custom components that are visually aligned to the Positive Technologies brand styles
- To create new components that can be contributed back to the system

### Don't Use When
- Don’t use design tokens to make modifications to an existing Mosaic component.
- Don’t use design tokens to only access a value or values when the token name does not match it's application
  (for example, don't use a 'color-background-button' token to style a border or an element that is not a button).

Questions about when to use design tokens? Ask the Mosaic team

## How to Use Tokens

### For Designers
Soon...

### For Developers
A base requirement for using Mosaic design tokens is that you are able
to consume and maintain packages through the following development processes:
- Web consumers:
    - Your project can compile CSS variables and SCSS
    - You can import NPM packages


