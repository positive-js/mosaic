export interface INavbarProperty {
    // name of local storage property
    property: string;

    // data array for dropdown
    data: any[];

    // Applies in NavbarProperty.setValue for additional actions (for example: change class on body)
    updateTemplate: boolean;

    // Applies in NavbarProperty.setValue for updating selected value
    updateSelected: boolean;
}

export class NavbarProperty {
    data: any[];
    currentValue: any;
    private readonly property: string;

    constructor(navbarProperty: INavbarProperty) {
        this.data = navbarProperty.data;
        this.currentValue = this.data[0];
        this.property = navbarProperty.property;

        this.init();
    }

    setValue(i: number) {
        this.currentValue = this.data[i];
        localStorage.setItem(this.property, `${i}`);

        if (this.updateTemplate) {
            this.updateTemplate();
        }

        if (this.updateSelected) {
            this.updateSelected(i);
        }
    }

    init() {
        const currentValue = parseInt(localStorage.getItem(this.property) as string);

        if (currentValue) {
            this.setValue(currentValue);
        } else {
            localStorage.setItem(this.property, '0');
        }
    }

    private updateTemplate() {
        if (!this.currentValue) { return; }

        for (const color of this.data) {
            document.body.classList.remove(color.className);
        }

        document.body.classList.add(this.currentValue.className);
    }

    private updateSelected(i: number) {
        if (this.data[i]) {
            this.data.forEach((color) => color.selected = false);
            this.data[i].selected = true;
        }
    }
}
