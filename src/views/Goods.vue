<template>
  <div class="container py-3 goods-page">
    <div class="card p-3 mb-4 text-start">
      <h3 class="mb-3">创建商品</h3>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label" for="goodsId">ID</label>
          <input
            id="goodsId"
            type="number"
            class="form-control"
            :value="form.id ?? ''"
            placeholder="下一个可用 ID"
            readonly
          />
        </div>
        <div class="col-md-3">
          <label class="form-label" for="brandSelect">品牌</label>
          <select id="brandSelect" class="form-control" v-model.number="form.brandId" @change="syncNextAvailableId">
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label" for="goodsName">商品全名</label>
          <input
            id="goodsName"
            type="text"
            class="form-control"
            v-model.trim="form.goodsName"
            placeholder="输入商品名称"
          />
        </div>
        <div class="col-md-3">
          <label class="form-label" for="goodsCode">编码</label>
          <input
            id="goodsCode"
            type="text"
            class="form-control"
            v-model.trim="form.code"
            placeholder="输入编码"
          />
        </div>
        <div class="col-md-3">
          <label class="form-label" for="goodsModel">型号</label>
          <input
            id="goodsModel"
            type="text"
            class="form-control"
            v-model.trim="form.model"
            placeholder="输入型号"
          />
        </div>
      </div>

      <div class="row mt-3">
        <div class="col">
          <div class="alert alert-secondary mb-0" role="alert">
            预览名称: {{ composedName || '请先填写商品信息' }}
          </div>
        </div>
      </div>

      <div class="row mt-3" v-if="errorMsg">
        <div class="col">
          <div class="alert alert-danger mb-0" role="alert">{{ errorMsg }}</div>
        </div>
      </div>

      <div class="row mt-3" v-if="successMsg">
        <div class="col">
          <div class="alert alert-success mb-0" role="alert">{{ successMsg }}</div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-auto">
          <button class="btn btn-primary" @click="createGoods">创建商品</button>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-primary" @click="createGoodsAndCopy">创建并复制</button>
        </div>
      </div>
    </div>

    <div class="card p-3 text-start">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">商品列表</h3>
        <button class="btn btn-outline-secondary btn-sm" @click="refreshGoodsList">刷新</button>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <input
            type="text"
            class="form-control"
            v-model.trim="filterText"
            placeholder="按名称、编码或型号过滤"
          />
        </div>
      </div>
      <div v-if="filteredGoods.length === 0" class="text-muted">暂无商品</div>
      <div v-else class="table-responsive">
        <table class="table table-striped align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">显示名称</th>
              <th scope="col">编码</th>
              <th scope="col">型号</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredGoods" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.display_name }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.model }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { apiCreateGoods, apiFetchAllGoods } from '@/utils/http';

export default {
  name: 'GoodsView',
  data() {
    return {
      brands: [
        { id: 0, name: '北京协和' },
        { id: 1, name: '韩愢' },
        { id: 2, name: '特一' },
        { id: 3, name: '色炫彩驿站' }
      ],
      form: {
        id: 0,
        brandId: 0,
        goodsName: '',
        code: '',
        model: ''
      },
      goodsList: [],
      filterText: '',
      errorMsg: '',
      successMsg: ''
    };
  },
  computed: {
    selectedBrandName() {
      const targetBrand = this.brands.find(brand => brand.id === this.form.brandId);
      return targetBrand ? targetBrand.name : '';
    },
    composedName() {
      const brandName = this.selectedBrandName;
      const goodsName = this.form.goodsName || '';
      const code = this.form.code || '';
      const model = this.form.model || '';

      if (this.form.brandId === 0) {
        let result = goodsName;
        if (code) {
          result += ` [${code}]`;
        }
        if (model) {
          result += ` (${model})`;
        }
        return result.trim();
      }

      if (this.form.brandId === 1) {
        const prefix = model ? `[${brandName}](${model})` : `[${brandName}]`;
        return `${prefix}${goodsName}`.trim();
      }

      if (this.form.brandId === 2) {
        const prefix = code ? `[${brandName}](${code})` : `[${brandName}]`;
        return `${prefix}${goodsName}${model ? ` ${model}` : ''}`.trim();
      }

      if (this.form.brandId === 3) {
        return `[${brandName}]${goodsName}`.trim();
      }

      return goodsName.trim();
    },
    filteredGoods() {
      const keyword = this.filterText.toLowerCase();
      if (!keyword) {
        return this.goodsList;
      }
      return this.goodsList.filter(item => {
        return [item.display_name, item.code, item.model]
          .filter(Boolean)
          .some(value => value.toString().toLowerCase().includes(keyword));
      });
    }
  },
  methods: {
    getNextAvailableId(brandId) {
      const brandBase = brandId * 1000;
      const brandMax = brandBase + 999;
      const usedIds = this.goodsList
        .map(item => Number(item.id))
        .filter(id => Number.isInteger(id) && id >= brandBase && id <= brandMax);

      if (usedIds.length === 0) {
        return brandBase;
      }

      const nextId = Math.max(...usedIds) + 1;
      return nextId <= brandMax ? nextId : null;
    },
    syncNextAvailableId() {
      this.form.id = this.getNextAvailableId(this.form.brandId);
    },
    refreshGoodsList() {
      apiFetchAllGoods().then(response => {
        this.goodsList = response.data;
        this.syncNextAvailableId();
      }).catch(error => {
        console.error('Error fetching goods:', error);
        this.errorMsg = '商品列表加载失败，请稍后再试';
      });
    },
    resetForm() {
      this.form = {
        id: this.getNextAvailableId(0),
        brandId: 0,
        goodsName: '',
        code: '',
        model: ''
      };
    },
    createGoods(keepInputs = false) {
      const enforcedId = this.getNextAvailableId(this.form.brandId);

      if (enforcedId === null || enforcedId === undefined) {
        this.errorMsg = '当前品牌的商品 ID 已用完';
        this.successMsg = '';
        return;
      }

      const expectedBase = this.form.brandId * 1000;
      const expectedMax = expectedBase + 999;
      if (enforcedId < expectedBase || enforcedId > expectedMax) {
        this.errorMsg = `商品 ID 必须在 ${expectedBase} 到 ${expectedMax} 之间`;
        this.successMsg = '';
        return;
      }

      this.form.id = enforcedId;

      if (!this.form.goodsName) {
        this.errorMsg = '请填写商品全名';
        this.successMsg = '';
        return;
      }

      if (!this.composedName) {
        this.errorMsg = '商品名称格式无效';
        this.successMsg = '';
        return;
      }

      this.errorMsg = '';
      this.successMsg = '';

      const payload = {
        id: enforcedId,
        name: this.composedName,
        code: this.form.code,
        model: this.form.model,
        category: 1,
        subcategory: 1,
        barcode: null,
        display_name: this.composedName,
        remarks: null
      };

      apiCreateGoods(payload).then(() => {
        this.successMsg = '商品创建成功';
        if (keepInputs) {
          this.form.id = enforcedId;
        } else {
          this.resetForm();
        }
        this.refreshGoodsList();
      }).catch(error => {
        console.error('Error creating goods:', error);
        this.errorMsg = '商品创建失败，请稍后再试';
      });
    },
    createGoodsAndCopy() {
      this.createGoods(true);
    }
  },
  mounted() {
    this.refreshGoodsList();
  }
}
</script>

<style scoped>
.goods-page {
  background-color: #f3efe6;
  min-height: 100%;
}
</style>