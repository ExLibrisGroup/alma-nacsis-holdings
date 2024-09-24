export abstract class BaseUtil {
    isEmpty(val) {
        return (val === undefined || val == null || val.length <= 0) ? true : false;
    }

    isObjectEmpty(obj) {
        return obj === undefined || obj === null || JSON.stringify(obj) === '"{}"';
    }

    map2Json(map) {
        let jsonObject = {};
        map.forEach((value, key) => {
        jsonObject[key] = value;
        });
        return JSON.stringify(jsonObject);
    }

    Json2Map(jsonObject) {
        let map = new Map();
        jsonObject = JSON.parse(jsonObject);
        for (var value in jsonObject) {
        map.set(value, jsonObject[value]);
        }
        return map;
    }
}

export enum QueryParams {
    PageIndex = "pageIndex",
    PageSize = "pageSize",
    SearchType = "searchType",
    Databases = "dataBase",
    ID = "ID"
  }
  