import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, Renderer, ViewChild, ChangeDetectorRef, ViewEncapsulation, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IMyDateRange, IMyDate, IMyMonth, IMyCalendarDay, IMyCalendarMonth, IMyCalendarYear, IMyWeek, IMyDayLabels, IMyMonthLabels, IMyOptions, IMyDateRangeModel, IMyInputFieldChanged, IMyCalendarViewChanged, IMyInputFocusBlur, IMyDateSelected } from "./interfaces/index";
import { DateRangeUtilService } from "./services/my-date-range-picker.date.range.util.service";

/*
declare var require: any;
const myDrpStyles: string = require("./my-date-range-picker.component.scss");
const myDrpTemplate: string = require("./my-date-range-picker.component.html");
*/

export const MYDRP_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyDateRangePicker),
    multi: true
};

enum Year {min = 1100, max = 9100}
enum InputFocusBlur {focus = 1, blur = 2}
enum KeyCode {enter = 13, esc = 27, space = 32}
enum MonthId {prev = 1, curr = 2, next = 3}

@Component({
    selector: "my-date-range-picker",
    exportAs: "mydaterangepicker",
    styles: [`.mydrp .monthcell,.mydrp .selection,.mydrp .weekdaytitle{overflow:hidden;white-space:nowrap}.mydrp{line-height:1;display:inline-block;position:relative}.mydrp *{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;padding:0;margin:0}.mydrp,.mydrp .headertodaybtn,.mydrp .selection,.mydrp .selectiongroup,.mydrp .selector{border-radius:4px}.mydrp .header,.mydrp .titlearea,.mydrp .titleareatxt{border-radius:4px 4px 0 0}.mydrp .caltable,.mydrp .monthtable,.mydrp .yeartable{border-radius:0 0 4px 4px}.mydrp .caltable tbody tr:nth-child(6) td:first-child,.mydrp .monthtable tbody tr:nth-child(4) td:first-child,.mydrp .yeartable tbody tr:nth-child(7) td:first-child{border-bottom-left-radius:4px}.mydrp .caltable tbody tr:nth-child(6) td:last-child,.mydrp .monthtable tbody tr:nth-child(4) td:last-child,.mydrp .yeartable tbody tr:nth-child(7) td:last-child{border-bottom-right-radius:4px}.mydrp .btnpicker{border-radius:0 4px 4px 0}.mydrp .selector{margin-top:2px;margin-left:-1px;position:absolute;z-index:100;animation:selectorfadein 60ms}.mydrp .selector:focus{border:1px solid #ADD8E6;outline:0}@keyframes selectorfadein{from{opacity:0}to{opacity:1}}.mydrp .selectorarrow:after,.mydrp .selectorarrow:before{bottom:100%;border:solid transparent;content:" ";height:0;width:0;position:absolute}.mydrp .selectorarrow:after{border-color:rgba(250,250,250,0);border-bottom-color:#FFF;border-width:10px;margin-left:-10px}.mydrp .selectorarrow:before{border-color:rgba(204,204,204,0);border-bottom-color:#CCC;border-width:11px;margin-left:-11px}.mydrp .selectorarrow:focus:before{border-bottom-color:#ADD8E6}.mydrp .selectorarrowleft:after,.mydrp .selectorarrowleft:before{left:24px}.mydrp .selectorarrowright:after,.mydrp .selectorarrowright:before{left:224px}.mydrp .alignselectorright{right:-1px}.mydrp .selectiongroup{position:relative;display:table;border:none;border-spacing:0;background-color:#FFF}.mydrp .selection{outline:0;background-color:#FFF;display:table-cell;position:absolute;width:100%;padding:0 64px 0 6px;text-overflow:ellipsis;border:none;color:#555}.mydrp .invaliddaterange{background-color:#F1DEDE}.mydrp ::-ms-clear{display:none}.mydrp .selbtngroup{position:relative;vertical-align:middle;white-space:nowrap;width:1%;display:table-cell;font-size:0}.mydrp .btnclear,.mydrp .btnpicker{height:100%;width:26px;border:none;padding:0;outline:0;font:inherit;-moz-user-select:none}.mydrp .headerclearbtn,.mydrp .headerokbtn{border-radius:2px;cursor:pointer;font-size:11px;height:20px;width:28px;outline:0}.mydrp .btnclearenabled,.mydrp .btnpickerenabled,.mydrp .headerbtnenabled,.mydrp .yearchangebtnenabled{cursor:pointer}.mydrp .btncleardisabled,.mydrp .btnpickerdisabled,.mydrp .clearbtndisabled,.mydrp .headerbtndisabled,.mydrp .okbtndisabled,.mydrp .selectiondisabled,.mydrp .yearchangebtndisabled{cursor:not-allowed;opacity:.65}.mydrp .selectiondisabled{background-color:#EEE}.mydrp .btnclear,.mydrp .btnpicker,.mydrp .headerclearbtn,.mydrp .headerokbtn{background:#FFF}.mydrp .header{width:100%;height:30px;background-color:#FFF}.mydrp .header td{vertical-align:middle;border:none;line-height:0}.mydrp .header td:nth-child(1){padding-left:4px}.mydrp .header td:nth-child(2){text-align:center}.mydrp .header td:nth-child(3){padding-right:4px}.mydrp .titlearea{text-align:center;background-color:#FFF}.mydrp .titleareatxt{height:24px;line-height:24px;font-size:12px;border-bottom:1px solid #EEE}.mydrp .inline{position:relative;margin-top:-1px}.mydrp .caltable,.mydrp .monthtable,.mydrp .yeartable{table-layout:fixed;width:100%;background-color:#FFF;font-size:14px}.mydrp .caltable,.mydrp .daycell,.mydrp .monthcell,.mydrp .monthtable,.mydrp .weekdaytitle,.mydrp .yearcell,.mydrp .yeartable{border-collapse:collapse;line-height:1.1}.mydrp .daycell,.mydrp .monthcell,.mydrp .weekdaytitle,.mydrp .yearcell{padding:4px;text-align:center}.mydrp .weekdaytitle{font-weight:400;vertical-align:middle;max-width:36px}.mydrp .weekdaytitleweeknbr{width:20px;border-right:1px solid #BBB}.mydrp .monthcell{background-color:#FAFAFA}.mydrp .yearcell{background-color:#FAFAFA;width:20%}.mydrp .daycellweeknbr{font-size:10px;border-right:1px solid #CCC;cursor:default;color:#000}.mydrp .disabled{cursor:default!important;color:#444!important;background:#FBEFEF!important}.mydrp .sundayDim{opacity:.5}.mydrp .currmonth{background-color:#F6F6F6;font-weight:400}.mydrp .markcurrday,.mydrp .markcurrmonth,.mydrp .markcurryear{text-decoration:underline}.mydrp .datevalue{background-color:inherit}.mydrp .selecteddaybegin,.mydrp .selecteddayend,.mydrp .selectedmonth .monthvalue,.mydrp .selectedyear .yearvalue{border:none;background-color:#8EBFFF;border-radius:2px}.mydrp .headerbtncell{background-color:#FFF;cursor:pointer;display:table-cell;vertical-align:middle}.mydrp .yearchangebtncell{text-align:center;background-color:#FAFAFA}.mydrp .headerbtn,.mydrp .headerlabelbtn,.mydrp .yearchangebtn{background:#FFF;border:none;height:22px}.mydrp .headerbtn{width:16px}.mydrp .headerlabelbtn{font-size:14px;outline:0;cursor:default}.mydrp,.mydrp .headerclearbtn,.mydrp .headerokbtn{border:1px solid #CCC}.mydrp .btnclear,.mydrp .btnpicker,.mydrp .headerbtn,.mydrp .headerclearbtn,.mydrp .headermonthtxt,.mydrp .headerokbtn,.mydrp .headeryeartxt,.mydrp .yearchangebtn{color:#000}.mydrp button::-moz-focus-inner{border:0}.mydrp .headermonthtxt,.mydrp .headeryeartxt{text-align:center;display:table-cell;vertical-align:middle;font-size:14px;height:26px;width:40px;max-width:40px;overflow:hidden;white-space:nowrap}.mydrp .btnclear:focus,.mydrp .btnpicker:focus,.mydrp .headerclearbtn:focus,.mydrp .headerokbtn:focus{background:#ADD8E6}.mydrp .headerbtn:focus,.mydrp .monthlabel:focus,.mydrp .yearchangebtn:focus,.mydrp .yearlabel:focus{color:#ADD8E6;outline:0}.mydrp .icon-mydrpcalendar,.mydrp .icon-mydrpok,.mydrp .icon-mydrpremove{font-size:16px}.mydrp .icon-mydrpdown,.mydrp .icon-mydrpleft,.mydrp .icon-mydrpright,.mydrp .icon-mydrpup{color:#222;font-size:20px}.mydrp table{display:table;border-spacing:0}.mydrp table td{padding:0}.mydrp table,.mydrp td,.mydrp th{border:none}.mydrp tr td:first-child,.mydrp tr th:first-child,.mydrp tr:hover td:first-child{border-left:none!important}.mydrp .btnclearenabled:hover,.mydrp .btnpickerenabled:hover,.mydrp .headerclearbtnenabled:hover,.mydrp .headerokbtnenabled:hover{background-color:#E6E6E6}.mydrp .daycell:hover,.mydrp .monthcell:hover,.mydrp .yearcell:hover{background-color:#DDD}.mydrp .daycell,.mydrp .inputnoteditable,.mydrp .monthcell,.mydrp .monthlabel,.mydrp .yearcell,.mydrp .yearlabel{cursor:pointer}.mydrp .headerbtnenabled:hover,.mydrp .monthlabel:hover,.mydrp .yearchangebtnenabled:hover,.mydrp .yearlabel:hover{color:#777}@font-face{font-family:mydaterangepicker;src:url(data:application/octet-stream;base64,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sAMlsAJiILAAUFiwQGBZZrABY2GwAiVGYTgjIDwjOBshICBGI0ewASsjYTghWbErARQrLbBCLLA1Ky6xKwEUKy2wQyywNishIyAgPLAEI0IjOLErARQrsARDLrArKy2wRCywABUgR7AAI0KyAAEBFRQTLrAxKi2wRSywABUgR7AAI0KyAAEBFRQTLrAxKi2wRiyxAAEUE7AyKi2wRyywNCotsEgssAAWRSMgLiBGiiNhOLErARQrLbBJLLAII0KwSCstsEossgAAQSstsEsssgABQSstsEwssgEAQSstsE0ssgEBQSstsE4ssgAAQistsE8ssgABQistsFAssgEAQistsFEssgEBQistsFIssgAAPistsFMssgABPistsFQssgEAPistsFUssgEBPistsFYssgAAQCstsFcssgABQCstsFgssgEAQCstsFkssgEBQCstsFossgAAQystsFsssgABQystsFwssgEAQystsF0ssgEBQystsF4ssgAAPystsF8ssgABPystsGAssgEAPystsGEssgEBPystsGIssDcrLrErARQrLbBjLLA3K7A7Ky2wZCywNyuwPCstsGUssAAWsDcrsD0rLbBmLLA4Ky6xKwEUKy2wZyywOCuwOystsGgssDgrsDwrLbBpLLA4K7A9Ky2waiywOSsusSsBFCstsGsssDkrsDsrLbBsLLA5K7A8Ky2wbSywOSuwPSstsG4ssDorLrErARQrLbBvLLA6K7A7Ky2wcCywOiuwPCstsHEssDorsD0rLbByLLMJBAIDRVghGyMhWUIrsAhlsAMkUHiwARUwLQBLuADIUlixAQGOWbABuQgACABjcLEABUKyAAEAKrEABUKzCgIBCCqxAAVCsw4AAQgqsQAGQroCwAABAAkqsQAHQroAQAABAAkqsQMARLEkAYhRWLBAiFixA2REsSYBiFFYugiAAAEEQIhjVFixAwBEWVlZWbMMAgEMKrgB/4WwBI2xAgBEAAA=) format("truetype");font-weight:400;font-style:normal}.mydrp .mydrpicon{font-family:mydaterangepicker;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.mydrp .icon-mydrpright:before{content:"\\e800"}.mydrp .icon-mydrpleft:before{content:"\\e801"}.mydrp .icon-mydrpup:before{content:"\\e802"}.mydrp .icon-mydrpdown:before{content:"\\e803"}.mydrp .icon-mydrpcalendar:before{content:"\\e804"}.mydrp .icon-mydrpok:before{content:"\\e805"}.mydrp .icon-mydrpremove:before{content:"\\e806"}.mydrp{border:none!important;border-radius:0!important;border-bottom:1px solid #333!important}.mydrp .caltable,.mydrp .daycell,.mydrp .monthcell,.mydrp .monthtable,.mydrp .sunday,.mydrp .weekdaytitle,.mydrp .yearcell,.mydrp .yeartable{color:#6c6c6c!important}.mydrp .markcurrday{background:#fed100;border-radius:50%;width:39px;height:39px;display:inline-block;line-height:39px;color:#333!important;font-size:12px;text-decoration:none!important}.mydrp .caltable,.mydrp .nextmonth,.mydrp .prevmonth,.mydrp .weekdaytitle,.mydrp tr td,.mydrp tr th{background-color:transparent!important}.mydrp tr td,.mydrp tr th{height:40px}.mydrp .weekdaytitle{color:#000!important;font-size:16px!important}.mydrp .nextmonth,.mydrp .prevmonth{color:#cacaca!important}.mydrp table.header{background:0 0!important}.mydrp table.header td{display:none}.mydrp table.header td:first-child{display:block}.mydrp table.header td>div{float:none!important;position:relative}.mydrp table.header td>div .headermonthtxt{width:100px;max-width:100px;float:left}.mydrp table.header td>div .headermonthtxt button{background-color:transparent;text-transform:none;font-size:15px;color:#333}.mydrp table.header td>div .headerbtncell{position:absolute;width:22px;height:22px;right:10px;border-radius:50%;text-align:center}.mydrp table.header td>div .headerbtncell button{background-color:transparent}.mydrp table.header td>div .headerbtncell:first-child{right:40px}.mydrp .selectiongroup .seletion{font-size:16px}.mydrp .daycell:focus,.mydrp .monthcell:focus,.mydrp .yearcell:focus{outline:0!important;background:#fed100!important}.mydrp .range{background-color:#fed100!important}.mydrp .selecteddaybegin,.mydrp .selecteddayend{background-color:transparent!important}.mydrp .selector,.mydrp .selectorarrow{border:none;padding:15px;border-radius:6px;background-color:#f4f4f4}.mydrp .selectorarrow{margin-top:12px}.mydrp .selectorarrow:after,.mydrp .selectorarrow:before,.mydrp .titleareatxt{display:none}`],
    template: `<div class="mydrp" [ngStyle]="{'width': opts.width, 'border': opts.inline ? 'none' : null}"><div class="selectiongroup" *ngIf="!opts.inline"><input type="text" class="selection" [attr.aria-label]="opts.ariaLabelInputField" (click)="opts.openSelectorOnInputClick&&!opts.editableDateRangeField&&openBtnClicked()" [attr.maxlength]="dateRangeFormat.length" [ngClass]="{'invaliddaterange': invalidDateRange&&opts.indicateInvalidDateRange, 'inputnoteditable': opts.openSelectorOnInputClick&&!opts.editableDateRangeField, 'selectiondisabled': opts.componentDisabled}" placeholder="{{placeholder}}" [ngStyle]="{'height': opts.height, 'font-size': opts.selectionTxtFontSize}" [ngModel]="selectionDayTxt" (ngModelChange)="onUserDateRangeInput($event)" (keyup)="onCloseSelector($event)" (focus)="opts.editableDateRangeField&&onFocusInput($event)" (blur)="opts.editableDateRangeField&&onBlurInput($event)" [value]="selectionDayTxt" [disabled]="opts.componentDisabled" [readonly]="!opts.editableDateRangeField" autocomplete="off" spellcheck="false" autocorrect="off"> <span class="selbtngroup" [style.height]="opts.height"><button type="button" class="btnclear" [attr.aria-label]="opts.ariaLabelClearDateRange" *ngIf="selectionDayTxt.length>0&&opts.showClearDateRangeBtn" (click)="removeBtnClicked();$event.stopPropagation()" [ngClass]="{'btnclearenabled': !opts.componentDisabled, 'btncleardisabled': opts.componentDisabled}" [disabled]="opts.componentDisabled"><span class="mydrpicon icon-mydrpremove"></span></button> <button type="button" class="btnpicker" [attr.aria-label]="opts.ariaLabelOpenCalendar" (click)="openBtnClicked()" [ngClass]="{'btnpickerenabled': !opts.componentDisabled, 'btnpickerdisabled': opts.componentDisabled}" [disabled]="opts.componentDisabled"><span class="mydrpicon icon-mydrpcalendar"></span></button></span></div><div class="selector" #selectorEl *ngIf="showSelector||opts.inline" [ngStyle]="{'width': opts.selectorWidth, 'height' : opts.selectorHeight}" [mydrpfocus]="opts.inline?'0':'1'" [ngClass]="{'inline': opts.inline, 'alignselectorright': opts.alignSelectorRight, 'selectorarrow': opts.showSelectorArrow&&!opts.inline, 'selectorarrowleft': opts.showSelectorArrow&&!opts.alignSelectorRight&&!opts.inline, 'selectorarrowright': opts.showSelectorArrow&&opts.alignSelectorRight&&!opts.inline}" (keyup)="onCloseSelector($event)" tabindex="0"><div class="titlearea" *ngIf="opts.showSelectDateText"><div class="titleareatxt">{{titleAreaText!==''?titleAreaText:opts.selectBeginDateTxt}}</div></div><div class="header"><div class="headermonthtxt">{{visibleMonth.monthTxt}} {{visibleMonth.year}}</div><div class="headerbtncell"><button type="button" class="headerbtn mydrpicon icon-mydrpleft" [attr.aria-label]="opts.ariaLabelPrevMonth" (click)="onPrevMonth()" [disabled]="prevMonthDisabled" [ngClass]="{'headerbtnenabled': !prevMonthDisabled, 'headerbtndisabled': prevMonthDisabled}"></button></div><div class="headerbtncell"><button type="button" class="headerbtn mydrpicon icon-mydrpright" [attr.aria-label]="opts.ariaLabelNextMonth" (click)="onNextMonth()" [disabled]="nextMonthDisabled" [ngClass]="{'headerbtnenabled': !nextMonthDisabled, 'headerbtndisabled': nextMonthDisabled}"></button></div></div><table class="caltable" *ngIf="!selectMonth&&!selectYear" [ngStyle]="{'height': opts.showSelectDateText?'calc(100% - 54px)':'calc(100% - 30px)'}"><thead><tr><th class="weekdaytitle weekdaytitleweeknbr" *ngIf="opts.showWeekNumbers&&opts.firstDayOfWeek==='mo'">#</th><th class="weekdaytitle" scope="col" *ngFor="let d of weekDays">{{d}}</th></tr></thead><tbody><tr *ngFor="let w of dates"><td class="daycell daycellweeknbr" *ngIf="opts.showWeekNumbers&&opts.firstDayOfWeek==='mo'">{{w.weekNbr}}</td><td class="daycell" *ngFor="let d of w.week" [ngClass]="{'currmonth':d.cmo===currMonthId&&!d.disabled, 'range': isInRange(d)||d.range, 'disabled': d.disabled}" (click)="!d.disabled && onCellClicked(d);$event.stopPropagation()" (keydown)="onCellKeyDown($event, d)" (mouseenter)="onCellMouseEnter(d)" (mouseleave)="onCellMouseLeave()" tabindex="0"><div class="datevalue" [ngClass]="{'prevmonth':d.cmo===prevMonthId, 'selecteddaybegin':beginDate.day===d.dateObj.day&&beginDate.month===d.dateObj.month&&beginDate.year===d.dateObj.year, 'selecteddayend':endDate.day===d.dateObj.day&&endDate.month===d.dateObj.month&&endDate.year===d.dateObj.year, 'currmonth':d.cmo===currMonthId, 'nextmonth':d.cmo===nextMonthId, 'sunday':d.dayNbr===0&&opts.sunHighlight}"><span [ngClass]="{'markcurrday':d.currDay&&opts.markCurrentDay, 'sundayDim': opts.sunHighlight && d.dayNbr === 0 && (d.cmo===prevMonthId || d.cmo===nextMonthId || d.disabled)}">{{d.dateObj.day}}</span></div></td></tr></tbody></table><table class="monthtable" *ngIf="selectMonth" [ngStyle]="{'height': opts.showSelectDateText?'calc(100% - 54px)':'calc(100% - 30px)'}"><tbody><tr *ngFor="let mr of months"><td class="monthcell tablesinglemonth" [ngClass]="{'selectedmonth': m.selected, 'disabled': m.disabled}" *ngFor="let m of mr" (click)="!m.disabled&&onMonthCellClicked(m);$event.stopPropagation()" (keydown)="onMonthCellKeyDown($event, m)" tabindex="0"><div class="monthvalue" [ngClass]="{'markcurrmonth':m.currMonth&&opts.markCurrentMonth}">{{m.name}}</div></td></tr></tbody></table><table class="yeartable" *ngIf="selectYear" [ngStyle]="{'height': opts.showSelectDateText?'calc(100% - 54px)':'calc(100% - 30px)'}"><tbody><tr><td colspan="5" class="yearchangebtncell" (click)="$event.stopPropagation()"><button type="button" class="yearchangebtn mydrpicon icon-mydrpup" (click)="onPrevYears($event, years[0][0].year)" [disabled]="prevYearsDisabled" [ngClass]="{'yearchangebtnenabled': !prevYearsDisabled, 'yearchangebtndisabled': prevYearsDisabled}"></button></td></tr><tr *ngFor="let yr of years"><td class="yearcell tablesingleyear" [ngClass]="{'selectedyear': y.selected, 'disabled': y.disabled}" *ngFor="let y of yr" (click)="!y.disabled&&onYearCellClicked(y);$event.stopPropagation()" (keydown)="onYearCellKeyDown($event, y)" tabindex="0"><div class="yearvalue" [ngClass]="{'markcurryear':y.currYear&&opts.markCurrentYear}">{{y.year}}</div></td></tr><tr><td colspan="5" class="yearchangebtncell" (click)="$event.stopPropagation()"><button type="button" class="yearchangebtn mydrpicon icon-mydrpdown" (click)="onNextYears($event, years[0][0].year)" [disabled]="nextYearsDisabled" [ngClass]="{'yearchangebtnenabled': !nextYearsDisabled, 'yearchangebtndisabled': nextYearsDisabled}"></button></td></tr></tbody></table></div></div>`,
    providers: [DateRangeUtilService, MYDRP_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None
})

export class MyDateRangePicker implements OnChanges, ControlValueAccessor {
    @Input() options: any;
    @Input() defaultMonth: string;
    @Input() selDateRange: string;
    @Input() placeholder: string;
    @Output() dateRangeChanged: EventEmitter<IMyDateRangeModel> = new EventEmitter<IMyDateRangeModel>();
    @Output() inputFieldChanged: EventEmitter<IMyInputFieldChanged> = new EventEmitter<IMyInputFieldChanged>();
    @Output() calendarViewChanged: EventEmitter<IMyCalendarViewChanged> = new EventEmitter<IMyCalendarViewChanged>();
    @Output() inputFocusBlur: EventEmitter<IMyInputFocusBlur> = new EventEmitter<IMyInputFocusBlur>();
    @Output() dateSelected: EventEmitter<IMyDateSelected> = new EventEmitter<IMyDateSelected>();
    @ViewChild("selectorEl") selectorEl: any;

    onChangeCb: (_: any) => void = () => { };
    onTouchedCb: () => void = () => { };

    showSelector: boolean = false;
    visibleMonth: IMyMonth = {monthTxt: "", monthNbr: 0, year: 0};
    selectedMonth: IMyMonth = {monthTxt: "", monthNbr: 0, year: 0};
    weekDays: Array<string> = [];
    dates: Array<IMyWeek> = [];
    months: Array<Array<IMyCalendarMonth>> = [];
    years: Array<Array<IMyCalendarYear>> = [];
    selectionDayTxt: string = "";
    invalidDateRange: boolean = false;
    dateRangeFormat: string = "";
    dayIdx: number = 0;
    weekDayOpts: Array<string> = ["su", "mo", "tu", "we", "th", "fr", "sa"];

    selectMonth: boolean = false;
    selectYear: boolean = false;

    prevMonthDisabled: boolean = false;
    nextMonthDisabled: boolean = false;
    prevYearDisabled: boolean = false;
    nextYearDisabled: boolean = false;
    prevYearsDisabled: boolean = false;
    nextYearsDisabled: boolean = false;

    prevMonthId: number = MonthId.prev;
    currMonthId: number = MonthId.curr;
    nextMonthId: number = MonthId.next;

    beginDate: IMyDate = {year: 0, month: 0, day: 0};
    endDate: IMyDate = {year: 0, month: 0, day: 0};
    titleAreaText: string = "";

    // Default options
    opts: IMyOptions = {
        dayLabels: <IMyDayLabels> {su: "Sun", mo: "Mon", tu: "Tue", we: "Wed", th: "Thu", fr: "Fri", sa: "Sat"},
        monthLabels: <IMyMonthLabels> {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"},
        dateFormat: <string> "yyyy-mm-dd",
        showClearBtn: <boolean> true,
        showApplyBtn: <boolean> true,
        showSelectDateText: <boolean> true,
        selectBeginDateTxt: <string> "Select Begin Date",
        selectEndDateTxt: <string> "Select End Date",
        firstDayOfWeek: <string> "mo",
        sunHighlight: <boolean> true,
        markCurrentDay: <boolean> true,
        markCurrentMonth: <boolean> true,
        markCurrentYear: <boolean> true,
        height: <string> "34px",
        width: <string> "262px",
        selectorHeight: <string> "232px",
        selectorWidth: <string> "252px",
        inline: <boolean> false,
        showClearDateRangeBtn: <boolean> true,
        selectionTxtFontSize: <string> "14px",
        alignSelectorRight: <boolean> false,
        indicateInvalidDateRange: <boolean> true,
        editableDateRangeField: <boolean> true,
        monthSelector: <boolean> true,
        yearSelector: <boolean> true,
        disableHeaderButtons: <boolean> true,
        showWeekNumbers: <boolean> false,
        minYear: <number> Year.min,
        maxYear: <number> Year.max,
        disableUntil: <IMyDate> {year: 0, month: 0, day: 0},
        disableSince: <IMyDate> {year: 0, month: 0, day: 0},
        disableDates: <Array<IMyDate>> [],
        enableDates: <Array<IMyDate>> [],
        disableDateRanges: <Array<IMyDateRange>> [],
        componentDisabled: <boolean> false,
        showSelectorArrow: <boolean> true,
        openSelectorOnInputClick: <boolean> false,
        ariaLabelInputField: <string> "Date range input field",
        ariaLabelClearDateRange: <string> "Clear date range",
        ariaLabelOpenCalendar: <string> "Open Calendar",
        ariaLabelPrevMonth: <string> "Previous Month",
        ariaLabelNextMonth: <string> "Next Month",
        ariaLabelPrevYear: <string> "Previous Year",
        ariaLabelNextYear: <string> "Next Year"
    };

    constructor(public elem: ElementRef, private renderer: Renderer, private cdr: ChangeDetectorRef, private drus: DateRangeUtilService) {
        renderer.listenGlobal("document", "click", (event: any) => {
            if (this.showSelector && event.target && this.elem.nativeElement !== event.target && !this.elem.nativeElement.contains(event.target)) {
                this.showSelector = false;
            }
            if (this.opts.monthSelector || this.opts.yearSelector) {
                this.resetMonthYearSelect();
            }
        });
    }

    resetMonthYearSelect(): void {
        this.selectMonth = false;
        this.selectYear = false;
    }

    onSelectMonthClicked(event: any): void {
        event.stopPropagation();
        this.selectMonth = !this.selectMonth;
        this.selectYear = false;
        this.cdr.detectChanges();
        if (this.selectMonth) {
            let today: IMyDate = this.getToday();
            this.months.length = 0;
            for (let i = 1; i <= 12; i += 3) {
                let row: Array<IMyCalendarMonth> = [];
                for (let j = i; j < i + 3; j++) {
                    let disabled: boolean = this.drus.isMonthDisabledByDisableUntil({year: this.visibleMonth.year, month: j, day: this.daysInMonth(j, this.visibleMonth.year)}, this.opts.disableUntil)
                        || this.drus.isMonthDisabledByDisableSince({year: this.visibleMonth.year, month: j, day: 1}, this.opts.disableSince);
                    row.push({nbr: j, name: this.opts.monthLabels[j], currMonth: j === today.month && this.visibleMonth.year === today.year, selected: j === this.visibleMonth.monthNbr, disabled: disabled});
                }
                this.months.push(row);
            }
        }
    }

    onMonthCellClicked(cell: IMyCalendarMonth): void {
        let mc: boolean = cell.nbr !== this.visibleMonth.monthNbr;
        this.visibleMonth = {monthTxt: this.monthText(cell.nbr), monthNbr: cell.nbr, year: this.visibleMonth.year};
        this.generateCalendar(cell.nbr, this.visibleMonth.year, mc);
        this.selectMonth = false;
        this.selectorEl.nativeElement.focus();
    }

    onMonthCellKeyDown(event: any, cell: IMyCalendarMonth) {
        if ((event.keyCode === KeyCode.enter || event.keyCode === KeyCode.space) && !cell.disabled) {
            event.preventDefault();
            this.onMonthCellClicked(cell);
        }
    }

    onSelectYearClicked(event: any): void {
        event.stopPropagation();
        this.selectYear = !this.selectYear;
        this.selectMonth = false;
        this.cdr.detectChanges();
        if (this.selectYear) {
            this.generateYears(this.visibleMonth.year);
        }
    }

    onYearCellClicked(cell: IMyCalendarYear): void {
        let yc: boolean = cell.year !== this.visibleMonth.year;
        this.visibleMonth = {monthTxt: this.visibleMonth.monthTxt, monthNbr: this.visibleMonth.monthNbr, year: cell.year};
        this.generateCalendar(this.visibleMonth.monthNbr, cell.year, yc);
        this.selectYear = false;
        this.selectorEl.nativeElement.focus();
    }

    onYearCellKeyDown(event: any, cell: IMyCalendarYear) {
        if ((event.keyCode === KeyCode.enter || event.keyCode === KeyCode.space) && !cell.disabled) {
            event.preventDefault();
            this.onYearCellClicked(cell);
        }
    }

    onPrevYears(event: any, year: number): void {
        event.stopPropagation();
        this.generateYears(year - 25);
    }

    onNextYears(event: any, year: number): void {
        event.stopPropagation();
        this.generateYears(year + 25);
    }

    generateYears(year: number): void {
        this.years.length = 0;
        let today: IMyDate = this.getToday();
        for (let i = year; i <= 20 + year; i += 5) {
            let row: Array<IMyCalendarYear> = [];
            for (let j = i; j < i + 5; j++) {
                let disabled: boolean = this.drus.isMonthDisabledByDisableUntil({year: j, month: this.visibleMonth.monthNbr, day: this.daysInMonth(this.visibleMonth.monthNbr, j)}, this.opts.disableUntil)
                    || this.drus.isMonthDisabledByDisableSince({year: j, month: this.visibleMonth.monthNbr, day: 1}, this.opts.disableSince);
                let minMax: boolean = j < this.opts.minYear || j > this.opts.maxYear;
                row.push({year: j, currYear: j === today.year, selected: j === this.visibleMonth.year, disabled: disabled || minMax});
            }
            this.years.push(row);
        }
        this.prevYearsDisabled = this.years[0][0].year <= this.opts.minYear || this.drus.isMonthDisabledByDisableUntil({year: this.years[0][0].year - 1, month: this.visibleMonth.monthNbr, day: this.daysInMonth(this.visibleMonth.monthNbr, this.years[0][0].year - 1)}, this.opts.disableUntil);
        this.nextYearsDisabled = this.years[4][4].year >= this.opts.maxYear || this.drus.isMonthDisabledByDisableSince({year: this.years[4][4].year + 1, month: this.visibleMonth.monthNbr, day: 1}, this.opts.disableSince);
    }

    onUserDateRangeInput(value: string): void {
        this.invalidDateRange = false;
        if (value.length === 0) {
            this.clearDateRange();
        }
        else {
            let daterange: IMyDateRange = this.drus.isDateRangeValid(value, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableDates, this.opts.disableDateRanges, this.opts.enableDates, this.opts.monthLabels);
            if (this.drus.isInitializedDate(daterange.beginDate) && this.drus.isInitializedDate(daterange.endDate)) {
                this.beginDate = daterange.beginDate;
                this.endDate = daterange.endDate;
                this.rangeSelected();
            }
            else {
                this.invalidDateRange = true;
                this.onChangeCb(null);
                this.onTouchedCb();
            }
        }
        if (this.invalidDateRange) {
            this.inputFieldChanged.emit({value: value, dateRangeFormat: this.dateRangeFormat, valid: !(value.length === 0 || this.invalidDateRange)});
        }
    }

    onFocusInput(event: any): void {
        this.inputFocusBlur.emit({reason: InputFocusBlur.focus, value: event.target.value});
    }

    onBlurInput(event: any): void {
        this.selectionDayTxt = event.target.value;
        this.onTouchedCb();
        this.inputFocusBlur.emit({reason: InputFocusBlur.blur, value: event.target.value});
    }

    onCloseSelector(event: any): void {
        if (event.keyCode === KeyCode.esc && this.showSelector && !this.opts.inline) {
            this.showSelector = false;
        }
    }

    parseOptions(): void {
        if (this.options !== undefined) {
            Object.keys(this.options).forEach((k) => {
                (<IMyOptions>this.opts)[k] = this.options[k];
            });
        }

        if (this.opts.minYear < Year.min) {
            this.opts.minYear = Year.min;
        }
        if (this.opts.maxYear > Year.max) {
            this.opts.maxYear = Year.max;
        }

        this.dateRangeFormat = this.opts.dateFormat + " - " + this.opts.dateFormat;

        this.dayIdx = this.weekDayOpts.indexOf(this.opts.firstDayOfWeek);
        if (this.dayIdx !== -1) {
            let idx: number = this.dayIdx;
            for (let i = 0; i < this.weekDayOpts.length; i++) {
                this.weekDays.push(this.opts.dayLabels[this.weekDayOpts[idx]]);
                idx = this.weekDayOpts[idx] === "sa" ? 0 : idx + 1;
            }
        }
    }

    writeValue(value: Object): void {
        if (value && value["beginDate"] && value["endDate"]) {
            this.beginDate = this.parseSelectedDate(value["beginDate"]);
            this.endDate = this.parseSelectedDate(value["endDate"]);
            let begin: string = this.formatDate(this.beginDate);
            let end: string = this.formatDate(this.endDate);
            this.selectionDayTxt = begin + " - " + end;
            this.titleAreaText = this.selectionDayTxt;
            this.inputFieldChanged.emit({value: this.selectionDayTxt, dateRangeFormat: this.dateRangeFormat, valid: true});
        }
        else if (value === null || value === "") {
            this.clearRangeValues();
            this.inputFieldChanged.emit({value: "", dateRangeFormat: this.dateRangeFormat, valid: false});
        }
        this.invalidDateRange = false;
    }

    setDisabledState(disabled: boolean): void {
        this.opts.componentDisabled = disabled;
    }

    registerOnChange(fn: any): void {
        this.onChangeCb = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCb = fn;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("placeholder")) {
            this.placeholder = changes["placeholder"].currentValue;
        }

        if (changes.hasOwnProperty("options")) {
            this.options = changes["options"].currentValue;
            this.weekDays.length = 0;
            this.parseOptions();
        }

        let dmChange: boolean = false;
        if (changes.hasOwnProperty("defaultMonth")) {
            let dm: any = changes["defaultMonth"].currentValue;
            if (typeof dm === "object") {
                dm = dm.defMonth;
            }
            if (dm !== null && dm !== undefined && dm !== "") {
                this.selectedMonth = this.parseSelectedMonth(dm);
            }
            else {
                this.selectedMonth = {monthTxt: "", monthNbr: 0, year: 0};
            }
            dmChange = true;
        }

        if (changes.hasOwnProperty("selDateRange")) {
            let sdr: any = changes["selDateRange"];
            if (sdr.currentValue !== null && sdr.currentValue !== undefined && sdr.currentValue !== "") {
                if (typeof sdr.currentValue === "string") {
                    let split: Array<string> = sdr.currentValue.split(" - ");
                    this.beginDate = this.parseSelectedDate(split[0]);
                    this.endDate = this.parseSelectedDate(split[1]);
                    this.selectionDayTxt = sdr.currentValue;
                }
                else if (typeof sdr.currentValue === "object") {
                    this.beginDate = this.parseSelectedDate(sdr.currentValue["beginDate"]);
                    this.endDate = this.parseSelectedDate(sdr.currentValue["endDate"]);
                    this.selectionDayTxt = this.formatDate(this.beginDate) + " - " + this.formatDate(this.endDate);
                }
                this.titleAreaText = this.selectionDayTxt;
                setTimeout(() => {
                    this.onChangeCb(this.getDateRangeModel(this.beginDate, this.endDate));
                });
                this.toBeginDate();
            }
            else {
                // Do not clear on init
                if (!sdr.isFirstChange()) {
                    this.clearDateRange();
                }
            }
        }
        if (this.visibleMonth.year === 0 && this.visibleMonth.monthNbr === 0 || dmChange) {
            this.setVisibleMonth();
        }
        else {
            this.visibleMonth.monthTxt = this.opts.monthLabels[this.visibleMonth.monthNbr];
            this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year, false);
        }
    }

    removeBtnClicked(): void {
        this.clearDateRange();
    }

    openBtnClicked(): void {
        this.showSelector = !this.showSelector;
        this.cdr.detectChanges();
        if (this.showSelector) {
            this.setVisibleMonth();
        }
    }

    setVisibleMonth(): void {
        if (this.drus.isInitializedDate(this.beginDate)) {
            this.toBeginDate();
        }
        else {
            let y: number = 0, m: number = 0;
            if (this.selectedMonth.year === 0 && this.selectedMonth.monthNbr === 0) {
                let today: IMyDate = this.getToday();
                y = today.year;
                m = today.month;
            } else {
                y = this.selectedMonth.year;
                m = this.selectedMonth.monthNbr;
            }
            this.visibleMonth = {monthTxt: this.opts.monthLabels[m], monthNbr: m, year: y};
            this.generateCalendar(m, y, true);
        }
    }

    onPrevMonth(): void {
        let d: Date = this.getDate({year: this.visibleMonth.year, month: this.visibleMonth.monthNbr, day: 1});
        d.setMonth(d.getMonth() - 1);

        let y: number = d.getFullYear();
        let m: number = d.getMonth() + 1;

        this.visibleMonth = {monthTxt: this.monthText(m), monthNbr: m, year: y};
        this.generateCalendar(m, y, true);
    }

    onNextMonth(): void {
        let d: Date = this.getDate({year: this.visibleMonth.year, month: this.visibleMonth.monthNbr, day: 1});
        d.setMonth(d.getMonth() + 1);

        let y: number = d.getFullYear();
        let m: number = d.getMonth() + 1;

        this.visibleMonth = {monthTxt: this.monthText(m), monthNbr: m, year: y};
        this.generateCalendar(m, y, true);
    }

    onPrevYear(): void {
        if (this.visibleMonth.year - 1 < this.opts.minYear) {
            return;
        }
        this.visibleMonth.year--;
        this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year, true);
    }

    onNextYear(): void {
        if (this.visibleMonth.year + 1 > this.opts.maxYear) {
            return;
        }
        this.visibleMonth.year++;
        this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year, true);
    }

    clearRangeValues(): void {
        // Clear button selected
        this.invalidDateRange = false;
        this.selectionDayTxt = "";
        this.beginDate = {year: 0, month: 0, day: 0};
        this.endDate = {year: 0, month: 0, day: 0};
        this.titleAreaText = this.opts.selectBeginDateTxt;
        this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year, false);
    }

    onCellClicked(cell: any): void {
        // Cell clicked in the selector
        let bi: boolean = this.drus.isInitializedDate(this.beginDate);
        let ei: boolean = this.drus.isInitializedDate(this.endDate);
        if (ei) {
            this.beginDate = {year: 0, month: 0, day: 0};
            this.endDate = {year: 0, month: 0, day: 0};
            this.titleAreaText = this.opts.selectBeginDateTxt;
            bi = false;
            ei = false;
        }
        if (!ei) {
            if (!bi || bi && this.drus.getTimeInMilliseconds(cell.dateObj) < this.drus.getTimeInMilliseconds(this.beginDate)) {
                this.selectBeginDate(cell.dateObj);
                this.titleAreaText = this.formatDate(cell.dateObj) + " - " + this.opts.selectEndDateTxt;
            }
            else if (this.drus.getTimeInMilliseconds(cell.dateObj) >= this.drus.getTimeInMilliseconds(this.beginDate)) {
                this.selectEndDate(cell.dateObj);
                this.rangeSelected();
                this.titleAreaText = this.formatDate(this.beginDate) + " - " + this.formatDate(cell.dateObj);
            }
        }
    }

    selectBeginDate(date: IMyDate): void {
        this.beginDate = date;
        let formatted: string = this.formatDate(date);
        this.titleAreaText = formatted + " - " + this.opts.selectEndDateTxt;
        this.dateSelected.emit({type: 1, date: date, formatted: formatted, jsdate: this.getDate(date)});
    }

    selectEndDate(date: IMyDate): void {
        this.endDate = date;
        let formatted: string = this.formatDate(date);
        this.titleAreaText = this.formatDate(this.beginDate) + " - " + formatted;
        this.dateSelected.emit({type: 2, date: date, formatted: formatted, jsdate: this.getDate(date)});
    }

    onCellKeyDown(event: any, cell: any): void {
        if ((event.keyCode === KeyCode.enter || event.keyCode === KeyCode.space) && !cell.disabled) {
            event.preventDefault();
            this.onCellClicked(cell);
        }
    }

    onCellMouseEnter(cell: any): void {
        if (this.drus.isInitializedDate(this.beginDate) && !this.drus.isInitializedDate(this.endDate)) {
            for (let w of this.dates) {
                for (let day of w.week) {
                    day.range = this.drus.getTimeInMilliseconds(day.dateObj) >= this.drus.getTimeInMilliseconds(this.beginDate)
                        && this.drus.getTimeInMilliseconds(day.dateObj) <= this.drus.getTimeInMilliseconds(cell.dateObj);
                }
            }
        }
    }

    onCellMouseLeave(): void {
        for (let w of this.dates) {
            for (let day of w.week) {
                day.range = false;
            }
        }
    }

    toBeginDate(): void {
        // To begin date clicked
        let viewChange: boolean = this.beginDate.year !== this.visibleMonth.year || this.beginDate.month !== this.visibleMonth.monthNbr;
        this.visibleMonth = {monthTxt: this.monthText(this.beginDate.month), monthNbr: this.beginDate.month, year: this.beginDate.year};
        this.generateCalendar(this.beginDate.month, this.beginDate.year, viewChange);
    }

    clearDateRange(): void {
        if (this.drus.isInitializedDate(this.endDate)) {
            this.dateRangeChanged.emit({beginDate: {year: 0, month: 0, day: 0}, beginJsDate: null, endDate: {year: 0, month: 0, day: 0}, endJsDate: null, formatted: "", beginEpoc: 0, endEpoc: 0});
            if (this.selectionDayTxt !== "") {
                this.inputFieldChanged.emit({value: "", dateRangeFormat: this.dateRangeFormat, valid: false});
            }
            this.onChangeCb(null);
            this.onTouchedCb();
        }
        this.clearRangeValues();
    }

    rangeSelected(): void {
        // Accept button clicked
        let dateRangeModel: IMyDateRangeModel = this.getDateRangeModel(this.beginDate, this.endDate);
        this.selectionDayTxt = this.formatDate(this.beginDate) + " - " + this.formatDate(this.endDate);
        this.showSelector = false;
        this.dateRangeChanged.emit(dateRangeModel);
        this.inputFieldChanged.emit({value: this.selectionDayTxt, dateRangeFormat: this.dateRangeFormat, valid: true});
        this.onChangeCb(dateRangeModel);
        this.onTouchedCb();
        this.invalidDateRange = false;
        if (this.opts.monthSelector || this.opts.yearSelector) {
            this.resetMonthYearSelect();
        }
    }

    getDateRangeModel(beginDate: IMyDate, endDate: IMyDate): IMyDateRangeModel {
        // Creates a date range model object from the given parameters
        let bEpoc: number = this.drus.getTimeInMilliseconds(beginDate) / 1000.0;
        let eEpoc: number = this.drus.getTimeInMilliseconds(endDate) / 1000.0;
        return {beginDate: beginDate, beginJsDate: this.getDate(beginDate), endDate: endDate, endJsDate: this.getDate(endDate), formatted: this.formatDate(beginDate) + " - " + this.formatDate(endDate), beginEpoc: bEpoc, endEpoc: eEpoc};
    }

    isInRange(val: any): boolean {
        // Check is input date in range between the beginDate and the endDate
        if (!this.drus.isInitializedDate(this.beginDate) || !this.drus.isInitializedDate(this.endDate)) {
            return false;
        }

        let input: number = this.drus.getTimeInMilliseconds(val.dateObj);
        if (input >= this.drus.getTimeInMilliseconds(this.beginDate) && input <= this.drus.getTimeInMilliseconds(this.endDate)) {
            return true;
        }
        return false;
    }

    isRangeSelected(): boolean {
        // Check is both beginDate and the endDate selected
        if (this.drus.isInitializedDate(this.beginDate) && this.drus.isInitializedDate(this.endDate)) {
            return true;
        }
        return false;
    }

    preZero(val: string): string {
        // Prepend zero if smaller than 10
        return parseInt(val) < 10 ? "0" + val : val;
    }

    formatDate(val: any): string {
        // Returns formatted date string, if mmm is part of dateFormat returns month as a string
        let formatted: string = this.opts.dateFormat.replace("yyyy", val.year).replace("dd", this.preZero(val.day));
        return this.opts.dateFormat.indexOf("mmm") !== -1 ? formatted.replace("mmm", this.monthText(val.month)) : formatted.replace("mm", this.preZero(val.month));
    }

    monthText(m: number): string {
        // Returns month as a text
        return this.opts.monthLabels[m];
    }

    monthStartIdx(y: number, m: number): number {
        // Month start index
        let d: Date = new Date();
        d.setDate(1);
        d.setMonth(m - 1);
        d.setFullYear(y);
        let idx = d.getDay() + this.sundayIdx();
        return idx >= 7 ? idx - 7 : idx;
    }

    daysInMonth(m: number, y: number): number {
        // Return number of days of current month
        return new Date(y, m, 0).getDate();
    }

    daysInPrevMonth(m: number, y: number): number {
        let d: Date = this.getDate({year: y, month: m, day: 1});
        d.setMonth(d.getMonth() - 1);
        return this.daysInMonth(d.getMonth() + 1, d.getFullYear());
    }

    isCurrDay(d: number, m: number, y: number, cmo: number, today: IMyDate): boolean {
        // Check is a given date the current date
        return d === today.day && m === today.month && y === today.year && cmo === this.currMonthId;
    }

    getPreviousDate(date: IMyDate): IMyDate {
        // Get previous date from the given date
        let d: Date = this.getDate(date);
        d.setDate(d.getDate() - 1);
        return {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate()};
    }

    getNextDate(date: IMyDate): IMyDate {
        // Get next date from the given date
        let d: Date = this.getDate(date);
        d.setDate(d.getDate() + 1);
        return {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate()};
    }

    getDayNumber(date: IMyDate): number {
        // Get day number: sun=0, mon=1, tue=2, wed=3 ...
        let d: Date = this.getDate(date);
        return d.getDay();
    }

    getWeekday(date: IMyDate): string {
        // Get weekday: su, mo, tu, we ...
        return this.weekDayOpts[this.getDayNumber(date)];
    }

    getDate(date: IMyDate): Date {
        return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    }

    getToday(): IMyDate {
        let date: Date = new Date();
        return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
    }

    sundayIdx(): number {
        // Index of Sunday day
        return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
    }

    generateCalendar(m: number, y: number, viewChange: boolean): void {
        this.dates.length = 0;
        let today: IMyDate = this.getToday();
        let monthStart: number = this.monthStartIdx(y, m);
        let dInThisM: number = this.daysInMonth(m, y);
        let dInPrevM: number = this.daysInPrevMonth(m, y);

        let dayNbr: number = 1;
        let cmo: number = this.prevMonthId;
        for (let i = 1; i < 7; i++) {
            let week: Array<IMyCalendarDay> = [];
            if (i === 1) {
                // First week
                let pm: number = dInPrevM - monthStart + 1;
                // Previous month
                for (let j = pm; j <= dInPrevM; j++) {
                    let date: IMyDate = {year: m === 1 ? y - 1 : y, month: m === 1 ? 12 : m - 1, day: j};
                    week.push({dateObj: date,
                        cmo: cmo, currDay: this.isCurrDay(j, m, y, cmo, today),
                        dayNbr: this.getDayNumber(date),
                        disabled: this.drus.isDisabledDay(date, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableDates, this.opts.disableDateRanges, this.opts.enableDates),
                        range: false});
                }
                cmo = this.currMonthId;
                // Current month
                let daysLeft: number = 7 - week.length;
                for (let j = 0; j < daysLeft; j++) {
                    let date: IMyDate = {year: y, month: m, day: dayNbr};
                    week.push({dateObj: date,
                        cmo: cmo,
                        currDay: this.isCurrDay(dayNbr, m, y, cmo, today),
                        dayNbr: this.getDayNumber(date),
                        disabled: this.drus.isDisabledDay(date, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableDates, this.opts.disableDateRanges, this.opts.enableDates),
                        range: false});
                    dayNbr++;
                }
            }
            else {
                // Rest of the weeks
                for (let j = 1; j < 8; j++) {
                    if (dayNbr > dInThisM) {
                        // Next month
                        dayNbr = 1;
                        cmo = this.nextMonthId;
                    }
                    let date: IMyDate = {year: cmo === this.nextMonthId && m === 12 ? y + 1 : y, month: cmo === this.currMonthId ? m : cmo === this.nextMonthId && m < 12 ? m + 1 : 1, day: dayNbr};
                    week.push({dateObj: date,
                        cmo: cmo,
                        currDay: this.isCurrDay(dayNbr, m, y, cmo, today),
                        dayNbr: this.getDayNumber(date),
                        disabled: this.drus.isDisabledDay(date, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableDates, this.opts.disableDateRanges, this.opts.enableDates),
                        range: false});
                    dayNbr++;
                }
            }
            let weekNbr: number = this.opts.showWeekNumbers  && this.opts.firstDayOfWeek === "mo" ? this.drus.getWeekNumber(week[0].dateObj) : 0;
            this.dates.push({week: week, weekNbr: weekNbr});
        }

        this.setHeaderBtnDisabledState(m, y);

        if (viewChange) {
            // Notify parent
            this.calendarViewChanged.emit({year: y, month: m, first: {number: 1, weekday: this.getWeekday({year: y, month: m, day: 1})}, last: {number: dInThisM, weekday: this.getWeekday({year: y, month: m, day: dInThisM})}});
        }
    }

    setHeaderBtnDisabledState(m: number, y: number): void {
        let dpm: boolean = false;
        let dpy: boolean = false;
        let dnm: boolean = false;
        let dny: boolean = false;
        if (this.opts.disableHeaderButtons) {
            dpm = this.drus.isMonthDisabledByDisableUntil({year: m === 1 ? y - 1 : y, month: m === 1 ? 12 : m - 1, day: this.daysInMonth(m === 1 ? 12 : m - 1, m === 1 ? y - 1 : y)}, this.opts.disableUntil);
            dpy = this.drus.isMonthDisabledByDisableUntil({year: y - 1, month: m, day: this.daysInMonth(m, y - 1)}, this.opts.disableUntil);
            dnm = this.drus.isMonthDisabledByDisableSince({year: m === 12 ? y + 1 : y, month: m === 12 ? 1 : m + 1, day: 1}, this.opts.disableSince);
            dny = this.drus.isMonthDisabledByDisableSince({year: y + 1, month: m, day: 1}, this.opts.disableSince);
        }
        this.prevMonthDisabled = m === 1 && y === this.opts.minYear || dpm;
        this.prevYearDisabled = y - 1 < this.opts.minYear || dpy;
        this.nextMonthDisabled = m === 12 && y === this.opts.maxYear || dnm;
        this.nextYearDisabled = y + 1 > this.opts.maxYear || dny;
    }

    parseSelectedDate(selDate: any): IMyDate {
        // Parse selDate value - it can be string or IMyDate object
        let date: IMyDate = {day: 0, month: 0, year: 0};
        if (typeof selDate === "string") {
            let sd: string = <string>selDate;
            date.day = this.drus.parseDatePartNumber(this.opts.dateFormat, sd, "dd");

            date.month = this.opts.dateFormat.indexOf("mmm") !== -1
                ? this.drus.parseDatePartMonthName(this.opts.dateFormat, sd, "mmm", this.opts.monthLabels)
                : this.drus.parseDatePartNumber(this.opts.dateFormat, sd, "mm");

            date.year = this.drus.parseDatePartNumber(this.opts.dateFormat, sd, "yyyy");
        }
        else if (typeof selDate === "object") {
            date = selDate;
        }
        return date;
    }

    parseSelectedMonth(ms: string): IMyMonth {
        return this.drus.parseDefaultMonth(ms);
    }
}
