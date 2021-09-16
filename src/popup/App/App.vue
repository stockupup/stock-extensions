<template>
  <div class="container">
    <div class="top-container">
      <div class="left">
        <h1>
          Stock up up
          <el-button type="text" @click="setMyName">设置名字</el-button>
          <el-button type="text" @click="goDetail">详细表格</el-button>
        </h1>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ command }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="收益总览">收益总览</el-dropdown-item>
            <el-dropdown-item v-for="item in tableData" :key="item.holder_id" :command="item.name">{{ item.name }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="right">
        <h1>
          {{ maxProfit.name }}
          <span style="color:rgb(255, 102, 102)">{{ maxProfit.profit }}</span>
        </h1>
        <h3>今日收益之星</h3>
      </div>
    </div>
    <div class="table-container">
      <div class="table-title">{{ command }}{{ isAll ? "" : "持仓详情" }}</div>
      <div v-show="isAll" style="padding:0 10px;">
        <el-table :data="tableData" style="width: 100%;" max-height="350" @row-click="parentRowClick">
          <el-table-column prop="name" label="账户" width="60"></el-table-column>
          <el-table-column prop="todayProfit" label="今日收益" align="right" sortable width="100">
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'todayProfit')">{{ row.todayProfit.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rate" label="收益率" align="right" sortable width="90">
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'rate')">{{ row.rate.toFixed(2) }} %</span>
            </template>
          </el-table-column>
          <el-table-column prop="holdProfit" label="持仓收益" align="right" sortable width="100">
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'holdProfit')">{{ row.holdProfit.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="累计收益" align="right" sortable>
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'profit')">{{ row.profit.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isAll" style="padding:0 10px;">
        <el-table v-clickoutside="handleOutSide" @header-click="handleOutSide" :data="stocks" style="width: 100%;" max-height="350" @row-click="rowClick">
          <el-table-column prop="singleProfit" label="股票信息" sortable width="100">
            <template slot-scope="{ row, $index }">
              <div v-show="!(clickindex && isNew && clickindex == $index + 1)">{{ row.stock_name }}
                <br />
                <span :style="calcStyle(row,'singleProfit')">{{ row.singleProfit }}</span>
              </div>
              <el-autocomplete width="160" v-show="clickindex && isNew && clickindex == $index + 1" :fetch-suggestions="querySearch" v-model="row.stock_name" :trigger-on-focus="false" @select="handleSelect" size="mini" placeholder="首字母/代码" popper-class="autocomplete"></el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="现价" align="right" width="80">
            <template slot-scope="{ row }">
              <div :style="calcStyle(row,'stockChangeRate')">
                {{ row.price }}
                <br />
                ({{ row.stockChangeRate }}%)
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="成本" align="right" width="80">
            <template slot-scope="{ row, $index }">
              <span v-show="!(clickindex && clickindex == $index + 1)">{{
                row.cost
              }}</span>
              <el-input v-show="clickindex && clickindex == $index + 1" v-model="row.cost" placeholder="输入成本" size="mini"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="trans" label="股数" align="right" width="80">
            <template slot-scope="{ row, $index }">
              <span v-show="!(clickindex && clickindex == $index + 1)">{{
                row.trans
              }}</span>
              <el-input v-show="clickindex && clickindex == $index + 1" v-model="row.trans" placeholder="输入股数" size="mini"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="收益(率)" align="right">
            <template slot-scope="{ row, $index }">
              <el-button type="text" v-show="
                  clickindex && clickindex == $index + 1 && row.stock_code
                " @click="clearStock(row, $index)">
                清仓
              </el-button>
              <div v-show="
                  !(clickindex && clickindex == $index + 1 && row.stock_code) &&
                    row.profit
                " :style="calcStyle(row,'profit')">
                {{ row.profit }}
                <br />
                ({{ row.rate }}%)
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button style="float:right;" type="text" @click="addStock">
          添加
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { stockInfos } from "../stockInfo.js";
import axios from "axios";
import Clickoutside from "element-ui/src/utils/clickoutside";
import { MessageBox } from "element-ui";
export default {
  name: "App",

  components: {},

  directives: { Clickoutside },

  data() {
    return {
      stockInfos: stockInfos,
      // 收益总览表格
      tableData: [],
      // 持仓详情表格
      stocks: [],
      // 点前点击的表格
      clickindex: 0,
      isNew: false,
      command: "收益总览"
    };
  },

  computed: {
    isAll() {
      return this.command == "收益总览";
    },
    maxProfit() {
      let result = { profit: -99999 };
      this.tableData.forEach(item => {
        if (Number(item.todayProfit) > Number(result.profit)) {
          result.profit = item.todayProfit;
          result.name = item.name;
        }
      });

      return result;
    }
  },

  methods: {
    handleOutSide() {
      if(this.stocks[this.clickindex - 1] && this.stocks[this.clickindex - 1].stock_name && this.stocks[this.clickindex - 1].stock_name.length == 8){
        this.stocks[this.clickindex - 1].stock_code = this.stocks[this.clickindex - 1].stock_name
      }
      if (
        this.stocks.length &&
        this.stocks[this.clickindex - 1] &&
        this.stocks[this.clickindex - 1].stock_code
      ) {
        this.updateStock(this.stocks[this.clickindex - 1]);
        this.clickindex = 0;
        this.isNew = false;
      }
    },
    rowClick(row) {
      let index = this.stocks.findIndex(e => e.stock_code == row.stock_code);
      // 点击当前行 退出
      if (this.clickindex == index + 1) {
        return;
      }
      if(this.isNew && this.stocks[this.stocks.length - 1].stock_name.length == 8){
        this.stocks[this.clickindex - 1].stock_code = this.stocks[this.clickindex - 1].stock_name
      }
      // 点击其他行, 最后一行没有选择股票，退出
      if (this.isNew && !this.stocks[this.stocks.length - 1].stock_code) {
        this.stocks.pop();
        this.isNew = false;
        this.clickindex = index + 1;
        return;
      }
      if (this.clickindex != 0) {
        this.updateStock(this.stocks[this.clickindex - 1]);
      }
      this.isNew = false;
      this.clickindex = index + 1;
    },
    // 添加持仓
    addStock() {
      if (
        this.stocks.length &&
        !this.stocks[this.stocks.length - 1].stock_code
      ) {
        return;
      }
      this.stocks.push({});
      this.isNew = true;
      this.clickindex = this.stocks.length;
    },

    // 更新持仓
    async updateStock(row) {
      // this.$bg.setCustomList(this.tableData);
      // 把更新结果告诉后端
      if(!row.holder_id){
        let find = this.tableData.find(row => row.name == this.command)
        row.holder_id = find.holder_id
        row.holder_name = find.holder_name
      }
      return new Promise((resolve, reject) => {
        axios({
          method: "POST",
          url: "http://139.9.181.248/api/v1/stock/update",
          data: {
            currency: "CNY",
            holder_id: row.holder_id,
            holder_name: row.holder_name,
            stock_code: row.stock_code,
            stock_name: row.stock_name,
            cost: row.cost,
            trans: row.trans
          }
        })
          .then(data => {
            resolve(data.msg);
          })
          .catch(error => {
            reject(error);
            console.log(error);
          });
      });
    },

    compuProfit() {
      let info = this.tableData.find(row => row.name == this.command);
      let hold = 0;
      this.stocks.forEach(item => {
        hold += Number(item.profit);
      });
      hold = hold.toFixed(2);
      info.todayProfit = hold;
      info.holdProfit = hold;
    },

    async getStockInfo(list) {
      return new Promise((resolve, reject) => {
        axios({
          method: "GET",
          url: "https://hq.sinajs.cn",
          params: { list }
        })
          .then(data => {
            var stockInfo = undefined;
            var elements = data.data.split(/_|="|,|"/);
            if (elements.length > 5) {
              try {
                stockInfo = {
                  stockName: elements[3],
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
              } catch (e) {
                console.error(e);
                reject(e);
              }
            }

            resolve(stockInfo);
          })
          .catch(error => {
            console.log(error);
          });
      });
    },

    // 清仓
    clearStock(row, index) {
      if (!row.cost || !row.trans) {
        this.stocks.splice(index, 1);
        return;
      }
      MessageBox.prompt("请输入清仓收益", "确认清仓", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          console.log(value);
          // 把清仓结果告诉后端
          return new Promise((resolve, reject) => {
            axios({
              method: "POST",
              url: "http://139.9.181.248/api/v1/stock/clearance",
              data: {
                currency: "CNY",
                holder_id: row.holder_id,
                holder_name: row.holder_name,
                stock_code: row.stock_code,
                stock_name: row.stock_name,
                profit: value
              }
            })
              .then(data => {
                this.stocks.splice(index, 1);
                resolve(data.msg);
              })
              .catch(error => {
                reject(error);
                console.log(error);
              });
          });

          // let info = this.tableData.find(row => row.name == this.command);
          // info.clearance_profit = Number(value) + Number(info.clearance_profit);

          // this.$bg.setCustomList(this.tableData);

          // this.compuProfit();
        })
        .catch(e => {
          console.log(e);
        });
    },

    handleCommand(command) {
      if (command === "收益总览") {
        this.stocks = [];
      } else {
        // 获取个人详细数据
        this.stocks = this.tableData.find(row => row.name == command).stocks;
      }

      this.command = command;
    },

    parentRowClick(row){
      this.stocks = row.stocks;
      this.command = row.name
    },

    handleSelect(item) {
      this.stocks[this.clickindex - 1].stock_name = item.value;
      this.stocks[this.clickindex - 1].stock_code = item.code;
    },

    querySearch(queryString, cb) {
      var results = queryString
        ? this.stockInfos.filter(this.createFilter(queryString))
        : this.stockInfos;
      // 调用 callback 返回建议列表的数据

      results.forEach(e => {
        e.value = e.name;
      });
      cb(results);
    },

    createFilter(queryString) {
      return info => {
        return (
          info.pyname.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          info.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0 ||
          info.code.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },

    calcStyle(row,rowKey) {
      if (row[rowKey] > 0) {
        return "color:rgb(255, 102, 102)";
      } else {
        return "color:rgb(51, 204, 0)";
      }
    },

    setMyName() {
      MessageBox.prompt(
        "名字必须与列表中的名字一样才能匹配到",
        "请输入本人名字",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }
      )
        .then(({ value }) => {
          this.$bg.setName(value);
        })
        .catch(e => {
          console.log(e);
        });
    },

    goDetail() {
      chrome.tabs.create({ url: "options.html" });
    }
  },

  created() {
    // console.log(this.$bg.customList);
    this.tableData = this.$bg.customList;
    this.tableData.forEach(row=>{
      let rate = Number(row.todayProfit) / (Number(row.money)-Number(row.todayProfit)) * 100
      this.$set(row,'rate',rate)
      row.stocks.forEach(stockRow=>{
        let singleProfit = (Number(stockRow.stockChangeAmt) * Number(stockRow.trans)).toFixed(2)
        this.$set(stockRow,'singleProfit',singleProfit)
      })
    })
  }
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
.autocomplete {
  width: auto !important;
}
.container {
  width: 500px;
  height: 550px;
  background: #676767;
  .el-input__inner {
    padding: 0 4px;
  }
  .top-container {
    color: #fff;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 30px 0;
    box-sizing: border-box;
    h1 {
      margin: 8px 0;
    }
    h3 {
      margin: 0;
    }
    .el-dropdown-link {
      cursor: pointer;
      color: #fff;
    }
    .el-icon-arrow-down {
      font-size: 12px;
    }
    .right {
      text-align: right;
    }
  }
  .table-container {
    height: 430px;
    background: #fff;
    color: #747474;
    border-top-right-radius: 18px;
    border-top-left-radius: 18px;
    .table-title {
      padding: 0 30px;
      height: 60px;
      line-height: 60px;
      font-size: 26px;
    }
  }
}
</style>
