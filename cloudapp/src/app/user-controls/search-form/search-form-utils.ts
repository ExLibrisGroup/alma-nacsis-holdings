import { FormControl } from "@angular/forms";


export enum SearchType {
    Monographs = "Monographs",
    Serials = "Serials",
    Names = "Names",
    UniformTitles = "UniformTitles",
    Members = "Members"
}

export enum SearchFieldTypes {
  input = "input",
  select = "select",
  multi = "multi"
}

export class SearchField {

    key: FieldName;
    fieldLabel: string;
    formControl: FormControl;
    fieldLength: FieldSize = FieldSize.fullWidth;
    readOnly : boolean = false;
    required: boolean = false;


    constructor(
      key: FieldName, 
      fieldSize?: FieldSize, 
      formControlValue?: string, 
      readOnly: boolean = false,
      required?: boolean){
        this.key = key;
        this.fieldLength = fieldSize;
        this.formControl = new FormControl();
        this.formControl.setValue(formControlValue);
        this.readOnly = readOnly;
        this.required = required;
    }


    getKey(): string {
        return this.key;
    }

    getReadOnly(): boolean {
      return this.readOnly;
    }

    setReadOnly(isReadOnly: boolean) {
      this.readOnly = isReadOnly;
    }

    getFieldLabel(): string {
        this.fieldLabel = "UserControls.Fields." + this.key;
        return this.fieldLabel;
    }

    getFormControl(): FormControl {
        return this.formControl;
    }

    setFormControl(data: string) {
        this.formControl.setValue(data);
    }

    getFieldLength(): string {
        return this.fieldLength;
    }

    setFieldLength(size: FieldSize) {
        this.fieldLength = size;
    }

    isRequired() {
      return this.required;
    }

    copyField(copyFormControlValues: boolean): SearchField {
        let newField;
        if (copyFormControlValues) {
            newField = new SearchField(this.key, this.fieldLength, this.formControl.value, this.readOnly, this.required);
        } else {
            newField = new SearchField(this.key, this.fieldLength, null, this.readOnly, this.required);
        }
        return newField;
    }
}

export class SelectSearchField extends SearchField {
    fieldValueList: any[];

    constructor(fieldValueList, key: FieldName, fieldSize?: FieldSize, formControlValue?: string, readOnly : boolean = false){
        super(key, fieldSize, formControlValue, readOnly);
        this.fieldValueList = fieldValueList;
    }

    getFieldValueList(): any[] {
        return this.fieldValueList;
    }

}

export class MultiSearchField extends SearchField {
    minOccurrence: number;
    maxOccurrence: number;
    fieldsArr: Array<Array<SearchField>>;

    constructor(
      fieldsArr: Array<Array<SearchField>>, 
      minOccurrence?: number, 
      maxOccurrence?: number) {
        super(null, FieldSize.fullWidth);
        this.fieldsArr = fieldsArr;
        this.minOccurrence = minOccurrence;
        this.maxOccurrence = maxOccurrence;
    }

    getFieldsArray(): Array<Array<SearchField>> {
      return this.fieldsArr;
    }

    getMinOccurrence(): number {
      return this.minOccurrence;
    }

    getMaxOccurrence(): number {
      return this.maxOccurrence;
    }
}


export enum FieldSize {
    fullWidth = "form-feild-full-width",
    large = "form-field-half",
    medium = "form-field-third",
    small = "form-field-quarter"
}

