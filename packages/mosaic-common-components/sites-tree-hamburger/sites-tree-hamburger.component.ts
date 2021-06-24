import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { FlatTreeControl } from '@ptsecurity/cdk/tree';
import { McHighlightPipe } from '@ptsecurity/mosaic/core';
import { McTreeFlatDataSource, McTreeFlattener } from '@ptsecurity/mosaic/tree';

import { Site, Application, ApplicationTypeEnum } from './sites-tree-hamburger.types';


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
    type: ApplicationTypeEnum;
}

@Component({
    selector: 'sites-tree-hamburger',
    templateUrl: './sites-tree-hamburger.template.html',
    styleUrls: ['./sites-tree-hamburger.styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SitesTreeHamburgerComponent implements OnChanges {
    @Input() sites: Site;
    @Input() searchPlaceholder = '';
    @Input() mainSiteTitle: TemplateRef<any>;
    @Input() otherAppsTitle: TemplateRef<any>;
    @Input() searchNothingFound: TemplateRef<any>;
    @Output() onDetectCurrentSite = new EventEmitter<Site>();

    otherSites: Site[];
    mainSite: Site;
    currentSite: Site;
    appsOfCurrentSite: Application[];
    isSingleInstallation: boolean = false;
    canShowAlias: boolean = false;
    isShowingSearchInput: boolean = false;
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

    ngOnChanges(changes: SimpleChanges): void {
        if (this.sites) {
            // делаем плоский список для удобства работы
            const flatSiteList = this.flattenRecursive([this.sites]);
            // формируем наборы данных для визуализации
            this.isSingleInstallation = flatSiteList.length === 1;
            this.canShowAlias = [].concat(...flatSiteList.map((site: Site) => site.applications || []))
                .filter((app: Application) => app.type === ApplicationTypeEnum.MPSIEM)
                .length > 1;
            this.currentSite = this.getCurrentSite(flatSiteList);
            this.mainSite = flatSiteList.find((site: Site) => site.id === this.sites.id);
            this.otherSites = this.getOtherSites(flatSiteList);
            this.setAppsOfCurrentSite(this.currentSite.applications);
            this.dataSource.data = this.otherSites || [];
        }
    }

    highlightText(name, filterValue): string {
        return this.mcHighlightPipe.transform(name, filterValue);
    }

    toggleSearchInput() {
        this.filterValue = '';
        this.nothingFound = false;
        this.treeControl.filterNodes(null);
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

    private getCurrentSite(sites: Site[]) {
        const currentSite = sites.find((site) => site.isCurrent);
        this.onDetectCurrentSite.emit(currentSite);

        return currentSite;
    }

    private getOtherSites(sites: Site[]) {
        const otherSites = [].concat(...sites.filter((site) => site.id !== this.currentSite?.id));

        return otherSites.sort((a, b) => {
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
        const PROTOCOL_TO_PORT = {
            http: 80,
            https: 443
        };

        const currentApp = applications.find((app: Application) => {
            const url = document.createElement('a');

            url.href = app.endpoint;

            const protocolFromLink = url.protocol.replace(':', '').toLocaleLowerCase();
            let portFromLink: string = url.port;

            if (!portFromLink) {
                if (PROTOCOL_TO_PORT[protocolFromLink]) {
                    portFromLink = PROTOCOL_TO_PORT[protocolFromLink].toString();
                }
            }

            return window.location.protocol.replace(':', '') === protocolFromLink &&
                window.location.hostname === url.hostname &&
                window.location.port.toString() === portFromLink;
        });

        this.selectedAppIdInList = currentApp ? [currentApp.id] : [''];
    }

    private configureTreeSelect() {
        this.treeFlattener = new McTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
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

    private flattenRecursive(tree: Site[], flat= []): Site[] {
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
}

