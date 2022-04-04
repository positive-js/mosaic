/* tslint:disable:no-magic-numbers */
/* tslint:disable:mocha-no-side-effect-code */
/* tslint:disable:no-non-null-assertion */
/* tslint:disable:no-empty */
/* tslint:disable:no-unbound-method */
/* tslint:disable:prefer-for-of */

// TODO: fix linter
// tslint:disable
import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {
    waitForAsync,
    ComponentFixture,
    fakeAsync,
    flush,
    inject,
    TestBed,
    tick
} from '@angular/core/testing';
import {
    ControlValueAccessor,
    FormControl,
    FormGroup,
    FormGroupDirective,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW,
    A, ESCAPE
} from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    wrappedErrorMessage, dispatchMouseEvent
} from '@ptsecurity/cdk/testing';
import {
    ErrorStateMatcher,
    McOption,
    McOptionSelectionChange,
    getMcSelectDynamicMultipleError,
    getMcSelectNonArrayValueError,
    getMcSelectNonFunctionValueError
} from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { McSelectModule } from './index';
import { McSelect } from './select.component';


/** The debounce interval when typing letters to select an option. */
const LETTER_KEY_DEBOUNCE_INTERVAL = 200;

const OPTIONS  =
    ['Abakan', 'Almetyevsk', 'Anadyr', 'Anapa', 'Arkhangelsk', 'Astrakhan', 'Barnaul', 'Belgorod', 'Beslan',
    'Biysk', 'Birobidzhan', 'Blagoveshchensk', 'Bologoye', 'Bryansk', 'Veliky Novgorod',
    'Veliky Ustyug', 'Vladivostok', 'Vladikavkaz', 'Vladimir', 'Volgograd', 'Vologda', 'Vorkuta',
    'Voronezh', 'Gatchina', 'Gdov', 'Gelendzhik', 'Gorno-Altaysk', 'Grozny', 'Gudermes',
    'Gus-Khrustalny', 'Dzerzhinsk', 'Dmitrov', 'Dubna', 'Yeysk', 'Yekaterinburg', 'Yelabuga', 'Yelets',
    'Yessentuki', 'Zlatoust', 'Ivanovo', 'Izhevsk', 'Irkutsk', 'Yoshkar-Ola', 'Kazan', 'Kaliningrad',
    'Kaluga', 'Kemerovo', 'Kislovodsk', 'Komsomolsk-on-Amur', 'Kotlas', 'Krasnodar', 'Krasnoyarsk', 'Kurgan',
    'Kursk', 'Kyzyl', 'Leninogorsk', 'Lensk', 'Lipetsk', 'Luga', 'Lyuban', 'Lyubertsy', 'Magadan', 'Maykop',
    'Makhachkala', 'Miass', 'Mineralnye Vody', 'Mirny', 'Moscow', 'Murmansk', 'Murom', 'Mytishchi',
    'Naberezhnye Chelny', 'Nadym', 'Nalchik', 'Nazran', 'Naryan-Mar', 'Nakhodka', 'Nizhnevartovsk',
    'Nizhnekamsk', 'Nizhny Novgorod', 'Nizhny Tagil', 'Novokuznetsk', 'Novosibirsk', 'Novy Urengoy',
    'Norilsk', 'Obninsk', 'Oktyabrsky', 'Omsk', 'Orenburg', 'Orekhovo-Zuyevo', 'Oryol', 'Penza', 'Perm',
    'Petrozavodsk', 'Petropavlovsk-Kamchatsky', 'Podolsk', 'Pskov', 'Pyatigorsk', 'Rostov-on-Don', 'Rybinsk',
    'Ryazan', 'Salekhard', 'Samara', 'Saint Petersburg', 'Saransk', 'Saratov', 'Severodvinsk', 'Smolensk',
    'Sol-Iletsk', 'Sochi', 'Stavropol', 'Surgut', 'Syktyvkar', 'Tambov', 'Tver', 'Tobolsk', 'Tolyatti', 'Tomsk',
    'Tuapse', 'Tula', 'Tynda', 'Tyumen', 'Ulan-Ude', 'Ulyanovsk', 'Ufa', 'Khabarovsk', 'Khanty-Mansiysk',
    'Chebarkul', 'Cheboksary', 'Chelyabinsk', 'Cherepovets', 'Cherkessk', 'Chistopol', 'Chita', 'Shadrinsk',
    'Shatura', 'Shuya', 'Elista', 'Engels', 'Yuzhno-Sakhalinsk', 'Yakutsk', 'Yaroslavl'];


