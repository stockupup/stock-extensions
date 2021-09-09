<template>
  <div class="main-app">
    <div class="top">
      <span class="top-title">学习小组</span>
      <el-button type="text">更新</el-button>
      <div>
        <el-table :data="tableData" style="width: 100%;" max-height="800">
          <el-table-column prop="name" label="账户" width="100"></el-table-column>
          <el-table-column prop="todayProfit" label="今日收益" align="right" sortable width="120">
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'todayProfit')">{{ row.todayProfit.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="rate" label="今日收益率" align="right" sortable width="120">
            <template slot-scope="{ row }">
              <span :style="calcStyle(row,'rate')">{{ row.rate.toFixed(2) }} %</span>
            </template>
          </el-table-column>
          <el-table-column prop="money" label="市值" align="right" sortable width="120">
            <template slot-scope="{ row }">
              {{ row.money.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="holdProfit" label="持仓收益" align="right" sortable width="120">
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
    </div>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      tableData: []
    };
  },
  methods:{
    calcStyle(row,rowKey) {
      if (row[rowKey] > 0) {
        return "color:rgb(255, 102, 102)";
      } else {
        return "color:rgb(51, 204, 0)";
      }
    }
  },
  created() {
    this.tableData = this.$bg.customList;
    this.tableData.forEach(row=>{
      let rate = Number(row.todayProfit) / (Number(row.money)-Number(row.todayProfit)) * 100
      this.$set(row,'rate',rate)
    })
  }
};
</script>

<style lang="scss" scoped>
.main-app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
  width: 800px;
  margin: 0 auto;
  .top {
    margin-top: 60px;
    .top-title {
      margin-right: 30px;
      font-size: 30px;
      color: gray;
    }
  }
}
</style>