export enum FieldName {
    TITLE = "TITLE",
    FTITLE = "FTITLE",
    PTBL = "PTBL",
    VOL = "VOL",
    AUTH = "AUTH",
    TitlePtblVol = "TitlePtblVol",
    NdlcnLccnOthn = "NdlcnLccnOthn",
    NdlpnLccn = "NdlpnLccn",
    ISSN = "ISSN",
    ISBN = "ISBN",
    NBN = "NBN",
    NDLCN = "NDLCN",
    PUB = "PUB",
    YEAR = "YEAR",
    PLACE = "PLACE",
    PLACEKEY = "PLACEKEY",
    CNTRY = "CNTRY",
    LANG = "LANG",
    SH = "SH",
    AKEY = "AKEY",
    ID = "ID",
    PID = "PID",
    CODEN = "CODEN",
    NDLPN = "NDLPN",
    LCCN = "LCCN",
    FID = "FID",
    DATE = "DATE",
    SAID = "SAID",
    FANO = "FANO",
    NAME = "NAME",
    CATFLG = "CATFLG",
    LOC = "LOC",
    KENCODE = "KENCODE",
    SETCODE = "SETCODE",
    ORGCODE = "ORGCODE",
    ILLFLG = "ILLFLG",
    STAT = "STAT",
    GRPCODE = "GRPCODE",
    COPYS = "COPYS",
    LOANS = "LOANS",
    FAXS = "FAXS",
    CATTEL = "CATTEL",
    CATDEPT = "CATDEPT",
    CATFAX = "CATFAX",
    SYSDEPT = "SYSDEPT",
    SYSTEL = "SYSTEL",
    SYSFAX = "SYSFAX",
    EMAIL = "EMAIL",
    POLICY = "POLICY",
    TEL = "TEL",
    FAX = "FAX",
    // Holdings fields
    CLN = "CLN",
    RGTN = "RGTN",
    CPYR = "CPYR",
    CPYNT = "CPYNT",
    LDF = "LDF",
    HLYR = "HLYR",
    HLV = "HLV",
    CONT = "CONT",
    LTR = "LTR"
}

interface selectedFieldValue {
    value: string;
    viewValue: string;
  }

export class SelectedSearchFieldValues {
    regionCodeList: selectedFieldValue[] = [
        { value: '01', viewValue: '01 北海道' },
        { value: '02', viewValue: '02 青森' },
        { value: '03', viewValue: '03 岩手' },
        { value: '04', viewValue: '04 宮城' },
        { value: '05', viewValue: '05 秋田' },
        { value: '06', viewValue:  '06 山形' },
        { value: '07', viewValue: '07 福島' },
        { value: '08', viewValue: '08 茨城' },
        { value: '09', viewValue: '09 栃木' },
        { value: '10', viewValue: '10 群馬' },
        { value: '11', viewValue: '11 埼玉' },
        { value: '12', viewValue: '12 千葉' },
        { value: '13', viewValue:  '13 東京' },
        { value: '14', viewValue: '14 神奈川' },
        { value: '15', viewValue: '15 新潟' },
        { value: '16', viewValue: '16 富山' },
        { value: '17', viewValue: '17 石川' },
        { value: '18', viewValue: '18 福井' },
        { value: '19', viewValue: '19 山梨' },
        { value: '20', viewValue:  '20 長野' },
        { value: '21', viewValue: '21 岐阜' },
        { value: '22', viewValue: '22 静岡' },
        { value: '23', viewValue: '23 愛知' },
        { value: '24', viewValue: '24 三重' },
        { value: '25', viewValue: '25 滋賀' },
        { value: '26', viewValue: '26 京都' },
        { value: '27', viewValue:  '27 大阪' },
        { value: '28', viewValue: '28 兵庫' },
        { value: '29', viewValue: '29 奈良' },
        { value: '30', viewValue: '30 和歌山' },
        { value: '31', viewValue: '31 鳥取' },
        { value: '32', viewValue: '32 島根' },
        { value: '33', viewValue: '33 岡山' },
        { value: '34', viewValue:  '34 広島' },
        { value: '35', viewValue: '35 山口' },
        { value: '36', viewValue: '36 徳島' },
        { value: '37', viewValue: '37 香川' },
        { value: '38', viewValue: '38 愛媛' },
        { value: '39', viewValue: '39 高知' },
        { value: '40', viewValue: '40 福岡' },
        { value: '41', viewValue:  '41 佐賀' },
        { value: '42', viewValue: '42 長崎' },
        { value: '43', viewValue: '43 熊本' },
        { value: '44', viewValue: '44 大分' },
        { value: '45', viewValue: '45 宮崎' },
        { value: '46', viewValue: '46 鹿児島' },
        { value: '47', viewValue: '47 沖縄' },
        { value:  'なし', viewValue:  'なし 全国' }
    ];
    getRegionCodeList() {
        return this.regionCodeList;
    }
  
