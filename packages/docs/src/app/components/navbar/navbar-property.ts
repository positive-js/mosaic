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
        if (this.updateTemplate) { this.updateTemplate(i); }
        if (this.updateSelected) { this.updateSelected(i); }
    }

    init() {
        const currentValue = +localStorage.getItem(this.property);

        if (currentValue) {
            this.setValue(currentValue);
        } else {
            localStorage.setItem(this.property, '0');
        }
    }

    updateTemplate(i: number) {
        if (this.currentValue) {
            for (const color of this.data) {
                document.body.classList.remove(color.className);
            }

            document.body.classList.add(this.currentValue.className);
        }
    }

    updateSelected(i: number) {
        this.data.forEach((color) => {
            color.selected = false;
        });
        this.data[i].selected = true;
    }
}
