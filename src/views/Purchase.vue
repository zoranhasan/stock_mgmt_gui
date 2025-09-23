<template>
  <div class="container py-3" style="background-color: chocolate;">
    <!-- Filter input -->
    <div class="input-group my-3">
      <span class="input-group-text">过滤</span>
      <input 
        type="text" 
        class="form-control" 
        id="filterInput" 
        v-model="filterText" 
        placeholder="输入中文或者拼音首字母" 
      />
    </div>

    <!-- Filtered results dropdown -->
    <div class="input-group my-3">
      <div class="d-flex">
        <select class="form-control" id="resultDropdown" v-model="selectedItem">
          <option v-for="item in filteredItems" :key="item.id" :value="item.id">
            {{ `${item.display_name} ` }}
          </option>
        </select>
      </div>
    </div>
    <div class="row text-start my-3">
      <div class="col-6">
          <input 
            type="date" 
            class="form-control" 
            v-model="purchaseDate" 
            placeholder="选择进货日期"
          /></div>
        <div class="col">
            <button class="btn btn-primary ml-2" @click="addRecord">添加</button>
        </div>
    </div>
    <div class="row my-3" v-if="errorMsg.length > 0">
        <div class="col">
            <div class="alert alert-danger" role="alert">
                {{ errorMsg }}
            </div>
        </div>
    </div>

    
    <div class="row text-center my-3" v-if="addedItems.length > 0">
        <div class="col">总数: {{ totalCount }}</div>
        <div class="col">总成本: {{ totalCost }}</div>
        <div class="col">总售价: {{ totalSales }}</div>
        <div class="col">总毛利率: {{ totalRate}}</div>
    </div>
    <div class="container my-3 px-0">
        <div v-for="ele in addedItems" :key="ele.id" class="card mb-3 p-3">
            <div class="row text-start mb-2">
                <div class="col">{{ ele.display_name }}</div>
            </div>
            <div class="row text-start mb-2">
                <div class="col-4">进货价: <input type="number" v-model="ele.unit_price" min="0" step="0.01"/></div>
                <div class="col-4">出货价: <input type="number" v-model="ele.sales_price" min="0" step="0.01"/></div>
                <div class="col-4">数量: <input type="number" v-model="ele.quantity" min="1"/></div>
            </div>
            <div class="row text-start mb-2">
                <div class="col-4">毛利率: {{ getRate(ele)}}</div>
                <div class="col-4">总价: {{ (ele.quantity * ele.unit_price).toFixed(2)  }}</div>
                <div class="col-4"><button class="btn btn-danger" @click="removeRecord(ele.id)">删除</button></div>
            </div>
            <div class="row text-start mb-2">
                <div class="col">上批: {{ ele.last_batch_num }}</div>
                <div class="col">批号: {{ getBatchNum(ele)}}</div>
            </div>
        </div>
        <div class="row" v-if="addedItems.length > 0">
            <div class="col">
                <button class="btn btn-primary" @click="copyDescription">
                    只复制进货描述
                </button>
            </div>
            <div class="col" v-if="descriptionCopied">
                <button class="btn btn-primary" @click="createPurchase">
                    入库
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { apiFetchAllGoods, apiFetchPurchaseDetails, apiCreatePurchase } from '@/utils/http';
export default {
  name: 'SalesView',
  components: {
    
  },
  data() {
    return {
      purchaseDate: new Date().toISOString().split('T')[0], // Default to today's date
      filterText: '', // Text input for filtering
      selectedItem: 1, // Currently selected item in the dropdown
      items: [],
      errorMsg:"",
      addedItems: [], // Array to store added items,
      descriptionCopied: false
    };
  },
  computed: {
    filteredItems() {
      let result = this.items.filter(item =>
        item.display_name.toString().toLowerCase().includes(this.filterText.toLowerCase()) || item.pronunciation.toString().toLowerCase().includes(this.filterText.toLowerCase())
      );
      if (result.length > 0) {
        // If no results, return a single "No results found" item
        this.selectedItem = result[0].id;
      }
      return result;
    },
    totalCount(){
        return this.addedItems.reduce((sum, item) => sum + item.quantity, 0);
    },
    totalCost() {
        return this.addedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2);
    },
    totalSales() {
        return this.addedItems.reduce((sum, item) => sum + (item.quantity * item.sales_price), 0).toFixed(2);
    },
    totalRate(){
      return this.totalSales == 0 ? "0%" : ((this.totalSales - this.totalCost)/this.totalSales * 100).toFixed(2) + "%"
    },
    purchaseDescription() {
      let description = this.addedItems.map(item => {
        return `${item.id}|${item.display_name}|${item.batch_num}|${item.quantity}|${item.unit_price.toFixed(2)}|${item.sales_price.toFixed(2)}`;
      }).join('\n');
      description += `\n 总数: ${this.totalCount} | 总成本: ${this.totalCost} | 总售价: ${this.totalSales} | 日期: ${this.purchaseDate} | 总毛利率: ${this.totalRate} `;
      return description;
    }
  },
  methods: {
    getBatchNum(ele){
        const strYear = this.purchaseDate.split('-')[0];
        const strMonth = this.purchaseDate.split('-')[1];
        const strDay = this.purchaseDate.split('-')[2];
        if(ele.last_batch_num.startsWith(strYear + strMonth + strDay)){
            const seq = parseInt(ele.last_batch_num.slice(8)) + 1;
            ele.batch_num = `${strYear}${strMonth}${strDay}${seq.toString().padStart(3, '0')}`;
        }else{
            ele.batch_num = `${strYear}${strMonth}${strDay}${"1".padStart(3, '0')}`;
        }        
        return ele.batch_num;
    },
    addRecord() {
        console.log(this.addedItems);
        const targetItem = this.items[this.selectedItem - 1];
        for(let i = 0; i < this.addedItems.length; i++) {
            if (this.addedItems[i].id === targetItem.id) {
                this.errorMsg = "已添加过该产品";
                return;
            }
        }
        this.addedItems.push(targetItem);      
    },
    removeRecord(id) {
      this.addedItems = this.addedItems.filter(item => item.id !== id);
    },
    getRate(ele){
        if(ele.sales_price <= 0) return "0%";
        return (((ele.sales_price - ele.unit_price) / ele.sales_price) * 100).toFixed(2) + "%";
    },
    // getSalesPrice(ele){
    //     return (ele.min_expc_sales_price + ele.max_expc_sales_price)/ 20000;
    // },
    copyDescription() {      
      navigator.clipboard.writeText(this.purchaseDescription).then(() => {
        alert('进货描述已复制到剪贴板');
        this.descriptionCopied = true;
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    },
    createPurchase() {
      if (this.addedItems.length === 0) {
        this.errorMsg = "请添加进货商品";
        return;
      }


      if(confirm(`确认入库吗？请详细核对以下进货信息\n${this.purchaseDescription}`)) {
        this.purchaseData = {
          "purchase_date": this.purchaseDate,
          "remarks": "From Web Portal",
          "details": this.addedItems.map(item => ({
            goods: item.id,
            batch_num: item.batch_num,
            quantity: item.quantity,
            unit_price: item.unit_price * 10000,
            sales_price: item.sales_price * 10000,
            inventory:1
          }))
        }
        apiCreatePurchase(this.purchaseData).then(response => {
            alert('库存已成功增加');
            this.addedItems = []; // Clear added items after successful sale
            this.errorMsg = ""; // Clear error message
            this.refreshGoodsList();
            this.descriptionCopied = false;
          })
          .catch(error => {
            console.error('Error creating purhcase:', error);
            this.errorMsg = "入库失败，请稍后再试";
          });
      } else {
        this.errorMsg = "操作已取消"; 
      }
    },
    refreshGoodsList(){      
      apiFetchPurchaseDetails().then(response => {
        // response.data is assumed to be an array
        const arr = response.data;
        // Map to store the largest batch_num for each goods_id
        const goodsMap = {};
        arr.forEach(item => {
          const id = item.goods;
          if (!goodsMap[id] || item.batch_num > goodsMap[id].batch_num) {
            goodsMap[id] = item;
          }
        });
        // Now goodsMap has the item with the largest batch_num for each goods_id
        // You can extract unit_price and sales_price as needed:
        const latestPrices = Object.values(goodsMap).map(item => ({
          goods_id: item.goods,
          unit_price: item.unit_price/10000,
          sales_price: item.sales_price/10000,
          last_batch_num: item.batch_num,
          quantity: item.quantity
        }));
        // Use latestPrices as needed, e.g., pass to next promise
        return new Promise((resolve, reject) => {
          apiFetchAllGoods().then(resp => {
            // Merge latestPrices into response2 as needed
            resolve(resp.data.map(value => {
              const priceInfo = latestPrices.find(p => p.goods_id === value.id);
              return priceInfo ? { ...value, ...priceInfo } : { ...value, ...{
                unit_price: 0,
                sales_price: 0,
                quantity: 1,
                last_batch_num: "N/A"
              }};
            }));
          }).catch(reject);
        });
      }).then(result => {
        // result: { allGoods, latestPrices }
        // You can merge or use as needed. Here, just set items to allGoods
        this.items = result;
      }).catch(error => {
        console.error('Error fetching goods data:', error);
      });
    }
  },
  mounted() {
    this.refreshGoodsList();
  }
}
</script>
