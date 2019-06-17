# Navbar component

## Objectives

-   create the navbar component
-   create child components to get them included into it

## Allowed child components

We strongly recommend adhere to use our child components until it is possible but you are free to insert there what you want.

 - left\right side container **mc-navbar-section**
   - product\company title **mc-navbar-brand**
   - logo container **mc-navbar-logo**
     - any markup
       - **mc-navbar-title** (please see below)
	 - title **mc-navbar-title**
	   - any markup, only font size, font color, font family is gonna be styled
	- menu item container **mc-navbar-item**
	  - icon **[mc-icon]** (another PT Mosaic component, out of the scope of this)
	  - title **mc-navbar-title**
    - dropdown **[mc-dropdown]** (another PT Mosaic component, out of the scope of this)
	  - any markup
	- any markup
- any markup

## States

We believe you are able to manage navbar child components from outside. Meantime we provide number of mc-navbar-item states based on css classes which may be combined between each others.

 - mc-navbar-item-active - selected item
 - mc-progress - something in progress (striped animation)
 - cdk-focused - focused state, we control it as well for common tab order behaviour
 
Disable state also could be combined with other states but it is **disabled** attribute.

## Collapsing
In the case that absence of space the following elements is collapsed:

-  mc-navbar-item is collapsed to [mc-icon] if exists (if not then the item is not collapsed). The title attribute is added for [mc-icon] from mc-navbar-item's [collapsedTitle] input value;
-  mc-navbar-item is collapsed to [mc-icon] if exists (if not then the item is not collapsed). 
