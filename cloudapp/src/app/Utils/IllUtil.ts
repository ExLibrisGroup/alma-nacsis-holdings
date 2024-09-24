import { BaseUtil } from "./baseUtil";
import { Injectable } from '@angular/core';
@Injectable({
  providedIn:'root'
})
export class IllUtil extends BaseUtil {
  
  regionCodeList: string[] = [
    '01 北海道', '02 青森', '03 岩手', '04 宮城', '05 秋田', '06 山形',
    '07 福島', '08 茨城', '09 栃木', '10 群馬', '11 埼玉', '12 千葉',
    '13 東京', '14 神奈川', '15 新潟', '16 富山', '17 石川', '18 福井',
    '19 山梨', '20 長野', '21 岐阜', '22 静岡', '23 愛知', '24 三重',
    '25 滋賀', '26 京都', '27 大阪', '28 兵庫', '29 奈良', '30 和歌山',
    '31 鳥取', '32 島根', '33 岡山', '34 広島', '35 山口', '36 徳島',
    '37 香川', '38 愛媛', '39 高知', '40 福岡', '41 佐賀', '42 長崎',
    '43 熊本', '44 大分', '45 宮崎', '46 鹿児島', '47 沖縄', 'なし 全国'
  ];
  

  establisherTypeResult: string[] = [
    '1 国立', '2 公立', '3 私立', '4 特殊法人', '5 海外', '8 研修・テスト用', '9 その他'
  ];
  institutionTypeResult: string[] = [
    '1 大学', '2 短期大学', '3 高等専門学校', '4 大学共同利用機関等', '5 他省庁の施設機関等', '8 研修・テスト用', '9 その他'
  ];
  iLLParticipationTypeResult: string[] = [
    'A 参加', 'N 未参加'
  ];

  copyServiceTypeResult: string[] = [
    'A 受け付ける', 'N 受け付けない', 'C 他の窓口で受け付ける'
  ];

  fAXServiceTypeResult: string[] = [
    'A サービス可', 'N サービス不可', 'C 条件付でサービス可'
  ];

  offsetCodeTypeResult: string[] = [
    'N ILL文献複写等料金相殺サービス参加'
  ];
}