import axios from "axios";
import stock from "./stock";

/**
 * 设置徽章
 * @params
 * text: 徽章文本
 * color: 徽章颜色
 */
var setBadge = function(text, color) {
  chrome.browserAction.setBadgeText({ text });
  chrome.browserAction.setBadgeBackgroundColor({ color });
};

// setBadge("4396");

window.customList = [];

// async function getProfit(list) {
//   var total = 0;
//   await stock.getStockInfo(list);
//   for (let i = 0; i < list.length; i++) {
//     total += Number(list[i].profit);
//   }

//   console.log(total);
//   if (total >= 0) {
//     setBadge(total.toString(), [255, 102, 102, 255]);
//   } else {
//     setBadge(total.toString().slice(1), [51, 204, 0, 255]);
//   }
// }

function getCustomList() {
  var views = chrome.extension.getViews({ type: "popup" });
  if (views.length > 0) {
    return;
  }

  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      url: "http://47.241.69.206/api/v1/stock/query"
    })
      .then(data => {
        let temp = data.data.data;
        if (temp) {
          temp.forEach(item => {
            item.name = item.holder_name;
          });
        }
        window.customList = temp;
        resolve(data.data.data);
      })
      .catch(error => {
        reject(error);
        console.log(error);
      });
  });
}

window.setCustomList = function(data) {
  localStorage.setItem("data", JSON.stringify(data));
};

function getStockList(arr) {
  let stockSet = new Set();
  arr.forEach(row => {
    row.stocks.forEach(stock => {
      if (stock.stock_code) {
        stockSet.add(stock.stock_code);
      }
    });
  });
  return Array.from(stockSet).map(stock_code => ({ stock_code }));
}

function getProfit(arr, stockArr) {
  arr.forEach(item => {
    let holdProfit = 0,
      totalMoney = 0;
    // 遍历持仓，计算每支股票收益
    item.stocks.forEach(stock => {
      let find = stockArr.find(e => e.stock_code == stock.stock_code);
      if (find) {
        stock.stock_name = find.stockName;
        stock.price = find.stockInfo.stockCurrPrice;
        // 实时持仓收益
        if (stock.price && stock.cost && stock.trans && Number(stock.cost)) {
          stock.money = (Number(stock.price) * Number(stock.trans)).toFixed(2);
          stock.profit = (
            (Number(stock.price) - Number(stock.cost)) *
            Number(stock.trans)
          ).toFixed(2);
          stock.rate = (
            ((Number(stock.price) - Number(stock.cost)) / Number(stock.cost)) *
            100
          ).toFixed(2);
          holdProfit += Number(stock.profit);
          totalMoney += Number(stock.money);
        }
      }
    });
    // 统计个人持仓收益
    item.holdProfit = parseFloat(holdProfit.toFixed(2));

    // 统计个人持仓市值
    item.money = parseFloat(totalMoney.toFixed(2));

    // 今日收益 = 个人实时持仓收益 + 今日清仓收益 - 昨日持仓收益
    item.todayProfit =
      Number(holdProfit) +
      Number(item.clearance_profit) -
      Number(item.yesterday_profit);
    item.todayProfit = parseFloat(item.todayProfit.toFixed(2));

    // 实时累计收益 = 今日收益 + 昨日累计收益
    item.profit = Number(item.todayProfit) + Number(item.total_profit);
    item.profit = parseFloat(item.profit.toFixed(2));
  });
}

function setProfit(arr) {
  let name = localStorage.getItem("name");
  let find = arr.find(item => item.name == name);
  if (name && find) {
    let total = parseInt(find.todayProfit);
    if (total >= 0) {
      setBadge(total.toString(), [255, 102, 102, 255]);
    } else {
      setBadge(total.toString().slice(1), [51, 204, 0, 255]);
    }
  }
}

window.setName = function(name) {
  localStorage.setItem("name", name);
};

// getProfit(window.stockList);
// setInterval(() => {
//   getProfit(window.stockList);
// }, 3000);

// async function test() {
//   await stock.getStockInfo(list);
// }

// test();

async function mainWorker() {
  try {

  // 获取所有人持仓数据 list
  await getCustomList();

  // 去重出所有的股票list
  var stockList = getStockList(window.customList);

  // sina接口获取所有的股票详细信息
  var StockInfoList = await stock.getStockInfo(stockList);
  console.log(StockInfoList);

  // 根据股票详细信息计算持仓利润（今日收益、持仓收益）
  // 清仓后收益应该放在今日收益，需要返回一下当日清仓收益
  getProfit(window.customList, StockInfoList);

  // 右上角显示收益
  setProfit(window.customList);
  } catch (error) {
    console.log(error)
  }
}

function resetProfit() {
  window.customList.forEach(item => {
    item.yesterday_profit = item.holdProfit;
    item.clearance_profit = "0.00";
    // item.total_profit = item.holdProfit;
    item.total_profit = item.profit;
  });

  window.setCustomList(window.customList);
}

function addPerson(name) {
  let len = window.customList.length;
  let person = {
    name,
    header_id: len,
    profit: "0.00",
    todayProfit: "0.00",
    holdProfit: "0.00",
    yesterday_profit: "0.00",
    clearance_profit: "0.00",
    total_profit: "0.00",
    stocks: []
  };
  window.customList.push(person);
  window.setCustomList(window.customList);
}

mainWorker();

// setTimeout(() => {
//   resetProfit();
// }, 2000);

// setTimeout(() => {
//   let a = {
//     name: "猪哥",
//     header_id: 10,
//     profit: "0.00",
//     todayProfit: "0.00",
//     holdProfit: "0.00",
//     yesterday_profit: "0.00",
//     clearance_profit: "0.00",
//     total_profit: "0.00",
//     stocks: []
//   };
//   window.customList.push(a);

// window.customList[1].yesterday_profit = "46281.68";
//   window.customList[9].stocks.pop();
//   window.customList[7].stocks.push({ stock_code: "sh601728" });
//   window.setCustomList(window.customList);
// }, 2000);
setInterval(() => {
  if (stock.isOperation()) {
    mainWorker();
  }
}, 3000);
