export default function queryBuilder (query) {
  let str = "";
  if (query.filter || query.sort) {
    if (query.page) {
      str = "?page=" + query.page + "&";
    } else {
      str = "?page=1&";
    }
    if (query.filter) {
      for (let item in query.filter) {
        if (query.filter[item]) {
          str += "filter[" + item + "]=" + query.filter[item] + "&";
        }
      }
    }
    if (str != "?") {
      str = str.substr(0, str.length - 1);
    }
    if (query.sort) {
      let sort = "&sort=";
      for (let item in query.sort) {
        if (query.sort[item] && query.sort[item] > 0) {
          sort += item + ",";
        } else if (query.sort[item] && query.sort[item] < 0) {
          sort += "-" + item + ",";
        }
      }
      if (sort != "sort=") {
        sort = sort.substr(0, sort.length - 1);
        str += sort;
      }
    }

    if (str == "?page=1&") {
      str = "";
    }
  }
  return str;
}
