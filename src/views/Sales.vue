<template>
  <div class="container">
    <!-- Filter input -->
    <div class="input-group">
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
    <div class="input-group">
      <div class="d-flex">
        <select class="form-control" id="resultDropdown" v-model="selectedItem">
          <option v-for="item in filteredItems" :key="item.id" :value="item.id">
            {{ `${item.display_name} // ${item.batch_num} // ${item.available_quantity} ` }}
          </option>
        </select>
      </div>
    </div>
    <div class="row text-start">
        <div class="col-2">
            <button class="btn btn-primary ml-2" @click="addRecord">添加</button>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <div class="alert alert-danger" role="alert" v-if="errorMsg.length > 0">
                {{ errorMsg }}
            </div>
        </div>
    </div>
    <div class="row text-start" v-if="addedItems.length > 0">
        <div class="col">总数: {{ totalCount }}</div>
        <div class="col">总成本: {{ totalCost }}</div>
        <div class="col">总售价: {{ totalSales }}</div>
    </div>
    <div class="container mt-3">
        <div v-for="ele in addedItems" :key="ele.id" class="card mb-3 p-3">
            <div class="row text-start mb-2">
                <div class="col-8">{{ ele.display_name }}</div>
                <div class="col-4">{{ ele.batch_num }}</div>
            </div>
            <div class="row text-start mb-2">
                <div class="col-4">剩余: {{ ele.available_quantity }}</div>
                <div class="col-4">成本: {{ ((ele.min_unit_cost + ele.max_unit_cost)/ 20000).toFixed(2) }}</div>
                <div class="col-4">出货: {{ getSalesPrice(ele).toFixed(2) }}</div>
            </div>
            <div class="row text-start mb-2">
                <div class="col-4">数量: <input type="number" v-model="ele.saled_quantity" :max="ele.available_quantity" min="1"/></div>
                <div class="col-4">总价: {{ (ele.saled_quantity * getSalesPrice(ele)).toFixed(2)  }}</div>
                <div class="col-4"><button class="btn btn-danger" @click="removeRecord(ele.id)">删除</button></div>
            </div>
        </div>
        <div class="row" v-if="addedItems.length > 0">
            <div class="col">
                <button class="btn btn-primary" @click="copyDescription">
                    复制出货描述
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { fetchStock } from '@/utils/http';
export default {
  name: 'SalesView',
  components: {
    
  },
  data() {
    return {
      filterText: '', // Text input for filtering
      selectedItem: 1, // Currently selected item in the dropdown
      items: [
      ],
      errorMsg:"",
      addedItems: [] // Array to store added items,

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
        return this.addedItems.reduce((sum, item) => sum + item.saled_quantity, 0);
    },
    totalCost() {
        return this.addedItems.reduce((sum, item) => sum + (item.saled_quantity * ((item.min_unit_cost + item.max_unit_cost) / 20000)), 0).toFixed(2);
    },
    totalSales() {
        return this.addedItems.reduce((sum, item) => sum + (item.saled_quantity * this.getSalesPrice(item)), 0).toFixed(2);
    }   
  },
  methods: {
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
    getSalesPrice(ele){
        return (ele.min_expc_sales_price + ele.max_expc_sales_price)/ 20000;
    },
    copyDescription() {
      let description = this.addedItems.map(item => {
        return `${item.display_name}|${item.batch_num}|${item.saled_quantity}|${this.getSalesPrice(item).toFixed(2)}`;
      }).join('\n');
      navigator.clipboard.writeText(description).then(() => {
        alert('出货描述已复制到剪贴板');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  },
  mounted() {
    // Fetch stock data when the component is mounted
    fetchStock().then(response => {
      this.items = response.data.map(item => {
        item.saled_quantity = 1; // Initialize saled_quantity to 1
        return item;
      });
    }).catch(error => {
      console.error('Error fetching stock data:', error);
    });
  }
}
</script>
