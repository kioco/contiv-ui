/**
 * Created by cshampur on 10/14/16.
 */

import {Component, OnInit, Input, Inject, EventEmitter, Output, AfterViewChecked, NgZone} from "@angular/core";
import {CRUDHelperService} from "../components/utils/crudhelperservice";
import { StateService } from "angular-ui-router/commonjs/ng1";
import {ServicelbsModel} from "../components/models/servicelbsmodel";
var _ = require('lodash');


@Component({
    selector: 'servicelb-info',
    templateUrl: "service_lbs/servicelbinfo.html"
})

export class  ServicelbInfoComponent implements OnInit{
    @Input('mode') mode: string;
    @Output('modeChange') modeChange: EventEmitter<any>;
    @Output('serviceName') serviceName: EventEmitter<any>;
    private servicelbsModel: ServicelbsModel;
    private crudHelperService: CRUDHelperService;
    public servicelbInfoCtrl: any;
    public infoselected: boolean
    public statskey: string;
    public servicelb: any;
    public labelSelectors: any;
    public showLoader: boolean;
    private ngZone: NgZone;

    constructor(@Inject('$state') private $state: StateService,
                servicelbsModel: ServicelbsModel,
                crudHelperService: CRUDHelperService,
                ngZone: NgZone){
        this.servicelbsModel = servicelbsModel;
        this.crudHelperService = crudHelperService;
        this.infoselected = true;
        this.statskey=''
        this.showLoader = true;
        this['showServerError'] = false;
        this['serverErrorMessage'] = '';
        this.mode = 'details';
        this.servicelb = {serviceName: '', networkName: '', ipAddress: '', selectors: [], ports: [], tenantName: 'default', key:''};
        this.labelSelectors =[];
        this.modeChange = new EventEmitter<any>();
        this.serviceName = new EventEmitter<any>();
        this.ngZone = ngZone;
        this.servicelbInfoCtrl = this;
    }

    ngOnInit(){
        this.crudHelperService.startLoader(this);
        this.statskey = this.$state.params['key'];
        this.getServicelbs(false);
    }

    returnToServicelbDetails() {
        this.mode = "details";
        this.modeChange.emit(this.mode);
    }

    returnToServicelbs(){
        this.$state.go('contiv.menu.servicelbs.list');
    }

    getServicelbs(reload: boolean){
        var servicelbInfoCtrl = this;
        this.servicelbsModel.getModelByKey(this.statskey, false, 'key')
            .then((result) => {
                    servicelbInfoCtrl['servicelb'] = result;
                    servicelbInfoCtrl.createEditViewLabels();
                    servicelbInfoCtrl.serviceName.emit(servicelbInfoCtrl.servicelb.serviceName);
                    servicelbInfoCtrl.ngZone.run(() => {
                        servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                    });
                },
                (error) => {
                    servicelbInfoCtrl.ngZone.run(() => {
                        servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                    });
                })
    }

    createEditViewLabels(){
        this.servicelb.selectors.forEach((item) => {
            var selector = {
                name: item.split('=')[0],
                value: item.split('=')[1]
            }
            this.labelSelectors.push(selector);
        });
    }

    createLabelSelectorStrings(){
        var servicelbInfoCtrl = this;
        this.servicelb.selectors = [];
        this.labelSelectors.forEach((selector) => {
            var selectorString = selector.name+"="+selector.value;
            this.servicelb.selectors.push(selectorString);
        });
    }

    saveServicelb(){
        this.crudHelperService.hideServerError(this);
        this.crudHelperService.startLoader(this);
        var existingLabelsView = this.servicelb.selectors.slice();
        this.createLabelSelectorStrings();
        var servicelbInfoCtrl = this;
        this.servicelbsModel.save(this.servicelb)
            .then((result) => {
                servicelbInfoCtrl.ngZone.run(() => {
                    servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                });
                servicelbInfoCtrl.returnToServicelbDetails();
            },(error) => {
                servicelbInfoCtrl.servicelb.selectors = existingLabelsView;
                servicelbInfoCtrl.ngZone.run(() => {
                    servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                    servicelbInfoCtrl.crudHelperService.showServerError(servicelbInfoCtrl, error);
                });
            });
    }

    deleteServicelb() {
        this.crudHelperService.hideServerError(this);
        this.crudHelperService.startLoader(this);
        var servicelbInfoCtrl = this;
        this.servicelbsModel.delete(this.servicelb)
            .then((result) => {
                    servicelbInfoCtrl.ngZone.run(() => {
                        servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                    });
                    servicelbInfoCtrl.returnToServicelbs();
                },
                (error) => {
                    servicelbInfoCtrl.ngZone.run(() => {
                        servicelbInfoCtrl.crudHelperService.stopLoader(servicelbInfoCtrl);
                        servicelbInfoCtrl.crudHelperService.showServerError(servicelbInfoCtrl, error);
                    });
                }
            );
    }

    cancelEditing(){
        this.returnToServicelbDetails();
    }
}