    establisherTypeList: selectedFieldValue[] = [
      { value: '1', viewValue: 'ILL.OptionViewValue.SETCODE.National' },
      { value: '2', viewValue: 'ILL.OptionViewValue.SETCODE.Public' },
      { value: '3', viewValue: 'ILL.OptionViewValue.SETCODE.Private' },
      { value: '4', viewValue: 'ILL.OptionViewValue.SETCODE.SpecialPublicCorporation' },
      { value: '5', viewValue: 'ILL.OptionViewValue.SETCODE.Overseas' },
      { value: '8', viewValue: 'ILL.OptionViewValue.SETCODE.TrainingTesting' },
      { value: '9', viewValue: 'ILL.OptionViewValue.SETCODE.Other' }
    ];

    getEstablisherTypeList() {
        return this.establisherTypeList;
    }

    institutionTypeList: selectedFieldValue[] = [
        { value: '1', viewValue: 'ILL.OptionViewValue.ORGCODE.University' },
        { value: '2', viewValue: 'ILL.OptionViewValue.ORGCODE.JuniorCollege' },
        { value: '3', viewValue: 'ILL.OptionViewValue.ORGCODE.CollegeOfTechnology' },
        { value: '4', viewValue: 'ILL.OptionViewValue.ORGCODE.InterResearchInstitutes' },
        { value: '5', viewValue: 'ILL.OptionViewValue.ORGCODE.FacilitiesOfOtherMinistries' },
        { value: '8', viewValue: 'ILL.OptionViewValue.ORGCODE.TrainingTesting' },
        { value: '9', viewValue: 'ILL.OptionViewValue.ORGCODE.Other' }
    ];

    getInstitutionTypeList() {
        return this.institutionTypeList;
    }

  iLLParticipationTypeList: selectedFieldValue[] = [
    { value: 'A', viewValue: 'ILL.OptionViewValue.ILLFLG.Participate' },
    { value: 'N', viewValue: 'ILL.OptionViewValue.ILLFLG.DoNotParticipate' }
  ];

  getILLParticipationTypeList() {
    return this.iLLParticipationTypeList;
}

  serviceStatusList: selectedFieldValue[] = [
    { value: 'A', viewValue: 'ILL.OptionViewValue.STAT.Available' },
    { value: 'N', viewValue: 'ILL.OptionViewValue.STAT.NotAvailable' }
  ];

  getServiceStatusList() {
    return this.serviceStatusList;
}

  offsetChargeList: selectedFieldValue[] = [
    { value: 'N', viewValue: 'ILL.OptionViewValue.GRPCODE.ParticipateILLOffsetService' }
  ];

  getOffsetChargeList() {
    return this.offsetChargeList;
}

catalogingParticipationTypeList: selectedFieldValue[] = [
  { value: 'A', viewValue: 'ILL.OptionViewValue.ILLFLG.Participate' },
  { value: 'N', viewValue: 'ILL.OptionViewValue.ILLFLG.DoNotParticipate' }
];

getCatalogingParticipationTypeList() {
  return this.catalogingParticipationTypeList;
}



  copyServiceTypeList: selectedFieldValue[] = [
    { value: 'A', viewValue: 'ILL.OptionViewValue.COPYS.Accept' },
    { value: 'C', viewValue: 'ILL.OptionViewValue.COPYS.AcceptAtOtherCounters' },
    { value: 'N', viewValue: 'ILL.OptionViewValue.COPYS.NotAccepted' }
  ];

  getCopyServiceTypeList() {
    return this.copyServiceTypeList;
}

  lendingServiceTypeList: selectedFieldValue[] = [
    { value: 'A', viewValue: 'ILL.OptionViewValue.LOANS.Accept' },
    { value: 'C', viewValue: 'ILL.OptionViewValue.LOANS.AcceptAtOtherCounters' },
    { value: 'N', viewValue: 'ILL.OptionViewValue.LOANS.NotAccepted' }
  ];

  getLendingServiceTypeList() {
    return this.lendingServiceTypeList;
}

  fAXServiceTypeList: selectedFieldValue[] = [
    { value: 'A', viewValue: 'ILL.OptionViewValue.FAXS.Available' },
    { value: 'C', viewValue: 'ILL.OptionViewValue.FAXS.ConditionallyAvailable' },
    { value: 'N', viewValue: 'ILL.OptionViewValue.FAXS.NotAvailable' }
  ];

  getFAXServiceTypeList() {
    return this.fAXServiceTypeList;
}

  
  
  
}



