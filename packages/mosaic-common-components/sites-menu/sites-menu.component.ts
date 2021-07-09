// tslint:disable:no-unbound-method
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    TemplateRef, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FlatTreeControl } from '@ptsecurity/cdk/tree';
import { McHighlightPipe } from '@ptsecurity/mosaic/core';
import { McTreeFlatDataSource, McTreeFlattener } from '@ptsecurity/mosaic/tree';

import { Site, Application, ApplicationTypeEnum } from './sites-menu.types';
import { McInput } from '@ptsecurity/mosaic/input';
import { McDropdownTrigger } from '@ptsecurity/mosaic/dropdown';


// tslint:disable-next-line:naming-convention
interface UrlParts {
    protocol: string;
    hostname: string;
    port: string;
}

class MenuItemFlatNode {
    id: string;
    name: string;
    level: number;
    expandable: boolean;
    applications: Application[];
    link?: string;
    isMain: boolean;
    alias: string;
    parent: any;
    // tslint:disable-next-line:no-reserved-keywords
    type: ApplicationTypeEnum;
}

@Component({
    selector: 'sites-menu',
    templateUrl: './sites-menu.template.html',
    styleUrls: ['./sites-menu.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SitesMenuComponent implements OnChanges {
    @Input() sites: Site;
    @Input() searchPlaceholder: string = '';
    @Input() mainSiteTitle: TemplateRef<any>;
    @Input() otherAppsTitle: TemplateRef<any>;
    @Input() searchNothingFound: TemplateRef<any>;
    @Input() hasBackdrop = false;
    @Input() backdropClass = 'cdk-overlay-transparent-backdrop';

    @Output() onDetectCurrentSite = new EventEmitter<Site>();
    @Output() openedChange = new EventEmitter<boolean>();

    @ViewChild(McInput) mcInput: McInput;
    @ViewChild(McDropdownTrigger) mcDropdownTrigger: McDropdownTrigger;

    otherSites: Site[];
    mainSite: Site;
    currentSite: Site;
    appsOfCurrentSite: Application[];

    isSingleInstallation: boolean = false;
    isShowingSearchInput: boolean = false;

    canShowAlias: boolean = false;
    nothingFound: boolean = false;

    filterValue: string = '';

    selectedAppIdInTree: string[];
    selectedAppIdInList: string[];

    treeControl: FlatTreeControl<MenuItemFlatNode>;
    treeFlattener: McTreeFlattener<Site, MenuItemFlatNode>;
    dataSource: McTreeFlatDataSource<Site, MenuItemFlatNode>;

    constructor(private mcHighlightPipe: McHighlightPipe) {
        this.configureTreeSelect();

        this.dataSource.data = [];
    }

    get opened(): boolean {
        return this.mcDropdownTrigger?.opened;
    }

    ngOnChanges(): void {
        if (this.sites) {
            // делаем плоский список для удобства работы
            const flatSiteList = this.flattenRecursive([this.sites]);

            // формируем наборы данных для визуализации
            this.isSingleInstallation = flatSiteList.length === 1;

            this.canShowAlias = []
                // @ts-ignore
                .concat(...flatSiteList.map((site: Site) => site.applications || []))
                .filter((app: Application) => app.type === ApplicationTypeEnum.MPSIEM)
                .length > 1;

            // @ts-ignore
            this.currentSite = this.getCurrentSite(flatSiteList);
            // @ts-ignore
            this.mainSite = flatSiteList.find((site: Site) => site.id === this.sites.id);
            this.otherSites = this.getOtherSites(flatSiteList);

            this.setAppsOfCurrentSite(this.currentSite!.applications);
            this.dataSource.data = this.otherSites || [];
        }
    }

    highlightText(name, filterValue): string {
        return this.mcHighlightPipe.transform(name, filterValue);
    }

    toggleSearchInput() {
        setTimeout(() => this.focusMcInput());
        this.filterValue = '';
        this.nothingFound = false;
        this.treeControl.filterNodes(this.filterValue);
        this.isShowingSearchInput = !this.isShowingSearchInput;
    }

    hasChild(_: number, nodeData: MenuItemFlatNode): boolean {
        return nodeData.expandable;
    }

    onFilterChange(value: string) {
        this.filterValue = value;
        this.treeControl.filterNodes(this.filterValue);
        this.nothingFound = this.treeControl.filterModel.selected.length === 0;
    }

    handlerClose($event: MouseEvent) {
        $event.stopPropagation();
    }

    resetFilter($event: MouseEvent) {
        // mc-cleaner sets value to null which causes errors in the console
        $event.stopPropagation();
        this.onFilterChange('');
    }

    hasMaxPatrol10Alias(node): boolean {
        return this.canShowAlias && (node.type === ApplicationTypeEnum.MPSIEM);
    }

    onSelectionChangedInTree() {
        this.selectedAppIdInList = [];
    }

    onSelectionChangedInList() {
        this.selectedAppIdInTree = [];
    }

    onDropDownOpened(): void {
        this.openedChange.emit(true);
    }

    onDropDownClosed(): void {
        this.openedChange.emit(true);
    }

    private focusMcInput() {
        this.mcInput.focus();
    }

    private getCurrentSite(sites: Site[]) {
        const currentSite = sites.find((site: Site) => site.isCurrent);

        // TODO
        this.onDetectCurrentSite.emit(currentSite);

        return currentSite;
    }

    private getOtherSites(sites: Site[]) {
        const otherSites = []
            // @ts-ignore
            .concat(...sites.filter((site: Site) => site.id !== this.currentSite?.id));

        return otherSites.sort((a: Site, b: Site) => {
            if (b.id === this.mainSite?.id) {
                return 1;
            }

            return a.name > b.name ? 1 : a.name === b.name ? 0 : -1;
        });
    }

    private setAppsOfCurrentSite(applications: Application[]): void {
        this.appsOfCurrentSite = applications || [];
        this.selectCurrentApp(applications);
    }

    private selectCurrentApp(applications: Application[]): void {
        const currentApp = applications.find((app: Application) => {
            const appUrlParts = this.getUrlParts(app.endpoint);
            const currentWindowUrlParts = this.getUrlParts(window.location.href);

            return appUrlParts.protocol === currentWindowUrlParts.protocol &&
                appUrlParts.port === currentWindowUrlParts.port &&
                appUrlParts.hostname === currentWindowUrlParts.hostname;
        });

        this.selectedAppIdInList = currentApp ? [currentApp.id] : [''];
    }

    private configureTreeSelect() {
        // @ts-ignore
        this.treeFlattener = new McTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            // @ts-ignore
            this.getChildren
        );

        this.treeControl = new FlatTreeControl<MenuItemFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.dataSource = new McTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    private flattenRecursive(tree: Site[], flat: any[]= []): Site[] {
        for (const node of tree) {
            flat.push({ ...node, children: [] });

            if (node.children) {
                this.flattenRecursive(node.children, flat);
            }
        }

        return flat;
    }

    private transformer(node, level: number, parent: any) {
        const flatNode = new MenuItemFlatNode();

        flatNode.id = node.id;
        flatNode.name = node.name || node.displayName;
        flatNode.alias = node.alias;
        flatNode.parent = parent;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        flatNode.link = node.endpoint;
        flatNode.isMain = node.isMain;
        flatNode.type = node.type;

        return flatNode;
    }

    private getLevel(node: MenuItemFlatNode): number {
        return node.level;
    }

    private isExpandable(node: MenuItemFlatNode): boolean {
        return node.expandable;
    }

    private getChildren(node: MenuItemFlatNode): Application[] {
        return node.applications;
    }

    private getValue(node: MenuItemFlatNode): string {
        return node.id;
    }

    private getViewValue(node: MenuItemFlatNode): string {
        return node.name;
    }

    private getUrlParts(url: string): UrlParts {
        const PROTOCOL_TO_PORT = {
            http: 80,
            https: 443
        };

        const link = document.createElement('a');
        link.href = url;

        const protocol = link.protocol.replace(':', '').toLocaleLowerCase();
        const port = link.port ? link.port : PROTOCOL_TO_PORT[protocol]?.toString();

        return {
            hostname: link.hostname,
            protocol,
            port
        };
    }
}

