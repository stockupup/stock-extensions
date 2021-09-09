import axios from "axios";

function isOperation() {
  var today = new Date();

  var day = today.getDay();
  if (day == 0 || day == 6) return false;

  var hour = today.getHours();
  var minute = today.getMinutes();
  var time = hour * 100 + minute;

  if ((time > 920 && time < 1135) || (time > 1255 && time < 1505)) {
    return true;
  }

  return false;
}

async function getStockInfo(arr) {
  let list = arr.map(e => e.stock_code).join(",");
  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      url: "https://hq.sinajs.cn",
      params: { list: list }
    })
      .then(data => {
        var stockInfo = undefined;
        var stockListArray = data.data.split(";");
        for (var i = 0; i < stockListArray.length; i++) {
          var elements = stockListArray[i].split(/_|="|,|"/);
          if (elements.length > 5) {
            try {
              stockInfo = {
                stockOpenPrice: parseFloat(elements[4]).toFixed(2),
                stockClosePrice: parseFloat(elements[5]).toFixed(2),
                stockCurrPrice: parseFloat(elements[6]).toFixed(2),
                stockMaxPrice: parseFloat(elements[7]).toFixed(2),
                stockMinPrice: parseFloat(elements[8]).toFixed(2),
                stockVolume: (parseInt(elements[11]) / 100).toFixed(),
                stockTurnover: (parseInt(elements[12]) / 10000).toFixed(),
                stockLastDate: elements[33],
                stockLastTime: elements[34],
                stockChangeAmt: "0.00",
                stockChangeRate: "0.00"
              };

              if (stockInfo.stockOpenPrice != 0) {
                stockInfo.stockChangeAmt = parseFloat(
                  stockInfo.stockCurrPrice - stockInfo.stockClosePrice
                ).toFixed(2);
                stockInfo.stockChangeRate = (
                  parseFloat(
                    stockInfo.stockChangeAmt / stockInfo.stockClosePrice
                  ) * 100
                ).toFixed(2);
              }

              arr[i].stockName = elements[3];

              arr[i].stockInfo = stockInfo;

              // arr[i].profit = (stockInfo.stockChangeAmt * arr[i].trans).toFixed(
              //   2
              // );
            } catch (e) {
              console.error(e);
              reject(e);
            }
          }
        }

        resolve(arr);
      })
      .catch(error => {
        console.log(error);
      });
  });
}

export default { getStockInfo, isOperation };