@Component({
    selector: 'basic-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control" [required]="isRequired"
                        [tabIndex]="tabIndexOverride" [panelClass]="panelClass">
                <mc-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
        <div [style.height.px]="heightBelow"></div>
    `
})
class BasicSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl();
    isRequired: boolean;
    heightAbove = 0;
    heightBelow = 0;
    tabIndexOverride: number;
    panelClass = ['custom-one', 'custom-two'];

    @ViewChild(McSelect, { static: true }) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    selector: 'basic-events',
    template: `
        <mc-form-field>
            <mc-select
                (openedChange)="openedChangeListener($event)"
                (opened)="openedListener()"
                (closed)="closedListener()">

                <mc-option *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicEvents {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];

    @ViewChild(McSelect, { static: true }) select: McSelect;

    openedChangeListener = jasmine.createSpy('McSelect openedChange listener');
    openedListener = jasmine.createSpy('McSelect opened listener');
    closedListener = jasmine.createSpy('McSelect closed listener');
}

@Component({
    selector: 'ng-model-select',
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" ngModel [disabled]="isDisabled">
                <mc-option *ngFor="let food of foods"
                            [value]="food.value">{{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class NgModelSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    isDisabled: boolean;

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    selector: 'many-selects',
    template: `
        <mc-form-field>
            <mc-select placeholder="First">
                <mc-option [value]="'one'">one</mc-option>
                <mc-option [value]="'two'">two</mc-option>
            </mc-select>
        </mc-form-field>
        <mc-form-field>
            <mc-select placeholder="Second">
                <mc-option [value]="'three'">three</mc-option>
                <mc-option [value]="'four'">four</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class ManySelects {
}

@Component({
    selector: 'ng-if-select',
    template: `
        <div *ngIf="isShowing">
            <mc-form-field>
                <mc-select placeholder="Food I want to eat right now" [formControl]="control">
                    <mc-option *ngFor="let food of foods" [value]="food.value">
                        {{ food.viewValue }}
                    </mc-option>
                </mc-select>
            </mc-form-field>
        </div>
    `
})
class NgIfSelect {
    isShowing = false;
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new FormControl('pizza-1');

    @ViewChild(McSelect, {static: false}) select: McSelect;
}

@Component({
    selector: 'select-with-change-event',
    template: `
        <mc-form-field>
            <mc-select (selectionChange)="changeListener($event)">
                <mc-option *ngFor="let food of foods" [value]="food">{{ food }}</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithChangeEvent {
    foods: string[] = [
        'steak-0',
        'pizza-1',
        'tacos-2',
        'sandwich-3',
        'chips-4',
        'eggs-5',
        'pasta-6',
        'sushi-7'
    ];

    changeListener = jasmine.createSpy('McSelect change listener');
}

@Component({
    selector: 'select-with-search',
    template: `
        <mc-form-field>
            <mc-select #select [(value)]="singleSelectedWithSearch">
                <mc-form-field mcSelectSearch>
                    <input
                        mcInput
                        [formControl]="searchCtrl"
                        type="text" />
                </mc-form-field>

                <mc-option *ngFor="let option of options$ | async" [value]="option">{{ option }}</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithSearch {
    @ViewChild(McSelect, {static: false}) select: McSelect;

    singleSelectedWithSearch = 'Moscow';

    searchCtrl: FormControl = new FormControl();
    options$: Observable<string[]>;

    private options: string[] = OPTIONS;

    ngOnInit(): void {
        this.options$ = merge(
            of(OPTIONS),
            this.searchCtrl.valueChanges
                .pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    private getFilteredOptions(value): string[] {
        const searchFilter = (value && value.new) ? value.value : value;

        return searchFilter
            ? this.options.filter((option) =>
                option.toLowerCase().includes((searchFilter.toLowerCase())))
            : this.options;
    }
}

@Component({
    selector: 'custom-select-accessor',
    template: `
        <mc-form-field>
            <mc-select></mc-select>
        </mc-form-field>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomSelectAccessor,
        multi: true
    }]
})
class CustomSelectAccessor implements ControlValueAccessor {
    @ViewChild(McSelect, {static: false}) select: McSelect;

    writeValue: (value?: any) => void = () => {};
    registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
    registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
    selector: 'comp-with-custom-select',
    template: `
        <custom-select-accessor [formControl]="ctrl"></custom-select-accessor>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: CustomSelectAccessor,
        multi: true
    }]
})
class CompWithCustomSelect {
    ctrl = new FormControl('initial value');
    @ViewChild(CustomSelectAccessor, {static: true}) customAccessor: CustomSelectAccessor;
}

@Component({
    selector: 'select-infinite-loop',
    template: `
        <mc-form-field>
            <mc-select [(ngModel)]="value"></mc-select>
        </mc-form-field>
        <throws-error-on-init></throws-error-on-init>
    `
})
class SelectWithErrorSibling {
    value: string;
}

@Component({
    selector: 'throws-error-on-init',
    template: ''
})
class ThrowsErrorOnInit implements OnInit {
    ngOnInit() {
        throw Error('Oh no!');
    }
}

@Component({
    selector: 'basic-select-on-push',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectOnPush {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new FormControl();
}

@Component({
    selector: 'basic-select-on-push-preselected',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectOnPushPreselected {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new FormControl('pizza-1');
}

@Component({
    selector: 'multi-select',
    template: `
        <mc-form-field>
            <mc-select multiple placeholder="Food" [formControl]="control"
                       [sortComparator]="sortComparator">
                <mc-option *ngFor="let food of foods"
                           [value]="food.value">{{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class MultiSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl();

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
    sortComparator: (a: McOption, b: McOption, options: McOption[]) => number;
}

@Component({
    selector: 'select-with-plain-tabindex',
    template: `
        <mc-form-field>
            <mc-select [tabIndex]="5"></mc-select>
        </mc-form-field>`
})
class SelectWithPlainTabindex {}

@Component({
    selector: 'select-early-sibling-access',
    template: `
        <mc-form-field>
            <mc-select #select="mcSelect"></mc-select>
        </mc-form-field>
        <div *ngIf="select.selected"></div>
    `
})
class SelectEarlyAccessSibling {
}

@Component({
    selector: 'basic-select-initially-hidden',
    template: `
        <mc-form-field>
            <mc-select [style.display]="isVisible ? 'block' : 'none'">
                <mc-option [value]="'value'">There are no other options</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectInitiallyHidden {
    isVisible = false;
}

@Component({
    selector: 'basic-select-no-placeholder',
    template: `
        <mc-form-field>
            <mc-select>
                <mc-option [value]="'value'">There are no other options</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectNoPlaceholder {
}

@Component({
    selector: 'basic-select-with-theming',
    template: `
        <mc-form-field [color]="theme">
            <mc-select placeholder="Food">
                <mc-option [value]="'steak'-0">Steak</mc-option>
                <mc-option [value]="'pizza'-1">Pizza</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectWithTheming {
    @ViewChild(McSelect, {static: false}) select: McSelect;
    theme: string;
}

@Component({
    selector: 'reset-values-select',
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
                <mc-option>None</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class ResetValuesSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: false, viewValue: 'Falsy' },
        { viewValue: 'Undefined' },
        { value: null, viewValue: 'Null' }
    ];
    control = new FormControl();

    @ViewChild(McSelect, {static: false}) select: McSelect;
}

@Component({
    template: `
        <mc-form-field>
            <mc-select [formControl]="control">
                <mc-option *ngFor="let food of foods"
                           [value]="food.value">{{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class FalsyValueSelect {
    foods: any[] = [
        { value: 0, viewValue: 'Steak' },
        { value: 1, viewValue: 'Pizza' }
    ];
    control = new FormControl();
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    selector: 'select-with-groups',
    template: `
        <mc-form-field>
            <mc-select placeholder="Pokemon" [formControl]="control">
                <mc-optgroup *ngFor="let group of pokemonTypes" [label]="group.name" [disabled]="group.disabled">
                    <mc-option *ngFor="let pokemon of group.pokemon" [value]="pokemon.value">
                        {{ pokemon.viewValue }}
                    </mc-option>
                </mc-optgroup>
                <mc-option [value]="'mime'-11">Mr. Mime</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithGroups {
    control = new FormControl();
    pokemonTypes = [
        {
            name: 'Grass',
            pokemon: [
                { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
                { value: 'oddish-1', viewValue: 'Oddish' },
                { value: 'bellsprout-2', viewValue: 'Bellsprout' }
            ]
        },
        {
            name: 'Water',
            disabled: true,
            pokemon: [
                { value: 'squirtle-3', viewValue: 'Squirtle' },
                { value: 'psyduck-4', viewValue: 'Psyduck' },
                { value: 'horsea-5', viewValue: 'Horsea' }
            ]
        },
        {
            name: 'Fire',
            pokemon: [
                { value: 'charmander-6', viewValue: 'Charmander' },
                { value: 'vulpix-7', viewValue: 'Vulpix' },
                { value: 'flareon-8', viewValue: 'Flareon' }
            ]
        },
        {
            name: 'Psychic',
            pokemon: [
                { value: 'mew-9', viewValue: 'Mew' },
                { value: 'mewtwo-10', viewValue: 'Mewtwo' }
            ]
        }
    ];

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    selector: 'select-with-groups',
    template: `
        <mc-form-field>
            <mc-select placeholder="Pokemon" [formControl]="control">
                <mc-optgroup *ngFor="let group of pokemonTypes" [label]="group.name" [disabled]="group.disabled">
                    <ng-container *ngFor="let pokemon of group.pokemon">
                        <mc-option [value]="pokemon.value">{{ pokemon.viewValue }}</mc-option>
                    </ng-container>
                </mc-optgroup>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithGroupsAndNgContainer {
    control = new FormControl();
    pokemonTypes = [{
        name: 'Grass',
        pokemon: [{ value: 'bulbasaur-0', viewValue: 'Bulbasaur' }]
    }];
}

@Component({
    template: `
        <form>
            <mc-form-field>
                <mc-select [(ngModel)]="value"></mc-select>
            </mc-form-field>
        </form>
    `
})
class InvalidSelectInForm {
    value: any;
}

@Component({
    template: `
        <form [formGroup]="formGroup">
            <mc-form-field>
                <mc-select placeholder="Food" formControlName="food">
                    <mc-option [value]="'steak'-0">Steak</mc-option>
                    <mc-option [value]="'pizza'-1">Pizza</mc-option>
                </mc-select>

                <!--<mc-error>This field is required</mc-error>-->
            </mc-form-field>
        </form>
    `
})
class SelectInsideFormGroup {
    @ViewChild(FormGroupDirective, {static: false}) formGroupDirective: FormGroupDirective;
    @ViewChild(McSelect, {static: false}) select: McSelect;
    formControl = new FormControl('', Validators.required);
    formGroup = new FormGroup({
        food: this.formControl
    });
}

@Component({
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [(value)]="selectedFood">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutForms {
    selectedFood: string | null;
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'sandwich-2', viewValue: 'Sandwich' }
    ];

    @ViewChild(McSelect, {static: false}) select: McSelect;
}

@Component({
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [(value)]="selectedFood">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutFormsPreselected {
    selectedFood = 'pizza-1';
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];

    @ViewChild(McSelect, {static: false}) select: McSelect;
}

@Component({
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [(value)]="selectedFoods" multiple>
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class BasicSelectWithoutFormsMultiple {
    selectedFoods: string[];
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'sandwich-2', viewValue: 'Sandwich' }
    ];

    @ViewChild(McSelect, {static: false}) select: McSelect;
}

@Component({
    selector: 'select-with-custom-trigger',
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control" #select="mcSelect">
                <mc-select__trigger>
                    {{ select.selected?.viewValue.split('').reverse().join('') }}
                </mc-select__trigger>
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithCustomTrigger {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];
    control = new FormControl();
}

@Component({
    selector: 'ng-model-compare-with',
    template: `
        <mc-form-field>
            <mc-select [ngModel]="selectedFood" (ngModelChange)="setFoodByCopy($event)"
                       [compareWith]="comparator">
                <mc-option *ngFor="let food of foods" [value]="food">{{ food.viewValue }}</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class NgModelCompareWithSelect {
    foods: ({ value: string; viewValue: string })[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    selectedFood: { value: string; viewValue: string } = { value: 'pizza-1', viewValue: 'Pizza' };
    comparator: ((f1: any, f2: any) => boolean) | null = this.compareByValue;

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;

    useCompareByValue() {
        this.comparator = this.compareByValue;
    }

    useCompareByReference() {
        this.comparator = this.compareByReference;
    }

    useNullComparator() {
        this.comparator = null;
    }

    compareByValue(f1: any, f2: any) {
        return f1 && f2 && f1.value === f2.value;
    }

    compareByReference(f1: any, f2: any) {
        return f1 === f2;
    }

    setFoodByCopy(newValue: { value: string; viewValue: string }) {
        this.selectedFood = { ...{}, ...newValue };
    }
}

@Component({
    template: `
        <mc-select placeholder="Food" [formControl]="control" [errorStateMatcher]="errorStateMatcher">
            <mc-option *ngFor="let food of foods" [value]="food.value">
                {{ food.viewValue }}
            </mc-option>
        </mc-select>
    `
})
class CustomErrorBehaviorSelect {
    @ViewChild(McSelect, {static: false}) select: McSelect;
    control = new FormControl();
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];
    errorStateMatcher: ErrorStateMatcher;
}

@Component({
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [(ngModel)]="selectedFoods">
                <mc-option *ngFor="let food of foods"
                           [value]="food.value">{{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SingleSelectWithPreselectedArrayValues {
    foods: any[] = [
        { value: ['steak-0', 'steak-1'], viewValue: 'Steak' },
        { value: ['pizza-1', 'pizza-2'], viewValue: 'Pizza' },
        { value: ['tacos-2', 'tacos-3'], viewValue: 'Tacos' }
    ];

    selectedFoods = this.foods[1].value;

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    selector: 'select-without-option-centering',
    template: `
        <mc-form-field>
            <mc-select placeholder="Food" [formControl]="control">
                <mc-option *ngFor="let food of foods" [value]="food.value">
                    {{ food.viewValue }}
                </mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithoutOptionCentering {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl('pizza-1');

    @ViewChild(McSelect, {static: false}) select: McSelect;
    @ViewChildren(McOption) options: QueryList<McOption>;
}

@Component({
    template: `
        <mc-form-field>
            <!--<mc-label>Select a thing</mc-label>-->

            <mc-select [placeholder]="placeholder">
                <mc-option [value]="'thing'">A thing</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithFormFieldLabel {
    placeholder: string;
}

@Component({
    selector: 'select-with-long-label-option',
    template: `
        <mc-form-field>
            <mc-select>
                <mc-option [value]="'value1'">Not long text</mc-option>
                <mc-option style="max-width: 200px;" [value]="'value2'">Long long long long Long long long long Long long long long Long long long long Long long long long Long long long long text</mc-option>
                <mc-option style="max-width: 200px;" [value]="'value3'">{{ changingLabel }}</mc-option>
            </mc-select>
        </mc-form-field>
    `
})
class SelectWithLongOptionText {
    changingLabel: string = 'Changed Long long long long Long long long long Long long long long Long long long long Long long long long Long long long long text';
    counter: number = 0;

    changeLabel(): void {
        this.changingLabel = this.changingLabel.concat((this.counter++).toString());
    }
}

describe('McSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dir: { value: 'ltr' | 'rtl' };
    const scrolledSubject: Subject<any> = new Subject();
    let platform: Platform;

    /**
     * Configures the test module for McSelect with the given declarations. This is broken out so
     * that we're only compiling the necessary test components for each test in order to speed up
     * overall test time.
     * @param declarations Components to declare for this block
     */
    function configureMcSelectTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                McFormFieldModule,
                McSelectModule,
                McInputModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule,
            ],
            declarations,
            providers: [
                { provide: Directionality, useFactory: () => dir = { value: 'ltr' } },
                {
                    provide: ScrollDispatcher, useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable(),
                        getAncestorScrollContainers: () => [],
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer, Platform], (oc: OverlayContainer, p: Platform) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            platform = p;
        })();
    }

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(waitForAsync(() => {
            configureMcSelectTestingModule([
                BasicSelect,
                BasicEvents,
                MultiSelect,
                SelectWithGroups,
                SelectWithGroupsAndNgContainer,
                SelectWithFormFieldLabel,
                SelectWithChangeEvent
            ]);
        }));

        describe('accessibility', () => {
            describe('for select', () => {
                let fixture: ComponentFixture<BasicSelect>;
                let select: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicSelect);
                    fixture.detectChanges();
                    select = fixture.debugElement.query(By.css('mc-select')).nativeElement;
                }));

                it('should set the tabindex of the select to 0 by default', fakeAsync(() => {
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should be able to override the tabindex', fakeAsync(() => {
                    fixture.componentInstance.tabIndexOverride = 3;
                    fixture.detectChanges();

                    expect(select.getAttribute('tabindex')).toBe('3');
                }));

                it('should set the tabindex of the select to -1 if disabled', fakeAsync(() => {
                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('-1');

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should select options via the UP/DOWN arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
                    expect(formControl.value).toBe(options[0].value,
                        'Expected value from first option to have been set on the model.');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
                    expect(formControl.value).toBe(options[3].value,
                        'Expected value from fourth option to have been set on the model.');

                    dispatchKeyboardEvent(select, 'keydown', UP_ARROW);
                    flush();

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(options[1].value,
                        'Expected value from second option to have been set on the model.');
                }));

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    fixture.componentInstance.select.open();
                    fixture.detectChanges();
                    flush();

                    (overlayContainerElement.querySelectorAll('mc-option')[3] as HTMLElement).click();
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[4].value);
                }));

                it('should select options via LEFT/RIGHT arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    expect(options[0].selected).toBe(true, 'Expected first option to be selected.');
                    expect(formControl.value).toBe(options[0].value,
                        'Expected value from first option to have been set on the model.');

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).toBe(true, 'Expected fourth option to be selected.');
                    expect(formControl.value).toBe(options[3].value,
                        'Expected value from fourth option to have been set on the model.');

                    dispatchKeyboardEvent(select, 'keydown', LEFT_ARROW);
                    flush();

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(options[1].value,
                        'Expected value from second option to have been set on the model.');
                }));

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');
                    expect(formControl.value).toBeFalsy('Expected value not to have changed.');
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');
                    expect(formControl.value).toBeFalsy('Expected value not to have changed.');
                }));

                it('should should close when pressing ALT + DOWN_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(event.defaultPrevented).toBe(true, 'Expected default action to be prevented.');
                }));

                it('should should close when pressing ALT + UP_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).toBe(true, 'Expected select to be open.');

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(false, 'Expected select to be closed.');
                    expect(event.defaultPrevented).toBe(true, 'Expected default action to be prevented.');
                }));

                it('should be able to select options by typing on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy('Expected no initial value.');

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(200);

                    expect(options[1].selected).toBe(true, 'Expected second option to be selected.');
                    expect(formControl.value).toBe(options[1].value,
                        'Expected value from second option to have been set on the model.');

                    dispatchEvent(select, createKeyboardEvent('keydown', 69, undefined, 'e'));
                    tick(200);

                    expect(options[5].selected).toBe(true, 'Expected sixth option to be selected.');
                    expect(formControl.value).toBe(options[5].value,
                        'Expected value from sixth option to have been set on the model.');
                }));

                it('should open the panel when pressing a vertical arrow key on a closed multiple select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                        const initialValue = instance.control.value;

                        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                        const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        flush();

                        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
                        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
                    }));

                it('should open the panel when pressing a horizontal arrow key on closed multiple select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                        const initialValue = instance.control.value;

                        expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                        const event = dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                        flush();

                        expect(instance.select.panelOpen).toBe(true, 'Expected panel to be open.');
                        expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                        expect(event.defaultPrevented).toBe(true, 'Expected default to be prevented.');
                    }));

                it('should do nothing when typing on a closed multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).toBe(false, 'Expected panel to be closed.');

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    flush();

                    expect(instance.select.panelOpen).toBe(false, 'Expected panel to stay closed.');
                    expect(instance.control.value).toBe(initialValue, 'Expected value to stay the same.');
                }));

                it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    expect(formControl.value).toBeNull('Expected form control value to be empty.');
                    expect(formControl.pristine).toBe(true, 'Expected form control to be clean.');

                    dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.

                    expect(formControl.value).toBeNull('Expected form control value to stay empty.');
                    expect(formControl.pristine).toBe(true, 'Expected form control to stay clean.');
                }));

                it('should continue from the selected option when the value is set programmatically',
                    fakeAsync(() => {
                        const formControl = fixture.componentInstance.control;

                        formControl.setValue('eggs-5');

                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        flush();

                        expect(formControl.value).toBe('pasta-6');
                        expect(fixture.componentInstance.options.toArray()[6].selected).toBe(true);
                    }));

                xit('should not shift focus when the selected options are updated programmatically ' +
                    'in a multi select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;
                    multiFixture.componentInstance.select.open();

                    const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

                    options[3].focus();
                    expect(document.activeElement).toBe(options[3], 'Expected fourth option to be focused.');

                    multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);

                    expect(document.activeElement)
                        .toBe(options[3], 'Expected fourth option to remain focused.');
                }));

                it('should not cycle through the options if the control is disabled', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');
                    formControl.disable();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(formControl.value).toBe('eggs-5', 'Expected value to remain unchaged.');
                }));

                it('should not wrap selection after reaching the end of the options', fakeAsync(() => {
                    const lastOption = fixture.componentInstance.options.last;

                    fixture.componentInstance.options.forEach(() => {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    });

                    expect(lastOption.selected).toBe(true, 'Expected last option to be selected.');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(lastOption.selected).toBe(true, 'Expected last option to stay selected.');
                }));

                it('should not open a multiple select when tabbing through', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .toBe(false, 'Expected panel to be closed initially.');

                    dispatchKeyboardEvent(select, 'keydown', TAB);
                    flush();

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .toBe(false, 'Expected panel to stay closed.');
                }));

                it('should toggle the next option when pressing shift + DOWN_ARROW on a multi-select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const event = createKeyboardEvent('keydown', DOWN_ARROW);
                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        expect(multiFixture.componentInstance.select.value).toBeFalsy();

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1']);

                        dispatchEvent(select, event);
                        flush();

                        expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1', 'tacos-2']);
                    }));

                xit('should toggle the previous option when pressing shift + UP_ARROW on a multi-select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const event = createKeyboardEvent('keydown', UP_ARROW);
                        Object.defineProperty(event, 'shiftKey', { get: () => true });

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;

                        multiFixture.componentInstance.select.open();
                        multiFixture.detectChanges();
                        flush();

                        // Move focus down first.
                        for (let i = 0; i < 5; i++) {
                            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                            multiFixture.detectChanges();
                        }

                        expect(multiFixture.componentInstance.select.value).toBeFalsy();

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['chips-4']);

                        dispatchEvent(select, event);
                        expect(multiFixture.componentInstance.select.value).toEqual(['sandwich-3', 'chips-4']);
                    }));

                it('should prevent the default action when pressing space', fakeAsync(() => {
                    const event = dispatchKeyboardEvent(select, 'keydown', SPACE);
                    flush();

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should consider the selection a result of a user action when closed', fakeAsync(() => {
                    const option = fixture.componentInstance.options.first;
                    const spy = jasmine.createSpy('option selection spy');
                    const subscription =
                        option.onSelectionChange.pipe(map((e) => e.isUserInput)).subscribe(spy);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    expect(spy).toHaveBeenCalledWith(true);
                    flush();

                    subscription.unsubscribe();
                }));

                it('should be able to focus the select trigger', fakeAsync(() => {
                    document.body.focus(); // ensure that focus isn't on the trigger already

                    fixture.componentInstance.select.focus();

                    expect(document.activeElement).toBe(select, 'Expected select element to be focused.');
                }));

                xit('should restore focus to the trigger after selecting an option in multi-select mode',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);
                        const instance = multiFixture.componentInstance;

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('mc-select')).nativeElement;
                        instance.select.open();

                        // Ensure that the select isn't focused to begin with.
                        select.blur();
                        expect(document.activeElement).not.toBe(select, 'Expected trigger not to be focused.');

                        const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                        option.click();
                        expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');
                    }));
            });

            describe('for options', () => {
                let fixture: ComponentFixture<BasicSelect>;
                let trigger: HTMLElement;
                let options: NodeListOf<HTMLElement>;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicSelect);
                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    options = overlayContainerElement.querySelectorAll('mc-option');
                }));

                it('should set the tabindex of each option according to disabled state', fakeAsync(() => {
                    expect(options[0].getAttribute('tabindex')).toEqual('0');
                    expect(options[1].getAttribute('tabindex')).toEqual('0');
                    expect(options[2].getAttribute('tabindex')).toEqual('-1');
                }));
            });
        });

        describe('overlay panel', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            }));

            it('should not throw when attempting to open too early', () => {
                // Create component and then immediately open without running change detection
                fixture = TestBed.createComponent(BasicSelect);
                expect(() => fixture.componentInstance.select.open()).not.toThrow();
            });

            it('should open the panel when trigger is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(overlayContainerElement.textContent).toContain('Steak');
                expect(overlayContainerElement.textContent).toContain('Pizza');
                expect(overlayContainerElement.textContent).toContain('Tacos');
            }));

            it('should close the panel when an item is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when a click occurs outside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));

            it('should not attempt to open a select that does not have any options', fakeAsync(() => {
                fixture.componentInstance.foods = [];
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when tabbing out', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should restore focus to the host before tabbing away', fakeAsync(() => {
                const select = fixture.nativeElement.querySelector('.mc-select');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                // Use a spy since focus can be flaky in unit tests.
                spyOn(select, 'focus').and.callThrough();

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(select.focus).toHaveBeenCalled();
            }));

            it('should close when tabbing out from inside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const panel = overlayContainerElement.querySelector('.mc-select__panel')!;
                dispatchKeyboardEvent(panel, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should focus the first option when pressing HOME', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(0);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should focus the last option when pressing END', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(7);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to set extra classes on the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const panel = overlayContainerElement.querySelector('.mc-select__panel') as HTMLElement;

                expect(panel.classList).toContain('custom-one');
                expect(panel.classList).toContain('custom-two');
            }));

            it('should prevent the default action when pressing SPACE on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as Node;
                const event = dispatchKeyboardEvent(option, 'keydown', SPACE);
                flush();

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should prevent the default action when pressing ENTER on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as Node;
                const event = dispatchKeyboardEvent(option, 'keydown', ENTER);
                flush();

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to render options inside groups with an ng-container', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroupsAndNgContainer);
                groupFixture.detectChanges();
                trigger = groupFixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
                trigger.click();
                groupFixture.detectChanges();
                flush();

                expect(document.querySelectorAll('.cdk-overlay-container mc-option').length)
                    .toBeGreaterThan(0, 'Expected at least one option to be rendered.');
            }));

            it('should not consider itself as blurred if the trigger loses focus while the ' +
                'panel is still open', fakeAsync(() => {
                const selectElement = fixture.nativeElement.querySelector('.mc-select');
                const selectInstance = fixture.componentInstance.select;

                dispatchFakeEvent(selectElement, 'focus');
                fixture.detectChanges();

                /* tslint:disable-next-line:deprecation */
                expect(selectInstance.focused).toBe(true, 'Expected select to be focused.');

                selectInstance.open();
                fixture.detectChanges();
                flush();
                dispatchFakeEvent(selectElement, 'blur');
                fixture.detectChanges();

                /* tslint:disable-next-line:deprecation */
                expect(selectInstance.focused).toBe(true, 'Expected select element to remain focused.');
            }));
        });

        describe('selection logic', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            }));

            it('should focus the first option if no option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toEqual(0);
            }));

            it('should select an option when it is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

                expect(option.classList).toContain('mc-selected');
                expect(fixture.componentInstance.options.first.selected).toBe(true);
                expect(fixture.componentInstance.select.selected)
                    .toBe(fixture.componentInstance.options.first);
            }));

            it('should be able to select an option using the McOption API', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const optionInstances = fixture.componentInstance.options.toArray();
                const optionNodes: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

                optionInstances[1].select();
                fixture.detectChanges();
                flush();

                expect(optionNodes[1].classList).toContain('mc-selected');
                expect(optionInstances[1].selected).toBe(true);
                expect(fixture.componentInstance.select.selected).toBe(optionInstances[1]);
            }));

            it('should deselect other options when one is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('mc-option');
                expect(options[1].classList).not.toContain('mc-selected');
                expect(options[2].classList).not.toContain('mc-selected');

                const optionInstances = fixture.componentInstance.options.toArray();
                expect(optionInstances[1].selected).toBe(false);
                expect(optionInstances[2].selected).toBe(false);
            }));

            it('should deselect other options when one is programmatically selected', fakeAsync(() => {
                const control = fixture.componentInstance.control;
                const foods = fixture.componentInstance.foods;

                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                control.setValue(foods[1].value);
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('mc-option');

                expect(options[0].classList)
                    .not.toContain('mc-selected', 'Expected first option to no longer be selected');
                expect(options[1].classList)
                    .toContain('mc-selected', 'Expected second option to be selected');

                const optionInstances = fixture.componentInstance.options.toArray();

                expect(optionInstances[0].selected)
                    .toBe(false, 'Expected first option to no longer be selected');
                expect(optionInstances[1].selected)
                    .toBe(true, 'Expected second option to be selected');
            }));

            it('should display the selected option in the trigger', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                const value = fixture.debugElement.query(By.css('.mc-select__matcher')).nativeElement;

                expect(value.textContent).toContain('Steak');
            }));

            it('should focus the selected option if an option is selected', fakeAsync(() => {
                // must wait for initial writeValue promise to finish
                flush();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                // must wait for animation to finish
                fixture.detectChanges();
                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toEqual(1);
            }));

            it('should select an option that was added after initialization', fakeAsync(() => {
                fixture.componentInstance.foods.push({ viewValue: 'Potatoes', value: 'potatoes-8' });
                trigger.click();
                fixture.detectChanges();
                flush();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
                options[8].click();
                fixture.detectChanges();
                flush();

                expect(trigger.textContent).toContain('Potatoes');
                expect(fixture.componentInstance.select.selected)
                    .toBe(fixture.componentInstance.options.last);
            }));

            it('should update the trigger when the selected option label is changed', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(trigger.querySelector('.mc-select__matcher-text')!.textContent!.trim())
                    .toBe('Pizza');

                fixture.componentInstance.foods[1].viewValue = 'Calzone';
                fixture.detectChanges();
                flush();

                expect(trigger.querySelector('.mc-select__matcher-text')!.textContent!.trim())
                    .toBe('Calzone');
            }));

            it('should not select disabled options', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.select.selected).toBeUndefined();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
                options[2].click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[2].classList).not.toContain('mc-selected');
                expect(fixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not select options inside a disabled group', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                groupFixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement.click();
                groupFixture.detectChanges();

                const disabledGroup = overlayContainerElement.querySelectorAll('mc-optgroup')[1];
                const options: NodeListOf<HTMLElement> = disabledGroup.querySelectorAll('mc-option');

                options[0].click();
                groupFixture.detectChanges();
                flush();

                expect(groupFixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[0].classList).not.toContain('mc-selected');
                expect(groupFixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not throw if triggerValue accessed with no selected value', fakeAsync(() => {
                expect(() => fixture.componentInstance.select.triggerValue).not.toThrow();
            }));

            it('should emit to `optionSelectionChanges` when an option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const spy = jasmine.createSpy('option selection spy');
                const subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(McOptionSelectionChange));

                subscription.unsubscribe();
            }));

            it('should handle accessing `optionSelectionChanges` before the options are initialized',
                fakeAsync(() => {
                    fixture.destroy();
                    fixture = TestBed.createComponent(BasicSelect);

                    const spy = jasmine.createSpy('option selection spy');
                    let subscription: Subscription;

                    expect(fixture.componentInstance.select.options).toBeFalsy();
                    expect(() => {
                        subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                    }).not.toThrow();

                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    expect(spy).toHaveBeenCalledWith(jasmine.any(McOptionSelectionChange));

                    /* tslint:disable-next-line:no-unnecessary-type-assertion */
                    subscription!.unsubscribe();
                }));
            });

        describe('forms integration', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            }));

            it('should take an initial view value with reactive forms', fakeAsync(() => {
                fixture.componentInstance.control = new FormControl('pizza-1');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-select__matcher'));
                expect(value.nativeElement.textContent)
                    .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

                trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-option');
                expect(options[1].classList)
                    .toContain('mc-selected',
                        `Expected option with the control's initial value to be selected.`);
            }));

            it('should set the view value from the form', fakeAsync(() => {
                let value = fixture.debugElement.query(By.css('.mc-select__matcher'));
                expect(value.nativeElement.textContent.trim()).toBe('Food');

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                value = fixture.debugElement.query(By.css('.mc-select__matcher'));
                expect(value.nativeElement.textContent)
                    .toContain('Pizza', `Expected trigger to be populated by the control's new value.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-option');
                expect(options[1].classList).toContain(
                    'mc-selected', `Expected option with the control's new value to be selected.`);
            }));

            it('should update the form value when the view changes', fakeAsync(() => {
                expect(fixture.componentInstance.control.value)
                    .toEqual(null, `Expected the control's value to be empty initially.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.value)
                    .toEqual('steak-0', `Expected control's value to be set to the new option.`);
            }));

            it('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.setValue('gibberish');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .toBe('Food', `Expected trigger to show the placeholder.`);
                expect(trigger.textContent)
                    .not.toContain('Pizza', `Expected trigger is cleared when option value is not found.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-option');
                expect(options[1].classList)
                    .not.toContain('mc-selected', `Expected option w/ the old value not to be selected.`);
            }));


            it('should clear the selection when the control is reset', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.mc-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .toBe('Food', `Expected trigger to show the placeholder.`);
                expect(trigger.textContent)
                    .not.toContain('Pizza', `Expected trigger is cleared when option value is not found.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const options =
                    overlayContainerElement.querySelectorAll('mc-option');
                expect(options[1].classList)
                    .not.toContain('mc-selected', `Expected option w/ the old value not to be selected.`);
            }));

            it('should set the control to touched when the select is blurred', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toEqual(false, `Expected the control to start off as untouched.`);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toEqual(false, `Expected the control to stay untouched when menu opened.`);

                document.body.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toEqual(true, `Expected the control to be touched as soon as focus left the select.`);
            }));

            it('should set the control to touched when the panel is closed', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to stay untouched when dropdown opened.');

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .toBe(true, 'Expected the control to be touched when the panel was closed.');
            }));

            it('should not set touched when a disabled select is touched', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                fixture.componentInstance.control.disable();
                dispatchFakeEvent(trigger, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to stay untouched.');
            }));

            it('should set the control to dirty when the select value changes in DOM', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .toEqual(false, `Expected control to start out pristine.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.dirty)
                    .toEqual(true, `Expected control to be dirty after value was changed by user.`);
            }));

            it('should not set the control to dirty when the value changes programmatically',
                fakeAsync(() => {
                    expect(fixture.componentInstance.control.dirty)
                        .toEqual(false, `Expected control to start out pristine.`);

                    fixture.componentInstance.control.setValue('pizza-1');

                    expect(fixture.componentInstance.control.dirty)
                        .toEqual(false, `Expected control to stay pristine after programmatic change.`);
                }));

            xit('should set an asterisk after the label if control is required', fakeAsync(() => {
                let requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
                expect(requiredMarker)
                    .toBeNull(`Expected label not to have an asterisk, as control was not required.`);

                fixture.componentInstance.isRequired = true;
                fixture.detectChanges();

                requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
                expect(requiredMarker)
                    .not.toBeNull(`Expected label to have an asterisk, as control was required.`);
            }));
        });

        describe('disabled behavior', () => {
            it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                const fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .toEqual('', `Expected select panel to stay closed.`);
                expect(fixture.componentInstance.select.panelOpen)
                    .toBe(false, `Expected select panelOpen property to stay false.`);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();
                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
                expect(fixture.componentInstance.select.panelOpen)
                    .toBe(true, `Expected select panelOpen property to become true.`);
            }));
        });

        describe('keyboard scrolling', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let host: HTMLElement;
            let panel: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);

                fixture.componentInstance.foods = [];

                for (let i = 0; i < 30; i++) {
                    fixture.componentInstance.foods.push({ value: `value-${i}`, viewValue: `Option ${i}` });
                }

                fixture.detectChanges();
                fixture.componentInstance.select.open();
                fixture.detectChanges();
                flush();

                host = fixture.debugElement.query(By.css('mc-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.mc-select__content') as HTMLElement;
            }));

            it('should not scroll to options that are completely in the view', fakeAsync(() => {
                const initialScrollPosition = panel.scrollTop;

                [1, 2, 3].forEach(() => {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                });
                flush();

                expect(panel.scrollTop)
                    .toBe(initialScrollPosition, 'Expected scroll position not to change');
            }));

            it('should scroll down to the active option', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }
                flush();

                expect(panel.scrollTop).toBe(316, 'Expected scroll to be at the 16th option.');
            }));

            it('should scroll up to the active option', fakeAsync(() => {
                // Scroll to the bottom.
                for (let i = 0; i < fixture.componentInstance.foods.length; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }

                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
                }
                flush();

                expect(panel.scrollTop).toBe(252, 'Expected scroll to be at the 9th option.');
            }));

            it('should skip option group labels', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);

                groupFixture.detectChanges();
                groupFixture.componentInstance.select.open();
                groupFixture.detectChanges();
                flush();

                host = groupFixture.debugElement.query(By.css('mc-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.mc-select__content') as HTMLElement;

                for (let i = 0; i < 5; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }
                flush();

                // Note that we press down 5 times, but it will skip
                // 3 options because the second group is disabled.
                expect(panel.scrollTop).toBe(188, 'Expected scroll to be at the 9th option.');
            }));

            it('should scroll top the top when pressing HOME', fakeAsync(() => {
                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                }

                expect(panel.scrollTop).toBeGreaterThan(0, 'Expected panel to be scrolled down.');

                dispatchKeyboardEvent(host, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(panel.scrollTop).toBe(0, 'Expected panel to be scrolled to the top');
            }));

            it('should scroll to the bottom of the panel when pressing END', fakeAsync(() => {
                dispatchKeyboardEvent(host, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(panel.scrollTop).toBe(728, 'Expected panel to be scrolled to the bottom');
            }));

            it('should scroll to the active option when typing', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    // Press the letter 'o' 15 times since all the options are named 'Option <index>'
                    dispatchEvent(host, createKeyboardEvent('keydown', 79, undefined, 'o'));
                    fixture.detectChanges();
                    tick(LETTER_KEY_DEBOUNCE_INTERVAL);
                }
                flush();

                expect(panel.scrollTop).toBe(316, 'Expected scroll to be at the 16th option.');
            }));
        });

        describe('Events', () => {
            let fixture: ComponentFixture<BasicEvents>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicEvents);

                fixture.detectChanges();
                flush();

                trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            }));

            it('should fire openedChange event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();
            }));

            it('should fire openedChange event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalledTimes(2);
            }));

            it('should fire opened event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedListener).toHaveBeenCalled();
            }));

            it('should fire closed event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                document.body.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).toHaveBeenCalled();
            }));
        });
    });

    describe('with a search', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectWithSearch])));

        let fixture: ComponentFixture<SelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithSearch);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
        }));

        it('should have search input', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeDefined();
        }));

        it('should search filed should be focused after open', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input).toBe(document.activeElement);
        }));

        it('should search', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'lu';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();
            flush();

            const optionsTexts = fixture.debugElement.queryAll(By.css('mc-option'))
                .map((el) => el.nativeElement.innerText);

            expect(optionsTexts).toEqual(['Kaluga', 'Luga']);
        }));

        it('should clear search by esc', (() => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'lu';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('');
        }));

        it('should close list by esc if input is empty', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            const selectInstance = fixture.componentInstance.select;

            expect(selectInstance.panelOpen).toBe(false);
        });
    });

    describe('with a selectionChange event handler', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectWithChangeEvent])));

        let fixture: ComponentFixture<SelectWithChangeEvent>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithChangeEvent);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
        }));

        it('should emit an event when the selected option has changed', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            (overlayContainerElement.querySelector('mc-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
        }));

        xit('should not emit multiple change events for the same option', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

            option.click();
            option.click();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));

        it('should only emit one event when pressing arrow keys on closed select', fakeAsync(() => {
            const select = fixture.debugElement.query(By.css('mc-select')).nativeElement;
            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));
    });

    describe('with ngModel', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([NgModelSelect])));

        it('should disable itself when control is disabled using the property', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgModelSelect);
            fixture.detectChanges();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            const trigger =
                fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .toEqual('default', `Expected cursor to be default arrow on disabled control.`);

            trigger.click();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected select panel to stay closed.`);
            expect(fixture.componentInstance.select.panelOpen)
                .toBe(false, `Expected select panelOpen property to stay false.`);

            fixture.componentInstance.isDisabled = false;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .toEqual('pointer', `Expected cursor to be a pointer on enabled control.`);

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.textContent)
                .toContain('Steak', `Expected select panel to open normally on re-enabled control`);
            expect(fixture.componentInstance.select.panelOpen)
                .toBe(true, `Expected select panelOpen property to become true.`);
        }));
    });

    describe('with ngIf', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([NgIfSelect])));

        it('should handle nesting in an ngIf', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgIfSelect);
            fixture.detectChanges();

            fixture.componentInstance.isShowing = true;
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            trigger.style.width = '300px';

            trigger.click();
            fixture.detectChanges();
            flush();

            const value = fixture.debugElement.query(By.css('.mc-select__matcher'));
            expect(value.nativeElement.textContent)
                .toContain('Pizza', `Expected trigger to be populated by the control's initial value.`);

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toEqual('300px');

            expect(fixture.componentInstance.select.panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('Steak');
            expect(overlayContainerElement.textContent).toContain('Pizza');
            expect(overlayContainerElement.textContent).toContain('Tacos');
        }));
    });

    describe('with multiple mc-select elements in one view', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([ManySelects])));

        let fixture: ComponentFixture<ManySelects>;
        let triggers: DebugElement[];
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ManySelects);
            fixture.detectChanges();
            triggers = fixture.debugElement.queryAll(By.css('.mc-select__trigger'));

            triggers[0].nativeElement.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('mc-option');
        }));

        it('should set the option id properly', fakeAsync(() => {
            const firstOptionID = options[0].id;

            expect(options[0].id)
                .toContain('mc-option', `Expected option ID to have the correct prefix.`);
            expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);

            document.body.click();
            fixture.detectChanges();
            flush();

            triggers[1].nativeElement.click();
            fixture.detectChanges();
            flush();

            options =
                overlayContainerElement.querySelectorAll('mc-option');
            expect(options[0].id)
                .toContain('mc-option', `Expected option ID to have the correct prefix.`);
            expect(options[0].id).not.toEqual(firstOptionID, `Expected option IDs to be unique.`);
            expect(options[0].id).not.toEqual(options[1].id, `Expected option IDs to be unique.`);
        }));
    });

    describe('with a sibling component that throws an error', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            SelectWithErrorSibling,
            ThrowsErrorOnInit
        ])));

        it('should not crash the browser when a sibling throws an error on init', fakeAsync(() => {
            // Note that this test can be considered successful if the error being thrown didn't
            // end up crashing the testing setup altogether.
            expect(() => {
                TestBed.createComponent(SelectWithErrorSibling).detectChanges();
            }).toThrowError(new RegExp('Oh no!', 'g'));
        }));
    });

    describe('change events', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectWithPlainTabindex])));

        it('should complete the stateChanges stream on destroy', () => {
            const fixture = TestBed.createComponent(SelectWithPlainTabindex);
            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(McSelect));
            const select = debugElement.componentInstance;

            const spy = jasmine.createSpy('stateChanges complete');
            const subscription = select.stateChanges.subscribe(undefined, undefined, spy);

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });
    });

    describe('when initially hidden', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([BasicSelectInitiallyHidden])));

        it('should set the width of the overlay if the element was hidden initially', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectInitiallyHidden);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            trigger.style.width = '200px';
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toBe('200px');
        }));
    });

    describe('with no placeholder', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([BasicSelectNoPlaceholder])));

        it('should set the width of the overlay if there is no placeholder', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectNoPlaceholder);

            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(parseInt(pane.style.minWidth as string)).toBeGreaterThan(0);
        }));
    });

    describe('with theming', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([BasicSelectWithTheming])));

        let fixture: ComponentFixture<BasicSelectWithTheming>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithTheming);
            fixture.detectChanges();
        }));

        it('should transfer the theme to the select panel', fakeAsync(() => {
            fixture.componentInstance.theme = 'error';
            fixture.componentInstance.select.open();
            fixture.detectChanges();
            flush();

            const panel = overlayContainerElement.querySelector('.mc-select__panel') as HTMLElement;
            expect(panel.classList).toContain('mc-error');
        }));
    });

    describe('when invalid inside a form', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([InvalidSelectInForm])));

        it('should not throw SelectionModel errors in addition to ngModel errors', fakeAsync(() => {
            const fixture = TestBed.createComponent(InvalidSelectInForm);

            // The first change detection run will throw the "ngModel is missing a name" error.
            expect(() => fixture.detectChanges()).toThrowError(/the name attribute must be set/g);

            // The second run shouldn't throw selection-model related errors.
            expect(() => fixture.detectChanges()).not.toThrow();
        }));
    });

    describe('with ngModel using compareWith', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([NgModelCompareWithSelect])));

        let fixture: ComponentFixture<NgModelCompareWithSelect>;
        let instance: NgModelCompareWithSelect;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NgModelCompareWithSelect);
            instance = fixture.componentInstance;
            fixture.detectChanges();
        }));

        describe('comparing by value', () => {

            it('should have a selection', fakeAsync(() => {
                const selectedOption = instance.select.selected as McOption;
                expect(selectedOption.value.value).toEqual('pizza-1');
            }));

            it('should update when making a new selection', fakeAsync(() => {
                instance.options.last.selectViaInteraction();
                fixture.detectChanges();
                flush();

                const selectedOption = instance.select.selected as McOption;
                expect(instance.selectedFood.value).toEqual('tacos-2');
                expect(selectedOption.value.value).toEqual('tacos-2');
            }));
        });

        describe('comparing by reference', () => {
            beforeEach(fakeAsync(() => {
                spyOn(instance, 'compareByReference').and.callThrough();
                instance.useCompareByReference();
                fixture.detectChanges();
                flush();
            }));

            it('should use the comparator', fakeAsync(() => {
                expect(instance.compareByReference).toHaveBeenCalled();
            }));

            it('should initialize with no selection despite having a value', fakeAsync(() => {
                expect(instance.selectedFood.value).toBe('pizza-1');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should not update the selection if value is copied on change', fakeAsync(() => {
                instance.options.first.selectViaInteraction();
                fixture.detectChanges();
                flush();

                expect(instance.selectedFood.value).toEqual('steak-0');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should throw an error when using a non-function comparator', fakeAsync(() => {
                instance.useNullComparator();

                expect(() => {
                    fixture.detectChanges();
                }).toThrowError(wrappedErrorMessage(getMcSelectNonFunctionValueError()));
            }));
        });
    });

    describe(`when the select's value is accessed on initialization`, () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectEarlyAccessSibling])));

        it('should not throw when trying to access the selected value on init', fakeAsync(() => {
            expect(() => {
                TestBed.createComponent(SelectEarlyAccessSibling).detectChanges();
            }).not.toThrow();
        }));
    });

    describe('inside of a form group', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectInsideFormGroup])));

        let fixture: ComponentFixture<SelectInsideFormGroup>;
        let testComponent: SelectInsideFormGroup;
        let select: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectInsideFormGroup);
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            select = fixture.debugElement.query(By.css('mc-select')).nativeElement;
        }));

        it('should not set the invalid class on a clean select', fakeAsync(() => {
            expect(testComponent.formGroup.untouched).toBe(true, 'Expected the form to be untouched.');
            expect(testComponent.formControl.invalid).toBe(false, 'Expected form control to be invalid.');
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');
        }));

        it('should not appear as invalid if it becomes touched', fakeAsync(() => {
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');

            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select to appear invalid.');
        }));

        it('should not have the invalid class when the select becomes valid', fakeAsync(() => {
            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select to appear invalid.');

            testComponent.formControl.setValue('pizza-1');
            fixture.detectChanges();
            flush();

            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');
        }));

        it('should appear as invalid when the parent form group is submitted', fakeAsync(() => {
            expect(select.classList)
                .not.toContain('mc-invalid', 'Expected select not to appear invalid.');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(select.classList)
                .toContain('mc-invalid', 'Expected select to appear invalid.');
        }));

        xit('should render the error messages when the parent form is submitted', fakeAsync(() => {
            const debugEl = fixture.debugElement.nativeElement;

            expect(debugEl.querySelectorAll('mc-error').length).toBe(0, 'Expected no error messages');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(debugEl.querySelectorAll('mc-error').length).toBe(1, 'Expected one error message');
        }));

        it('should override error matching behavior via injection token', fakeAsync(() => {
            const errorStateMatcher: ErrorStateMatcher = {
                isErrorState: jasmine.createSpy('error state matcher').and.returnValue(true)
            };

            fixture.destroy();

            TestBed.resetTestingModule().configureTestingModule({
                imports: [McSelectModule, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
                declarations: [SelectInsideFormGroup],
                providers: [{ provide: ErrorStateMatcher, useValue: errorStateMatcher }]
            });

            const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
            const component = errorFixture.componentInstance;

            errorFixture.detectChanges();

            expect(component.select.errorState).toBe(true);
            expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
        }));
    });

    describe('with custom error behavior', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([CustomErrorBehaviorSelect])));

        it('should be able to override the error matching behavior via an @Input', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomErrorBehaviorSelect);
            const component = fixture.componentInstance;
            const matcher = jasmine.createSpy('error state matcher').and.returnValue(true);

            fixture.detectChanges();

            expect(component.control.invalid).toBe(false);
            expect(component.select.errorState).toBe(false);

            fixture.componentInstance.errorStateMatcher = { isErrorState: matcher };
            fixture.detectChanges();

            expect(component.select.errorState).toBe(true);
            expect(matcher).toHaveBeenCalled();
        }));
    });

    describe('with preselected array values', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            SingleSelectWithPreselectedArrayValues
        ])));

        xit('should be able to preselect an array value in single-selection mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectWithPreselectedArrayValues);
            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            expect(trigger.textContent).toContain('Pizza');
            expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
        }));
    });

    describe('with custom value accessor', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            CompWithCustomSelect,
            CustomSelectAccessor
        ])));

        it('should support use inside a custom value accessor', fakeAsync(() => {
            const fixture = TestBed.createComponent(CompWithCustomSelect);
            spyOn(fixture.componentInstance.customAccessor, 'writeValue');
            fixture.detectChanges();

            expect(fixture.componentInstance.customAccessor.select.ngControl)
                .toBeFalsy('Expected mc-select NOT to inherit control from parent value accessor.');
            expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
        }));
    });

    describe('with a falsy value', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([FalsyValueSelect])));

        it('should be able to programmatically select a falsy option', fakeAsync(() => {
            const fixture = TestBed.createComponent(FalsyValueSelect);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement.click();
            fixture.componentInstance.control.setValue(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.options.first.selected)
                .toBe(true, 'Expected first option to be selected');
            expect(overlayContainerElement.querySelectorAll('mc-option')[0].classList)
                .toContain('mc-selected', 'Expected first option to be selected');
        }));
    });

    describe('with OnPush', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            BasicSelectOnPush,
            BasicSelectOnPushPreselected
        ])));

        xit('should set the trigger text based on the value when initialized', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPushPreselected);

            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            fixture.detectChanges();

            expect(trigger.textContent).toContain('Pizza');
        }));

        xit('should update the trigger based on the value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPush);
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            fixture.componentInstance.control.setValue('pizza-1');
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Pizza');

            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(trigger.textContent).not.toContain('Pizza');
        }));
    });

    describe('with custom trigger', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([SelectWithCustomTrigger])));

        xit('should allow the user to customize the label', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomTrigger);
            fixture.detectChanges();

            fixture.componentInstance.control.setValue('pizza-1');
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.mc-select__matcher')).nativeElement;

            expect(label.textContent).toContain('azziP',
                'Expected the displayed text to be "Pizza" in reverse.');
        }));
    });

    describe('when reseting the value by setting null or undefined', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([ResetValuesSelect])));

        let fixture: ComponentFixture<ResetValuesSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ResetValuesSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('.mc-form-field')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('mc-option');
            options[0].click();
            fixture.detectChanges();
            flush();
        }));

        it('should reset when an option with an undefined value is selected', fakeAsync(() => {
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('Undefined');
        }));

        it('should reset when an option with a null value is selected', fakeAsync(() => {
            options[5].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeNull();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('Null');
        }));

        it('should reset when a blank option is selected', fakeAsync(() => {
            options[6].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('mc-form-field-should-float');
            expect(trigger.textContent).not.toContain('None');
        }));

        it('should not mark the reset option as selected ', fakeAsync(() => {
            options[5].click();
            fixture.detectChanges();
            flush();

            fixture.componentInstance.select.open();
            fixture.detectChanges();
            flush();

            expect(options[5].classList).not.toContain('mc-selected');
        }));

        it('should not reset when any other falsy option is selected', fakeAsync(() => {
            options[3].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBe(false);
            expect(fixture.componentInstance.select.selected).toBeTruthy();
            expect(trigger.textContent).toContain('Falsy');
        }));

        xit('should not consider the reset values as selected when resetting the form control',
            fakeAsync(() => {
                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                expect(fixture.componentInstance.control.value).toBeNull();
                expect(fixture.componentInstance.select.selected).toBeFalsy();
                expect(trigger.textContent).not.toContain('Null');
                expect(trigger.textContent).not.toContain('Undefined');
        }));
    });

    describe('without Angular forms', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            BasicSelectWithoutForms,
            BasicSelectWithoutFormsPreselected,
            BasicSelectWithoutFormsMultiple
        ])));

        it('should set the value when options are clicked', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('steak-0');
            expect(fixture.componentInstance.select.value).toBe('steak-0');
            expect(trigger.textContent).toContain('Steak');

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelectorAll('mc-option')[2] as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('sandwich-2');
            expect(fixture.componentInstance.select.value).toBe('sandwich-2');
            expect(trigger.textContent).toContain('Sandwich');
        }));

        xit('should mark options as selected when the value is set', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.componentInstance.selectedFood = 'sandwich-2';
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            expect(trigger.textContent).toContain('Sandwich');

            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('mc-option')[2];

            expect(option.classList).toContain('mc-selected');
            expect(fixture.componentInstance.select.value).toBe('sandwich-2');
        }));

        xit('should reset the label when a null value is set', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('steak-0');
            expect(fixture.componentInstance.select.value).toBe('steak-0');
            expect(trigger.textContent).toContain('Steak');

            fixture.componentInstance.selectedFood = null;
            fixture.detectChanges();

            expect(fixture.componentInstance.select.value).toBeNull();
            expect(trigger.textContent).not.toContain('Steak');
        }));

        xit('should reflect the preselected value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            fixture.detectChanges();
            expect(trigger.textContent).toContain('Pizza');

            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('mc-option')[1];

            expect(option.classList).toContain('mc-selected');
            expect(fixture.componentInstance.select.value).toBe('pizza-1');
        }));

        xit('should be able to select multiple values', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutFormsMultiple);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFoods).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0']);
            expect(trigger.textContent).toContain('Steak');

            options[2].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'sandwich-2']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'sandwich-2']);
            expect(trigger.textContent).toContain('Steak, Sandwich');

            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
            expect(trigger.textContent).toContain('Steak, Pizza, Sandwich');
        }));

        it('should restore focus to the host element', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            const select = fixture.debugElement.nativeElement.querySelector('mc-select');

            expect(document.activeElement).toBe(select, 'Expected trigger to be focused.');
        }));

        it('should not restore focus to the host element when clicking outside', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const select = fixture.debugElement.nativeElement.querySelector('mc-select');

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement?.classList).toContain('mc-option', 'Expected option to be focused.');

            select.blur(); // Blur manually since the programmatic click might not do it.
            document.body.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement).not.toBe(select, 'Expected trigger not to be focused.');
        }));

        it('should update the data binding before emitting the change event', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const instance = fixture.componentInstance;
            const spy = jasmine.createSpy('change spy');

            fixture.detectChanges();
            instance.select.selectionChange.subscribe(() => spy(instance.selectedFood));

            expect(instance.selectedFood).toBeFalsy();

            fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('mc-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(instance.selectedFood).toBe('steak-0');
            expect(spy).toHaveBeenCalledWith('steak-0');
        }));

    });

    describe('with option centering disabled', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            SelectWithoutOptionCentering
        ])));

        let fixture: ComponentFixture<SelectWithoutOptionCentering>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithoutOptionCentering);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
        }));

        it('should not align the active option with the trigger if centering is disabled',
            fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                // The panel should be scrolled to 0 because centering the option disabled.
                expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);
                // The trigger should contain 'Pizza' because it was preselected
                expect(trigger.textContent).toContain('Pizza');
                // The selected index should be 1 because it was preselected
                expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
            }));
    });

    describe('positioning', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([
            BasicSelect,
            MultiSelect,
            SelectWithGroups
        ])));

        let fixture: ComponentFixture<BasicSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('mc-form-field')).nativeElement;
        }));

        /**
         * Asserts that the given option is aligned with the trigger.
         * @param index The index of the option.
         * @param selectInstance Instance of the `mc-select` component to check against.
         */
        function checkTriggerAlignedWithOption(index: number, selectInstance =
            fixture.componentInstance.select): void {

            const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const triggerTop: number = trigger.getBoundingClientRect().top;
            const overlayTop: number = overlayPane.getBoundingClientRect().top;
            const options: NodeListOf<HTMLElement> = overlayPane.querySelectorAll('mc-option');
            const optionTop = options[index].getBoundingClientRect().top;
            const triggerFontSize = parseInt(window.getComputedStyle(trigger)['font-size']);
            const triggerLineHeightEm = 1.125;

            // Extra trigger height beyond the font size caused by the fact that the line-height is
            // greater than 1em.
            const triggerExtraLineSpaceAbove = (1 - triggerLineHeightEm) * triggerFontSize / 2;
            const topDifference = Math.floor(optionTop) -
                Math.floor(triggerTop - triggerFontSize - triggerExtraLineSpaceAbove);

            // Expect the coordinates to be within a pixel of each other. We can't rely on comparing
            // the exact value, because different browsers report the various sizes with slight (< 1px)
            // deviations.
            expect(Math.abs(topDifference) < 2)
                .toBe(true, `Expected trigger to align with option ${index}.`);

            // For the animation to start at the option's center, its origin must be the distance
            // from the top of the overlay to the option top + half the option height (48/2 = 24).
            const expectedOrigin = Math.floor(optionTop - overlayTop + 24);
            const rawYOrigin = selectInstance.transformOrigin.split(' ')[1].trim();
            const origin = Math.floor(parseInt(rawYOrigin));

            // Because the origin depends on the Y axis offset, we also have to
            // round down and check that the difference is within a pixel.
            expect(Math.abs(expectedOrigin - origin) < 2).toBe(true,
                `Expected panel animation to originate in the center of option ${index}.`);
        }

        describe('ample space to open', () => {
            beforeEach(fakeAsync(() => {
                // these styles are necessary because we are first testing the overlay's position
                // if there is room for it to open to its full extent in either direction.
                formField.style.position = 'fixed';
                formField.style.top = '285px';
                formField.style.left = '20px';
            }));

            xit('should align the first option with trigger text if no option is selected',
                fakeAsync(() => {
                    // We shouldn't push it too far down for this one, because the default may
                    // end up being too much when running the tests on mobile browsers.
                    formField.style.top = '100px';
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                    // The panel should be scrolled to 0 because centering the option is not possible.
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);
                    checkTriggerAlignedWithOption(0);
                }));

            xit('should align a selected option too high to be centered with the trigger text',
                fakeAsync(() => {
                    // Select the second option, because it can't be scrolled any further downward
                    fixture.componentInstance.control.setValue('pizza-1');
                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                    // The panel should be scrolled to 0 because centering the option is not possible.
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);
                    checkTriggerAlignedWithOption(1);
                }));

            xit('should align a selected option in the middle with the trigger text', fakeAsync(() => {
                // Select the fifth option, which has enough space to scroll to the center
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half
                // the option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
                // 192 - 256/2 + 48/2 = 88px
                expect(scrollContainer.scrollTop)
                    .toEqual(88, `Expected overlay panel to be scrolled to center the selected option.`);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should align a selected option at the scroll max with the trigger text', fakeAsync(() => {
                // Select the last option in the list
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                // The selected option should be scrolled to the max scroll position.
                // This will be the height of the scrollContainer - the panel height.
                // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
                expect(scrollContainer.scrollTop)
                    .toEqual(128, `Expected overlay panel to be scrolled to its maximum position.`);

                checkTriggerAlignedWithOption(7);
            }));

            xit('should account for preceding label groups when aligning the option', fakeAsync(() => {
                // Test is off-by-one on edge for some reason, but verified that it looks correct through
                // manual testing.
                if (platform.EDGE) { return; }

                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                trigger = groupFixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
                formField = groupFixture.debugElement.query(By.css('mc-form-field')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.top = '200px';
                formField.style.left = '100px';

                // Select an option in the third group, which has a couple of group labels before it.
                groupFixture.componentInstance.control.setValue('vulpix-7');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__content')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half the
                // option height. 10 (option index + 3 group labels before it) * 48 (option height) = 480
                // 480 (offset from scrollTop) - 256/2 + 48/2 = 376px
                expect(Math.floor(scrollContainer.scrollTop))
                    .toBe(376, `Expected overlay panel to be scrolled to center the selected option.`);

                checkTriggerAlignedWithOption(7, groupFixture.componentInstance.select);
            }));
        });

        describe('limited space to open vertically', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '20px';
            }));

            xit('should adjust position of centered option if there is little space above',
                fakeAsync(() => {
                    const selectMenuHeight = 256;
                    const selectMenuViewportPadding = 8;
                    const selectItemHeight = 48;
                    const selectedIndex = 4;
                    const fontSize = 16;
                    const lineHeightEm = 1.125;
                    const expectedExtraScroll = 5;

                    // Trigger element height.
                    const triggerHeight = fontSize * lineHeightEm;

                    // Ideal space above selected item in order to center it.
                    const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                    // Actual space above selected item.
                    const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                    // Ideal scroll position to center.
                    const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                    // Top-most select-position that allows for perfect centering.
                    const topMostPositionForPerfectCentering =
                        idealSpaceAboveSelectedItem + selectMenuViewportPadding +
                        (selectItemHeight - triggerHeight) / 2;

                    // Position of select relative to top edge of mc-form-field.
                    const formFieldTopSpace =
                        trigger.getBoundingClientRect().top - formField.getBoundingClientRect().top;

                    const formFieldTop =
                        topMostPositionForPerfectCentering - formFieldTopSpace - expectedExtraScroll;

                    formField.style.top = `${formFieldTop}px`;

                    // Select an option in the middle of the list
                    fixture.componentInstance.control.setValue('chips-4');
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                    expect(Math.ceil(scrollContainer.scrollTop))
                        .toEqual(Math.ceil(idealScrollTop + 5),
                            `Expected panel to adjust scroll position to fit in viewport.`);

                    checkTriggerAlignedWithOption(4);
                }));

            xit('should adjust position of centered option if there is little space below',
                fakeAsync(() => {
                    const selectMenuHeight = 256;
                    const selectMenuViewportPadding = 8;
                    const selectItemHeight = 48;
                    const selectedIndex = 4;
                    const fontSize = 16;
                    const lineHeightEm = 1.125;
                    const expectedExtraScroll = 5;

                    // Trigger element height.
                    const triggerHeight = fontSize * lineHeightEm;

                    // Ideal space above selected item in order to center it.
                    const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                    // Actual space above selected item.
                    const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                    // Ideal scroll position to center.
                    const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                    // Bottom-most select-position that allows for perfect centering.
                    const bottomMostPositionForPerfectCentering =
                        idealSpaceAboveSelectedItem + selectMenuViewportPadding +
                        (selectItemHeight - triggerHeight) / 2;

                    // Position of select relative to bottom edge of mc-form-field:
                    const formFieldBottomSpace =
                        formField.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom;

                    const formFieldBottom =
                        bottomMostPositionForPerfectCentering - formFieldBottomSpace - expectedExtraScroll;

                    // Push the select to a position with not quite enough space on the bottom to open
                    // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
                    formField.style.bottom = `${formFieldBottom}px`;

                    // Select an option in the middle of the list
                    fixture.componentInstance.control.setValue('chips-4');
                    fixture.detectChanges();
                    flush();

                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-select__panel')!;

                    // Scroll should adjust by the difference between the bottom space available
                    // (56px from the bottom of the screen - 8px padding = 48px)
                    // and the height of the panel below the option (113px).
                    // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
                    const difference = Math.ceil(scrollContainer.scrollTop) -
                        Math.ceil(idealScrollTop - expectedExtraScroll);

                    // Note that different browser/OS combinations report the different dimensions with
                    // slight deviations (< 1px). We round the expectation and check that the values
                    // are within a pixel of each other to avoid flakes.
                    expect(Math.abs(difference) < 2)
                        .toBe(true, `Expected panel to adjust scroll position to fit in viewport.`);

                    checkTriggerAlignedWithOption(4);
                }));

            xit('should fall back to "above" positioning if scroll adjustment will not help',
                fakeAsync(() => {
                    // Push the select to a position with not enough space on the bottom to open
                    formField.style.bottom = '56px';
                    fixture.detectChanges();

                    // Select an option that cannot be scrolled any farther upward
                    fixture.componentInstance.control.setValue('coke-0');
                    fixture.detectChanges();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                    const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                    const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                    const scrollContainer = overlayPane.querySelector('.mc-select__panel')!;

                    // Expect no scroll to be attempted
                    expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to be scrolled.`);

                    const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                    // Check that the values are within a pixel of each other. This avoids sub-pixel
                    // deviations between OS and browser versions.
                    expect(Math.abs(difference) < 2)
                        .toEqual(true, `Expected trigger bottom to align with overlay bottom.`);

                    expect(fixture.componentInstance.select.transformOrigin)
                        .toContain(`bottom`, `Expected panel animation to originate at the bottom.`);
                }));

            xit('should fall back to "below" positioning if scroll adjustment won\'t help',
                fakeAsync(() => {
                    // Push the select to a position with not enough space on the top to open
                    formField.style.top = '85px';

                    // Select an option that cannot be scrolled any farther downward
                    fixture.componentInstance.control.setValue('sushi-7');
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                    const triggerTop: number = trigger.getBoundingClientRect().top;
                    const overlayTop: number = overlayPane.getBoundingClientRect().top;
                    const scrollContainer = overlayPane.querySelector('.mc-select__panel')!;

                    // Expect scroll to remain at the max scroll position
                    expect(scrollContainer.scrollTop)
                        .toEqual(128, `Expected panel to be at max scroll.`);

                    expect(Math.floor(overlayTop))
                        .toEqual(Math.floor(triggerTop), `Expected trigger top to align with overlay top.`);

                    expect(fixture.componentInstance.select.transformOrigin)
                        .toContain(`top`, `Expected panel animation to originate at the top.`);
                }));
        });

        /*describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));

            // TODO Expected pixels
            xit('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.mc-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in ltr.`);
            }));

            it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.mc-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in rtl.`);
            }));

            it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.mc-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in ltr.`);
            }));

            xit('should stay within the viewport when overflowing on the right in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.mc-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in rtl.`);
            }));

            // TODO Expected pixels
            xit('should keep the position within the viewport on repeat openings', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                let panelLeft = document.querySelector('.mc-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThanOrEqual(0, `Expected select panel to be inside the viewport.`);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                panelLeft = document.querySelector('.mc-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThanOrEqual(0,
                    `Expected select panel continue being inside the viewport.`);
            }));
        });*/

        describe('when scrolled', () => {
            const startingWindowHeight = window.innerHeight;

            // Need to set the scrollTop two different ways to support
            // both Chrome and Firefox.
            function setScrollTop(num: number) {
                document.body.scrollTop = num;
                document.documentElement.scrollTop = num;
            }

            beforeEach(fakeAsync(() => {
                // Make the div above the select very tall, so the page will scroll
                fixture.componentInstance.heightAbove = 2000;
                fixture.detectChanges();
                setScrollTop(0);

                // Give the select enough horizontal space to open
                formField.style.marginLeft = '20px';
                formField.style.marginRight = '20px';
            }));

            xit('should fall back to "above" positioning properly when scrolled', fakeAsync(() => {
                // Give the select insufficient space to open below the trigger
                fixture.componentInstance.heightAbove = 0;
                fixture.componentInstance.heightBelow = 100;
                trigger.style.marginTop = '2000px';
                fixture.detectChanges();

                // Scroll the select into view
                setScrollTop(1400);

                // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
                // body causes karma's iframe for the test to stretch to fit that content once we attempt to
                // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
                // successfully constrain its size. As such, skip assertions in environments where the
                // window size has changed since the start of the test.
                if (window.innerHeight > startingWindowHeight) {
                    return;
                }

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
                const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                // Check that the values are within a pixel of each other. This avoids sub-pixel
                // deviations between OS and browser versions.
                expect(Math.abs(difference) < 2)
                    .toEqual(true, `Expected trigger bottom to align with overlay bottom.`);
            }));

            xit('should fall back to "below" positioning properly when scrolled', fakeAsync(() => {
                // Give plenty of space for the select to open below the trigger
                fixture.componentInstance.heightBelow = 650;
                fixture.detectChanges();

                // Select an option too low in the list to fit in limited space above
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();

                // Scroll the select so that it has insufficient space to open above the trigger
                setScrollTop(1950);

                // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
                // body causes karma's iframe for the test to stretch to fit that content once we attempt to
                // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
                // successfully constrain its size. As such, skip assertions in environments where the
                // window size has changed since the start of the test.
                if (window.innerHeight > startingWindowHeight) { return; }

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
                const triggerTop: number = trigger.getBoundingClientRect().top;
                const overlayTop: number = overlayPane.getBoundingClientRect().top;

                expect(Math.floor(overlayTop))
                    .toEqual(Math.floor(triggerTop), `Expected trigger top to align with overlay top.`);
            }));
        });

        describe('x-axis positioning', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '30px';
            }));

            xit('should align the trigger and the selected option on the x-axis in ltr', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const triggerLeft: number = trigger.getBoundingClientRect().left;
                const firstOptionLeft = document.querySelector('.cdk-overlay-pane mc-option')!
                    .getBoundingClientRect().left;

                // Each option is 32px wider than the trigger, so it must be adjusted 16px
                // to ensure the text overlaps correctly.
                expect(Math.floor(firstOptionLeft)).toEqual(Math.floor(triggerLeft - 16),
                    `Expected trigger to align with the selected option on the x-axis in LTR.`);
            }));

            xit('should align the trigger and the selected option on the x-axis in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const triggerRight: number = trigger.getBoundingClientRect().right;
                const firstOptionRight = document.querySelector('.cdk-overlay-pane mc-option')!
                    .getBoundingClientRect().right;

                // Each option is 32px wider than the trigger, so it must be adjusted 16px
                // to ensure the text overlaps correctly.
                expect(Math.floor(firstOptionRight))
                    .toEqual(Math.floor(triggerRight + 16),
                        `Expected trigger to align with the selected option on the x-axis in RTL.`);
            }));
        });

        describe('x-axis positioning in multi select mode', () => {
            let multiFixture: ComponentFixture<MultiSelect>;

            beforeEach(fakeAsync(() => {
                multiFixture = TestBed.createComponent(MultiSelect);
                multiFixture.detectChanges();
                formField = multiFixture.debugElement.query(By.css('.mc-form-field')).nativeElement;
                trigger = multiFixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.left = '60px';
            }));

            xit('should adjust for the checkbox in ltr', fakeAsync(() => {
                trigger.click();
                multiFixture.detectChanges();
                flush();

                const triggerLeft: number = trigger.getBoundingClientRect().left;
                const firstOptionLeft = document.querySelector('.cdk-overlay-pane mc-option')!
                    .getBoundingClientRect().left;

                // 44px accounts for the checkbox size, margin and the panel's padding.
                expect(Math.floor(firstOptionLeft))
                    .toEqual(Math.floor(triggerLeft - 44),
                        `Expected trigger label to align along x-axis, accounting for the checkbox.`);
            }));

            xit('should adjust for the checkbox in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                trigger.click();
                multiFixture.detectChanges();
                flush();

                const triggerRight: number = trigger.getBoundingClientRect().right;
                const firstOptionRight = document.querySelector('.cdk-overlay-pane mc-option')!
                    .getBoundingClientRect().right;

                // 44px accounts for the checkbox size, margin and the panel's padding.
                expect(Math.floor(firstOptionRight))
                    .toEqual(Math.floor(triggerRight + 44),
                        `Expected trigger label to align along x-axis, accounting for the checkbox.`);
            }));
        });

        describe('x-axis positioning with groups', () => {
            let groupFixture: ComponentFixture<SelectWithGroups>;

            beforeEach(fakeAsync(() => {
                groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                formField = groupFixture.debugElement.query(By.css('.mc-form-field')).nativeElement;
                trigger = groupFixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.left = '60px';
            }));

            xit('should adjust for the group padding in ltr', fakeAsync(() => {
                groupFixture.componentInstance.control.setValue('oddish-1');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();

                groupFixture.whenStable().then(() => {
                    const group = document.querySelector('.cdk-overlay-pane mc-optgroup')!;
                    const triggerLeft: number = trigger.getBoundingClientRect().left;
                    const selectedOptionLeft = group.querySelector('mc-option.mc-selected')!
                        .getBoundingClientRect().left;

                    // 32px is the 16px default padding plus 16px of padding when an option is in a group.
                    expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 32),
                        `Expected trigger label to align along x-axis, accounting for the padding in ltr.`);
                });
            }));

            xit('should adjust for the group padding in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                groupFixture.componentInstance.control.setValue('oddish-1');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const group = document.querySelector('.cdk-overlay-pane mc-optgroup')!;
                const triggerRight = trigger.getBoundingClientRect().right;
                const selectedOptionRight = group.querySelector('mc-option.mc-selected')!.getBoundingClientRect().right;

                // 32px is the 16px default padding plus 16px of padding when an option is in a group.
                expect(Math.floor(selectedOptionRight)).toEqual(Math.floor(triggerRight + 32),
                    `Expected trigger label to align along x-axis, accounting for the padding in rtl.`);
            }));

            xit('should not adjust if all options are within a group, except the selected one',
                fakeAsync(() => {
                    groupFixture.componentInstance.control.setValue('mime-11');
                    groupFixture.detectChanges();

                    trigger.click();
                    groupFixture.detectChanges();
                    flush();

                    const selected = document.querySelector('.cdk-overlay-pane mc-option.mc-selected')!;
                    const selectedOptionLeft = selected.getBoundingClientRect().left;
                    const triggerLeft = trigger.getBoundingClientRect().left;

                    // 16px is the default option padding
                    expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 16));
                }));

            xit('should align the first option to the trigger, if nothing is selected', fakeAsync(() => {
                // Push down the form field so there is space for the item to completely align.
                formField.style.top = '100px';

                const menuItemHeight = 48;
                const triggerFontSize = 16;
                const triggerLineHeightEm = 1.125;
                const triggerHeight = triggerFontSize * triggerLineHeightEm;

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const triggerTop = trigger.getBoundingClientRect().top;

                const option = overlayContainerElement.querySelector('.cdk-overlay-pane mc-option');
                const optionTop: number = option ? option.getBoundingClientRect().top : 0;

                // There appears to be a small rounding error on IE, so we verify that the value is close,
                // not exact.
                if (platform.TRIDENT) {
                    const difference = Math.abs(optionTop + (menuItemHeight - triggerHeight) / 2 - triggerTop);
                    expect(difference)
                        .toBeLessThan(0.1, 'Expected trigger to align with the first option.');
                } else {
                    expect(Math.floor(optionTop + (menuItemHeight - triggerHeight) / 2))
                        .toBe(Math.floor(triggerTop), 'Expected trigger to align with the first option.');
                }
            }));
        });
    });

    describe('with multiple selection', () => {
        beforeEach(waitForAsync(() => configureMcSelectTestingModule([MultiSelect])));

        let fixture: ComponentFixture<MultiSelect>;
        let testInstance: MultiSelect;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiSelect);
            testInstance = fixture.componentInstance;
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
        }));

        it('should be able to select multiple values', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            options[2].click();
            options[5].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual(['steak-0', 'tacos-2', 'eggs-5']);
        }));

        it('should be able to toggle an option on and off', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

            option.click();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);

            option.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual([]);
        }));

        it('should update the label', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            options[2].click();
            options[5].click();
            fixture.detectChanges();

            expect(Array.from(trigger.querySelectorAll('mc-tag'), (item) => item.textContent!.trim()))
                .toEqual(['Steak', 'Tacos', 'Eggs']);

            options[2].click();
            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('mc-tag'), (item) => item.textContent!.trim()))
                .toEqual(['Steak', 'Eggs']);
        }));

        it('should be able to set the selected value by taking an array', fakeAsync(() => {
            trigger.click();
            testInstance.control.setValue(['steak-0', 'eggs-5']);
            fixture.detectChanges();
            flush();

            const optionNodes = overlayContainerElement.querySelectorAll('mc-option');

            const optionInstances = testInstance.options.toArray();

            expect(optionNodes[0].classList).toContain('mc-selected');
            expect(optionNodes[5].classList).toContain('mc-selected');

            expect(optionInstances[0].selected).toBe(true);
            expect(optionInstances[5].selected).toBe(true);
        }));

        it('should override the previously-selected value when setting an array', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            fixture.detectChanges();

            expect(options[0].classList).toContain('mc-selected');

            testInstance.control.setValue(['eggs-5']);
            fixture.detectChanges();
            flush();

            expect(options[0].classList).not.toContain('mc-selected');
            expect(options[5].classList).toContain('mc-selected');
        }));

        it('should not close the panel when clicking on options', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            expect(testInstance.select.panelOpen).toBe(true);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            options[1].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);
        }));

        xit('should sort the selected options based on their order in the panel', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.querySelector('.mc-select__match-list')!.textContent).toContain('Steak, Pizza, Tacos');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should sort the selected options in reverse in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should be able to customize the value sorting logic', fakeAsync(() => {
            fixture.componentInstance.sortComparator = (a, b, optionsArray) => {
                return optionsArray.indexOf(b) - optionsArray.indexOf(a);
            };
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            for (let i = 0; i < 3; i++) {
                options[i].click();
            }
            fixture.detectChanges();

            // Expect the items to be in reverse order.
            expect(trigger.querySelector('.mc-select__match-list')!.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['tacos-2', 'pizza-1', 'steak-0']);
        }));

        xit('should sort the values that get set via the model based on the panel order',
            fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
                fixture.detectChanges();
                flush();

                // expect(trigger.querySelector('.mc-select__match-list')!.textContent.trim())
                //     .toContain('Steak, Pizza, Tacos');
                expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
            }));

        xit('should reverse sort the values, that get set via the model in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
        }));

        it('should throw an exception when trying to set a non-array value', fakeAsync(() => {
            expect(() => {
                testInstance.control.setValue('not-an-array');
            }).toThrowError(wrappedErrorMessage(getMcSelectNonArrayValueError()));
        }));

        it('should throw an exception when trying to change multiple mode after init', fakeAsync(() => {
            expect(() => {
                testInstance.select.multiple = false;
            }).toThrowError(wrappedErrorMessage(getMcSelectDynamicMultipleError()));
        }));

        it('should pass the `multiple` value to all of the option instances', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.options.toArray().every((option: any) => option.multiple))
                .toBe(true,
                'Expected `multiple` to have been added to initial set of options.');

            testInstance.foods.push({ value: 'cake-8', viewValue: 'Cake' });
            fixture.detectChanges();

            expect(testInstance.options.toArray().every((option) => !!option.multiple)).toBe(true,
                'Expected `multiple` to have been set on dynamically-added option.');
        }));

        it('should update the active item index on click', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(0);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[2].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(2);
        }));

        it('should be to select an option with a `null` value', fakeAsync(() => {
            fixture.componentInstance.foods = [
                { value: null, viewValue: 'Steak' },
                { value: 'pizza-1', viewValue: 'Pizza' },
                { value: null, viewValue: 'Tacos' }
            ];

            fixture.detectChanges();
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].click();
            options[1].click();
            options[2].click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual([null, 'pizza-1', null]);
        }));

        it('should select all options when pressing ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-select');
            const options = fixture.componentInstance.options.toArray();

            expect(testInstance.control.value).toBeFalsy();
            expect(options.every((option) => option.selected)).toBe(false);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should skip disabled options when using ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-select');
            const options = fixture.componentInstance.options.toArray();

            for (let i = 0; i < 3; i++) {
                options[i].disabled = true;
            }

            expect(testInstance.control.value).toBeFalsy();

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should select all options when pressing ctrl + a when some options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-select');
            const options = fixture.componentInstance.options.toArray();

            options[0].select();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);
            expect(options.some((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should deselect all options with ctrl + a if all options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('mc-select');
            const options = fixture.componentInstance.options.toArray();

            options.forEach((option) => option.select());
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
            expect(options.every((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.some((option) => option.selected)).toBe(false);
            expect(testInstance.control.value).toEqual([]);
        });
    });

    describe('option tooltip', () => {
        beforeEach(waitForAsync(() => {
            configureMcSelectTestingModule([SelectWithLongOptionText]);
        }));

        let fixture: ComponentFixture<SelectWithLongOptionText>;
        let testInstance: SelectWithLongOptionText;
        let trigger: HTMLElement;

        class MockedResizeObserver implements ResizeObserver {
            elements: any[] = [];

            observe(target: Element) { this.elements.push(target); }
            unobserve(target: Element) {
                const idx = this.elements.indexOf(target);
                if (idx > -1) {
                    this.elements.splice(idx, 1)
                }
            }

            disconnect() {
                window.removeEventListener('resize', this.onWindowResize);
            }

            private onWindowResize() {
                this.callback(this.elements, this);
            }

            constructor(private callback: ResizeObserverCallback) {
                window.addEventListener('resize', this.onWindowResize.bind(this));
            }
        }

        window.ResizeObserver = MockedResizeObserver;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithLongOptionText);
            testInstance = fixture.componentInstance;
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.mc-select__trigger')).nativeElement;
        }));

        it('should not display tooltip if ellipse not applied', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            options[0].style.width = '200px';

            dispatchMouseEvent(options[0], 'mouseenter');
            tick();
            fixture.detectChanges();

            const tooltips = document.querySelectorAll('.mc-tooltip__content')
            expect(tooltips.length).toEqual(0);

            flush();
        }));

        it('should display tooltip if ellipse applied', fakeAsync(() => {
            trigger.click();
            tick();
            fixture.detectChanges();

            window.dispatchEvent(new Event('resize'));
            tick();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            dispatchMouseEvent(options[1], 'mouseenter');
            tick();
            fixture.detectChanges();

            const tooltips = document.querySelectorAll('.mc-tooltip__content')
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[1].textContent);

            flush();
        }));

        xit('should change tooltip if option content changed', fakeAsync(() => {
            trigger.click();
            tick();
            fixture.detectChanges();

            window.dispatchEvent(new Event('resize'));
            tick();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            dispatchMouseEvent(options[2], 'mouseenter');
            tick();
            fixture.detectChanges();


            let tooltips = document.querySelectorAll('.mc-tooltip__content')
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[2].textContent);

            testInstance.changeLabel();
            fixture.detectChanges();

            tick(500);

            tooltips = document.querySelectorAll('.mc-tooltip__content')
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[2].textContent);

            flush();
        }));
    });
});
