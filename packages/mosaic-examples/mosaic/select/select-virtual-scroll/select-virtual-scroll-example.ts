import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ViewChild } from '@angular/core';


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
 * @title select-virtual-scroll
 */
@Component({
    selector: 'select-virtual-scroll-example',
    templateUrl: 'select-virtual-scroll-example.html',
    styleUrls: ['select-virtual-scroll-example.css']
})
export class SelectVirtualScrollExample {
    options: string[] = OPTIONS.sort();

    initialRange: ListRange = { start: 0, end: 7 } as unknown as ListRange;

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

    openedChange(opened) {
        if (opened) { return; }

        this.cdkVirtualScrollViewport.setRenderedContentOffset(0);
        this.cdkVirtualScrollViewport.setRenderedRange(this.initialRange);
    }
}
