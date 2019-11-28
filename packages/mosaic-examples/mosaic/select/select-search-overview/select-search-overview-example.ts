import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


export const OPTIONS = [
    'Abakan', 'Almetyevsk', 'Anadyr', 'Anapa', 'Arkhangelsk', 'Astrakhan', 'Barnaul', 'Belgorod', 'Beslan', 'Biysk',
    'Birobidzhan', 'Blagoveshchensk', 'Bologoye', 'Bryansk', 'Veliky Novgorod', 'Veliky Ustyug', 'Vladivostok',
    'Vladikavkaz', 'Vladimir', 'Volgograd', 'Vologda', 'Vorkuta', 'Voronezh', 'Gatchina', 'Gdov', 'Gelendzhik',
    'Gorno-Altaysk', 'Grozny', 'Gudermes', 'Gus-Khrustalny', 'Dzerzhinsk', 'Dmitrov', 'Dubna', 'Yeysk', 'Yekaterinburg',
    'Yelabuga', 'Yelets', 'Yessentuki', 'Zlatoust', 'Ivanovo', 'Izhevsk', 'Irkutsk', 'Yoshkar-Ola', 'Kazan',
    'Kaliningrad', 'Kaluga', 'Kemerovo', 'Kislovodsk', 'Komsomolsk-on-Amur', 'Kotlas', 'Krasnodar', 'Krasnoyarsk',
    'Kurgan', 'Kursk', 'Kyzyl', 'Leninogorsk', 'Lensk', 'Lipetsk', 'Luga', 'Lyuban', 'Lyubertsy', 'Magadan', 'Maykop',
    'Makhachkala', 'Miass', 'Mineralnye Vody', 'Mirny', 'Moscow', 'Murmansk', 'Murom', 'Mytishchi',
    'Naberezhnye Chelny', 'Nadym', 'Nalchik', 'Nazran', 'Naryan-Mar', 'Nakhodka', 'Nizhnevartovsk', 'Nizhnekamsk',
    'Nizhny Novgorod', 'Nizhny Tagil', 'Novokuznetsk', 'Novosibirsk', 'Novy Urengoy', 'Norilsk', 'Obninsk',
    'Oktyabrsky', 'Omsk', 'Orenburg', 'Orekhovo-Zuyevo', 'Oryol', 'Penza', 'Perm', 'Petrozavodsk',
    'Petropavlovsk-Kamchatsky', 'Podolsk', 'Pskov', 'Pyatigorsk', 'Rostov-on-Don', 'Rybinsk', 'Ryazan', 'Salekhard',
    'Samara', 'Saint Petersburg', 'Saransk', 'Saratov', 'Severodvinsk', 'Smolensk', 'Sol-Iletsk', 'Sochi', 'Stavropol',
    'Surgut', 'Syktyvkar', 'Tambov', 'Tver', 'Tobolsk', 'Tolyatti', 'Tomsk', 'Tuapse', 'Tula', 'Tynda', 'Tyumen',
    'Ulan-Ude', 'Ulyanovsk', 'Ufa', 'Khabarovsk', 'Khanty-Mansiysk', 'Chebarkul', 'Cheboksary', 'Chelyabinsk',
    'Cherepovets', 'Cherkessk', 'Chistopol', 'Chita', 'Shadrinsk', 'Shatura', 'Shuya', 'Elista', 'Engels',
    'Yuzhno-Sakhalinsk', 'Yakutsk', 'Yaroslavl'
];

/**
 * @title Basic Select
 */
@Component({
    selector: 'select-search-overview-example',
    templateUrl: 'select-search-overview-example.html',
    styleUrls: ['select-search-overview-example.css']
})
export class SelectSearchOverviewExample implements OnInit {
    selected = [];

    searchControl: FormControl = new FormControl();
    options: string[] = OPTIONS.sort();

    filteredOptions: Observable<string[]>;

    ngOnInit(): void {
        this.filteredOptions = merge(
            of(OPTIONS),
            this.searchControl.valueChanges
                .pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    private getFilteredOptions(value: any): string[] {
        const searchFilter = (value && value.new) ? value.value : value;

        return searchFilter
            ? this.options.filter((option) =>
                option.toLowerCase().includes((searchFilter.toLowerCase())))
            : this.options;
    }
}
