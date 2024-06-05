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
      formControlValue?: any, 
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

    setRequired(required: boolean) {
      this.required = required;
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
    isMultiple : boolean = true;

    constructor(fieldValueList, isMultiple : boolean, key: FieldName, fieldSize?: FieldSize, formControlValue?: any,  readOnly : boolean = false){
        super(key, fieldSize, formControlValue, readOnly);
        this.fieldValueList = fieldValueList;
        this.isMultiple = isMultiple;
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
    COPYAL = "COPYAL",
    LOANAL = "LOANAL",
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
    LTR = "LTR",
}

interface selectedFieldValue {
    value: string;
    viewValue: string;
  }

export class SelectedSearchFieldValues {
    regionCodeList: selectedFieldValue[] = [
      { value: '01', viewValue: '1 北海道' },
      { value: '02,03,04,05,06,07', viewValue: '2 東北' },
      { value: '08,09,10,11,12,14', viewValue: '3 関東（東京都を除く）' },
      { value: '08,09,10,11,12,13,14', viewValue: '4 関東（東京都を含む）' },
      { value: '15,16,17,18,19,20', viewValue: '5 甲信越・北陸' },
      { value: '21,22,23,24', viewValue: '6 東海' },
      { value: '25,26,27,28,29,30', viewValue: '7 関西' },
      { value: '31,32,33,34,35,36,37,38,39', viewValue: '8 中国・四国' },
      { value: '40,41,42,43,44,45,46,47', viewValue: '9 九州・沖縄' },
        { value: '01', viewValue: '01 北海道' },
        { value: '02', viewValue: '02 青森' },
        { value: '03', viewValue: '03 岩手' },
        { value: '04', viewValue: '04 宮城' },
        { value: '05', viewValue: '05 秋田' },
        { value: '06', viewValue: '06 山形' },
        { value: '07', viewValue: '07 福島' },
        { value: '08', viewValue: '08 茨城' },
        { value: '09', viewValue: '09 栃木' },
        { value: '10', viewValue: '10 群馬' },
        { value: '11', viewValue: '11 埼玉' },
        { value: '12', viewValue: '12 千葉' },
        { value: '13', viewValue: '13 東京' },
        { value: '14', viewValue: '14 神奈川' },
        { value: '15', viewValue: '15 新潟' },
        { value: '16', viewValue: '16 富山' },
        { value: '17', viewValue: '17 石川' },
        { value: '18', viewValue: '18 福井' },
        { value: '19', viewValue: '19 山梨' },
        { value: '20', viewValue: '20 長野' },
        { value: '21', viewValue: '21 岐阜' },
        { value: '22', viewValue: '22 静岡' },
        { value: '23', viewValue: '23 愛知' },
        { value: '24', viewValue: '24 三重' },
        { value: '25', viewValue: '25 滋賀' },
        { value: '26', viewValue: '26 京都' },
        { value: '27', viewValue: '27 大阪' },
        { value: '28', viewValue: '28 兵庫' },
        { value: '29', viewValue: '29 奈良' },
        { value: '30', viewValue: '30 和歌山' },
        { value: '31', viewValue: '31 鳥取' },
        { value: '32', viewValue: '32 島根' },
        { value: '33', viewValue: '33 岡山' },
        { value: '34', viewValue: '34 広島' },
        { value: '35', viewValue: '35 山口' },
        { value: '36', viewValue: '36 徳島' },
        { value: '37', viewValue: '37 香川' },
        { value: '38', viewValue: '38 愛媛' },
        { value: '39', viewValue: '39 高知' },
        { value: '40', viewValue: '40 福岡' },
        { value: '41', viewValue: '41 佐賀' },
        { value: '42', viewValue: '42 長崎' },
        { value: '43', viewValue: '43 熊本' },
        { value: '44', viewValue: '44 大分' },
        { value: '45', viewValue: '45 宮崎' },
        { value: '46', viewValue: '46 鹿児島' },
        { value: '47', viewValue: '47 沖縄' },
        { value: 'なし', viewValue:  'なし 全国' }
    ];
    getRegionCodeList() {
        return this.regionCodeList;
    }
  
    establisherTypeList: selectedFieldValue[] = [
      { value: '9', viewValue: 'ILL.OptionViewValue.SETCODE.Other' },
      { value: '1', viewValue: 'ILL.OptionViewValue.SETCODE.National' },
      { value: '2', viewValue: 'ILL.OptionViewValue.SETCODE.Public' },
      { value: '3', viewValue: 'ILL.OptionViewValue.SETCODE.Private' },
      { value: '4', viewValue: 'ILL.OptionViewValue.SETCODE.SpecialPublicCorporation' },
      { value: '5', viewValue: 'ILL.OptionViewValue.SETCODE.Overseas' },
      { value: '8', viewValue: 'ILL.OptionViewValue.SETCODE.TrainingTesting' }
    ];

    getEstablisherTypeList() {
        return this.establisherTypeList;
    }

    institutionTypeList: selectedFieldValue[] = [
      { value: '9', viewValue: 'ILL.OptionViewValue.ORGCODE.Other' },
        { value: '1', viewValue: 'ILL.OptionViewValue.ORGCODE.University' },
        { value: '2', viewValue: 'ILL.OptionViewValue.ORGCODE.JuniorCollege' },
        { value: '3', viewValue: 'ILL.OptionViewValue.ORGCODE.CollegeOfTechnology' },
        { value: '4', viewValue: 'ILL.OptionViewValue.ORGCODE.InterResearchInstitutes' },
        { value: '5', viewValue: 'ILL.OptionViewValue.ORGCODE.FacilitiesOfOtherMinistries' },
        { value: '8', viewValue: 'ILL.OptionViewValue.ORGCODE.TrainingTesting' }
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

export let danceCharacters = /[\u0027\u002D\u2010\u2014\u25C6]/g;
export let charactersToRemoveForAKEY = /[\u0027\u002D\u2010\u2014\u25C6\u3005\u309B\u309C\u309D\u309E\u30FC\u30FD\u30FE]/g;
export let delimiters = /[\u0020\u0021\u0022\u0023\u0024\u0025\u0026\u0028\u0029\u002A\u002B\u002C\u002E\u002F\u003A\u003B\u003C\u003D\u003E\u003F\u0040\u005B\u005C\u005D\u005E\u005F\u0060\u007B\u007C\u007D\u00A1\u00A2\u00A3\u00A4\u00A5\u00A6\u00A7\u00A8\u00AB\u00AC\u00B0\u00B1\u00B4\u00B5\u00B6\u00BB\u00BF\u00D7\u00F7\u060C\u061B\u061F\u066A\u066D\u06D4\u0964\u0965\u09E4\u09E5\u0A64\u0A65\u0AE4\u0AE5\u0B64\u0B65\u0BE4\u0BE5\u0C64\u0C65\u0CE4\u0CE5\u0D64\u0D65\u0F0D\u0F0E\u0F0F\u0F10\u0F11\u0F12\u104A\u1B5E\u1B5F\u2016\u2018\u201C\u2020\u2021\u2025\u2026\u2030\u203B\u203E\u2103\u212B\u2190\u2191\u2192\u2193\u21D2\u21D4\u2200\u2202\u2203\u2207\u2208\u220B\u220F\u221A\u221D\u221E\u2220\u2227\u2228\u2229\u222A\u222B\u222C\u2234\u2235\u223D\u2252\u2260\u2261\u2266\u2267\u226A\u226B\u2282\u2283\u2286\u2287\u22A5\u2312\u2500\u2501\u2502\u2503\u250C\u250F\u2510\u2513\u2514\u2517\u2518\u251B\u251E\u251F\u2522\u2523\u2526\u2527\u252A\u252B\u252E\u252F\u2532\u2533\u2536\u2537\u253A\u253B\u253E\u253F\u254A\u254B\u2550\u2551\u2554\u2557\u255A\u255D\u2560\u2563\u2566\u2569\u256C\u256F\u2572\u2573\u2580\u2584\u2588\u258C\u2590\u2591\u2592\u2593\u25A0\u25A1\u25B2\u25B3\u25BC\u25BD\u25C7\u25CB\u25CE\u25CF\u25EF\u2605\u2606\u2640\u2642\u266A\u266D\u266F\u3001\u3002\u3003\u3006\u3008\u3009\u300A\u300B\u300C\u300D\u300E\u300F\u3010\u3011\u3012\u3013\u3014\u3015\u301C\u30FB\u4EDD\uA876\uA877\uA8CE\uA8CF\uAA5D\uAA5E\uAA5F\uABEB\u10A56\u10A57\u11047\u11048\u110C0\u110C1\u00C5]/g;
export let stopWords = ['a',
  'ac',
  'af',
  'al',
  'ale',
  'als',
  'am',
  'among',
  'an',
  'and',
  'ans',
  'as',
  'at',
  'au',
  'auf',
  'aufs',
  'aus',
  'aux',
  'av',
  'avec',
  'before',
  'bei',
  'beim',
  'between',
  'by',
  'con',
  'da',
  'dans',
  'das',
  'de',
  'degli',
  'dei',
  'del',
  'della',
  'delle',
  'dello',
  'dem',
  'den',
  'der',
  'des',
  'det',
  'di',
  'die',
  'din',
  'do',
  'du',
  'durch',
  'durchs',
  'e',
  'ein',
  'eine',
  'einem',
  'einer',
  'el',
  'em',
  'en',
  'entre',
  'es',
  'et',
  'etc',
  'for',
  'fra',
  'fur',
  'het',
  'i',
  'il',
  'im',
  'in',
  'ins',
  'into',
  'iz',
  'ja',
  'la',
  'las',
  'le',
  'les',
  'lo',
  'los',
  'mit',
  'na',
  'nach',
  'o',
  'och',
  'oder',
  'of',
  'og',
  'om',
  'on',
  'op',
  'or',
  'ou',
  'over',
  'para',
  'per',
  'po',
  'por',
  'pour',
  'pri',
  'si',
  'sur',
  'te',
  'the',
  'to',
  'u',
  'uber',
  'un',
  'und',
  'une',
  'upon',
  'v',
  'van',
  've',
  'ved',
  'von',
  'voor',
  'with',
  'y',
  'z',
  'zu',
  'zum',
  'zur'];